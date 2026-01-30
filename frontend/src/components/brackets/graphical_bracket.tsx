import { Box, Title } from '@mantine/core';
import { parseISO } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SWRResponse } from 'swr';

import MatchModal from '@components/modals/match_modal';
import { formatTime, Time } from '@components/utils/datetime';
import { formatMatchInput1, formatMatchInput2 } from '@components/utils/match';
import { TournamentMinimal } from '@components/utils/tournament';
import {
  MatchWithDetails,
  RoundWithMatches,
  StageItemWithRounds,
  StagesWithStageItemsResponse,
  UpcomingMatchesResponse,
} from '@openapi';
import { getMatchLookup, getStageItemLookup } from '@services/lookups';
import classes from './graphical_bracket.module.css';

type BracketPosition = 'WINNERS' | 'LOSERS' | 'GRAND_FINALS' | 'NONE';

interface RoundWithMatchesExtended extends RoundWithMatches {
  bracket_position?: BracketPosition;
}

interface TimeGridColumn {
  type: 'time-label' | 'round' | 'grand-finals';
  winnersRound?: RoundWithMatches;
  losersRound?: RoundWithMatches;
  grandFinalsRound?: RoundWithMatches;
}

interface TimeGridCellEntry {
  match: MatchWithDetails;
  round: RoundWithMatches;
}

interface TimeGridCell {
  col: number;
  row: number;
  entries: TimeGridCellEntry[];
}

interface TimeGridData {
  columns: TimeGridColumn[];
  timeSlots: Array<{ time: string }>;
  hasUnscheduled: boolean;
  cells: TimeGridCell[];
}

// Losers round 1 shares a column with winners round 2
const LOSERS_COLUMN_OFFSET = 1;

function buildTimeGrid(
  winnersRounds: RoundWithMatches[],
  losersRounds: RoundWithMatches[],
  grandFinalsRounds: RoundWithMatches[]
): TimeGridData | null {
  const allRounds = [
    ...winnersRounds.map((r) => ({ round: r, bracket: 'winners' as const })),
    ...losersRounds.map((r) => ({ round: r, bracket: 'losers' as const })),
    ...grandFinalsRounds.map((r) => ({ round: r, bracket: 'grand-finals' as const })),
  ];

  // Collect all unique start_times
  const timeSet = new Set<string>();
  let winnersHasTimes = false;
  let losersHasTimes = false;

  for (const { round, bracket } of allRounds) {
    for (const match of round.matches) {
      if (match.start_time) {
        timeSet.add(match.start_time);
        if (bracket === 'winners') winnersHasTimes = true;
        if (bracket === 'losers') losersHasTimes = true;
      }
    }
  }

  // Fallback if no cross-bracket alignment is possible
  if (!winnersHasTimes || !losersHasTimes) {
    return null;
  }

  // Sort unique times chronologically
  const sortedTimes = Array.from(timeSet).sort(
    (a, b) => parseISO(a).getTime() - parseISO(b).getTime()
  );

  const timeSlots = sortedTimes.map((time) => ({ time }));
  const timeIndex = new Map(sortedTimes.map((t, i) => [t, i]));

  // Build overlapping column layout:
  //   Col 0: time/section label
  //   Winners rounds at cols 1, 2, …, N
  //   Losers rounds at cols 1+OFFSET, 2+OFFSET, … (so LR1 shares col with WR2)
  //   Grand finals after the last round column
  const winnersColStart = 1;
  const losersColStart = winnersColStart + LOSERS_COLUMN_OFFSET;

  const maxRoundCol = Math.max(
    winnersRounds.length > 0 ? winnersColStart + winnersRounds.length - 1 : 0,
    losersRounds.length > 0 ? losersColStart + losersRounds.length - 1 : 0
  );

  const columns: TimeGridColumn[] = [{ type: 'time-label' }];

  for (let c = 1; c <= maxRoundCol; c++) {
    const col: TimeGridColumn = { type: 'round' };
    const wIdx = c - winnersColStart;
    if (wIdx >= 0 && wIdx < winnersRounds.length) {
      col.winnersRound = winnersRounds[wIdx];
    }
    const lIdx = c - losersColStart;
    if (lIdx >= 0 && lIdx < losersRounds.length) {
      col.losersRound = losersRounds[lIdx];
    }
    columns.push(col);
  }

  for (const round of grandFinalsRounds) {
    columns.push({ type: 'grand-finals', grandFinalsRound: round });
  }

  // Map round IDs to column indices
  const roundColIndex = new Map<number, number>();
  columns.forEach((col, idx) => {
    if (col.winnersRound) roundColIndex.set(col.winnersRound.id, idx);
    if (col.losersRound) roundColIndex.set(col.losersRound.id, idx);
    if (col.grandFinalsRound) roundColIndex.set(col.grandFinalsRound.id, idx);
  });

  // Group matches into cells: (col, row) -> entries
  const cellMap = new Map<string, TimeGridCellEntry[]>();
  let hasUnscheduled = false;

  for (const { round } of allRounds) {
    const colIdx = roundColIndex.get(round.id);
    if (colIdx === undefined) continue;

    for (const match of round.matches) {
      let rowIdx: number;
      if (match.start_time && timeIndex.has(match.start_time)) {
        rowIdx = timeIndex.get(match.start_time)!;
      } else {
        rowIdx = sortedTimes.length;
        hasUnscheduled = true;
      }

      const key = `${colIdx}:${rowIdx}`;
      const existing = cellMap.get(key);
      if (existing) {
        existing.push({ match, round });
      } else {
        cellMap.set(key, [{ match, round }]);
      }
    }
  }

  const cells: TimeGridCell[] = [];
  for (const [key, entries] of cellMap) {
    const [col, row] = key.split(':').map(Number);
    cells.push({ col, row, entries });
  }

  return { columns, timeSlots, hasUnscheduled, cells };
}

function MatchBox({
  match,
  round,
  tournamentData,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  readOnly,
}: {
  match: MatchWithDetails;
  round: RoundWithMatches;
  tournamentData: TournamentMinimal;
  swrStagesResponse: SWRResponse<StagesWithStageItemsResponse>;
  swrUpcomingMatchesResponse: SWRResponse<UpcomingMatchesResponse> | null;
  readOnly: boolean;
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const stageItemsLookup = getStageItemLookup(swrStagesResponse);
  const matchesLookup = getMatchLookup(swrStagesResponse);

  const team1Label = formatMatchInput1(t, stageItemsLookup, matchesLookup, match);
  const team2Label = formatMatchInput2(t, stageItemsLookup, matchesLookup, match);

  const team1Wins = match.stage_item_input1_score > match.stage_item_input2_score;
  const team2Wins = match.stage_item_input2_score > match.stage_item_input1_score;

  const isBye = !team1Label || !team2Label || team1Label === 'TBD' || team2Label === 'TBD';

  const handleClick = () => {
    if (!readOnly) {
      setOpened(true);
    }
  };

  return (
    <>
      <div
        className={`${classes.matchBox} ${readOnly ? classes.matchBoxReadOnly : ''} ${isBye ? classes.byeMatch : ''}`}
        onClick={handleClick}
      >
        {match.start_time && (
          <div className={classes.matchTime}>
            {match.court?.name && `${match.court.name} | `}
            <Time datetime={match.start_time} />
          </div>
        )}
        <div className={`${classes.team} ${classes.teamTop} ${team1Wins ? classes.teamWinner : ''}`}>
          <span className={classes.teamName}>{team1Label || 'BYE'}</span>
          <span className={classes.teamScore}>{match.stage_item_input1_score}</span>
        </div>
        <div className={classes.teamDivider} />
        <div
          className={`${classes.team} ${classes.teamBottom} ${team2Wins ? classes.teamWinner : ''}`}
        >
          <span className={classes.teamName}>{team2Label || 'BYE'}</span>
          <span className={classes.teamScore}>{match.stage_item_input2_score}</span>
        </div>
      </div>
      {!readOnly && (
        <MatchModal
          swrStagesResponse={swrStagesResponse}
          swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
          tournamentData={tournamentData}
          match={match}
          opened={opened}
          setOpened={setOpened}
          round={round}
        />
      )}
    </>
  );
}

function BracketRound({
  round,
  roundIndex,
  totalRounds,
  tournamentData,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  readOnly,
  alignEnd,
}: {
  round: RoundWithMatches;
  roundIndex: number;
  totalRounds: number;
  tournamentData: TournamentMinimal;
  swrStagesResponse: SWRResponse<StagesWithStageItemsResponse>;
  swrUpcomingMatchesResponse: SWRResponse<UpcomingMatchesResponse> | null;
  readOnly: boolean;
  alignEnd?: boolean;
}) {
  // Calculate spacing multiplier based on round (doubles each round for proper bracket alignment)
  const spacingMultiplier = Math.pow(2, roundIndex);
  const matchSpacing = 60 * spacingMultiplier;

  return (
    <div className={classes.round}>
      <div className={classes.roundTitle}>{round.name}</div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${matchSpacing}px`,
          ...(alignEnd
            ? { paddingBottom: `${(matchSpacing - 60) / 2}px` }
            : { paddingTop: `${(matchSpacing - 60) / 2}px` }),
        }}
      >
        {round.matches.map((match) => (
          <div key={match.id} className={classes.matchWrapper}>
            <MatchBox
              match={match}
              round={round}
              tournamentData={tournamentData}
              swrStagesResponse={swrStagesResponse}
              swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
              readOnly={readOnly}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketSection({
  title,
  rounds,
  tournamentData,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  readOnly,
  className,
  alignEnd,
}: {
  title: string;
  rounds: RoundWithMatches[];
  tournamentData: TournamentMinimal;
  swrStagesResponse: SWRResponse<StagesWithStageItemsResponse>;
  swrUpcomingMatchesResponse: SWRResponse<UpcomingMatchesResponse> | null;
  readOnly: boolean;
  className?: string;
  alignEnd?: boolean;
}) {
  if (rounds.length === 0) {
    return null;
  }

  return (
    <Box className={className}>
      <Title order={4} className={classes.sectionTitle}>
        {title}
      </Title>
      <div className={classes.bracketContainer}>
        <div className={`${classes.bracket} ${alignEnd ? classes.bracketAlignEnd : ''}`}>
          {rounds.map((round, index) => (
            <BracketRound
              key={round.id}
              round={round}
              roundIndex={index}
              totalRounds={rounds.length}
              tournamentData={tournamentData}
              swrStagesResponse={swrStagesResponse}
              swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
              readOnly={readOnly}
              alignEnd={alignEnd}
            />
          ))}
        </div>
      </div>
    </Box>
  );
}

function TimeAlignedBracket({
  gridData,
  tournamentData,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  readOnly,
}: {
  gridData: TimeGridData;
  tournamentData: TournamentMinimal;
  swrStagesResponse: SWRResponse<StagesWithStageItemsResponse>;
  swrUpcomingMatchesResponse: SWRResponse<UpcomingMatchesResponse> | null;
  readOnly: boolean;
}) {
  const { t } = useTranslation();
  const { columns, timeSlots, hasUnscheduled, cells } = gridData;

  // Grid column sizes: auto for label column, 200px per round column
  const colSizes = columns
    .map((c) => (c.type === 'time-label' ? 'auto' : '200px'))
    .join(' ');

  // Row 1: winners round headers, Row 2: losers round headers, Row 3+: time slots
  const headerRows = 2;
  const totalTimeRows = timeSlots.length + (hasUnscheduled ? 1 : 0);
  const rowSizes = `auto auto repeat(${totalTimeRows}, minmax(80px, auto))`;

  return (
    <div
      className={classes.timeAlignedGrid}
      style={{
        gridTemplateColumns: colSizes,
        gridTemplateRows: rowSizes,
      }}
    >
      {/* Row 1: Winners bracket label + winners round headers + GF */}
      <div
        className={classes.sectionTitleCell}
        style={{ gridColumn: 1, gridRow: 1 }}
      >
        {t('winners_bracket')}
      </div>
      {columns.map((col, idx) => {
        const label = col.winnersRound?.name ?? col.grandFinalsRound?.name;
        if (!label) return null;
        return (
          <div
            key={`wh-${idx}`}
            className={classes.roundHeaderCell}
            style={{ gridColumn: idx + 1, gridRow: 1 }}
          >
            {label}
          </div>
        );
      })}

      {/* Row 2: Losers bracket label + losers round headers */}
      <div
        className={classes.sectionTitleCell}
        style={{ gridColumn: 1, gridRow: 2 }}
      >
        {t('losers_bracket')}
      </div>
      {columns.map((col, idx) => {
        if (!col.losersRound) return null;
        return (
          <div
            key={`lh-${idx}`}
            className={classes.roundHeaderCell}
            style={{ gridColumn: idx + 1, gridRow: 2 }}
          >
            {col.losersRound.name}
          </div>
        );
      })}

      {/* Time slot rows: time labels */}
      {timeSlots.map((slot, slotIdx) => (
        <div
          key={`time-${slotIdx}`}
          className={classes.timeLabel}
          style={{ gridColumn: 1, gridRow: slotIdx + headerRows + 1 }}
        >
          {formatTime(slot.time)}
        </div>
      ))}

      {/* Unscheduled row time label */}
      {hasUnscheduled && (
        <div
          className={classes.timeLabel}
          style={{ gridColumn: 1, gridRow: timeSlots.length + headerRows + 1 }}
        >
          —
        </div>
      )}

      {/* Match cells */}
      {cells.map((cell) => (
        <div
          key={`cell-${cell.col}-${cell.row}`}
          className={classes.gridMatchCell}
          style={{ gridColumn: cell.col + 1, gridRow: cell.row + headerRows + 1 }}
        >
          {cell.entries.map((entry) => (
            <MatchBox
              key={entry.match.id}
              match={entry.match}
              round={entry.round}
              tournamentData={tournamentData}
              swrStagesResponse={swrStagesResponse}
              swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
              readOnly={readOnly}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function GraphicalBracket({
  stageItem,
  tournamentData,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  readOnly,
}: {
  stageItem: StageItemWithRounds;
  tournamentData: TournamentMinimal;
  swrStagesResponse: SWRResponse<StagesWithStageItemsResponse>;
  swrUpcomingMatchesResponse: SWRResponse<UpcomingMatchesResponse> | null;
  readOnly: boolean;
}) {
  const { t } = useTranslation();

  const filterRoundsByBracketPosition = (position: BracketPosition): RoundWithMatches[] => {
    return stageItem.rounds
      .filter((r) => (r as RoundWithMatchesExtended).bracket_position === position)
      .sort((r1, r2) => (r1.name > r2.name ? 1 : -1));
  };

  const winnersRounds = filterRoundsByBracketPosition('WINNERS');
  const losersRounds = filterRoundsByBracketPosition('LOSERS');
  const grandFinalsRounds = filterRoundsByBracketPosition('GRAND_FINALS');

  // For single elimination (no bracket positions set), show all rounds as one bracket
  const noneRounds = filterRoundsByBracketPosition('NONE');
  const isSingleElimination =
    noneRounds.length > 0 &&
    winnersRounds.length === 0 &&
    losersRounds.length === 0 &&
    grandFinalsRounds.length === 0;

  if (isSingleElimination) {
    return (
      <BracketSection
        title={t('bracket')}
        rounds={noneRounds}
        tournamentData={tournamentData}
        swrStagesResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        readOnly={readOnly}
      />
    );
  }

  const timeGridData = buildTimeGrid(winnersRounds, losersRounds, grandFinalsRounds);
  if (timeGridData) {
    return (
      <TimeAlignedBracket
        gridData={timeGridData}
        tournamentData={tournamentData}
        swrStagesResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        readOnly={readOnly}
      />
    );
  }

  return (
    <div className={classes.doubleEliminationLayout}>
      <BracketSection
        className={classes.winnersSection}
        title={t('winners_bracket')}
        rounds={winnersRounds}
        tournamentData={tournamentData}
        swrStagesResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        readOnly={readOnly}
      />

      <BracketSection
        className={classes.losersSection}
        title={t('losers_bracket')}
        rounds={losersRounds}
        tournamentData={tournamentData}
        swrStagesResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        readOnly={readOnly}
        alignEnd
      />

      {grandFinalsRounds.length > 0 && (
        <BracketSection
          className={classes.grandFinalsSection}
          title={t('grand_finals')}
          rounds={grandFinalsRounds}
          tournamentData={tournamentData}
          swrStagesResponse={swrStagesResponse}
          swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}
