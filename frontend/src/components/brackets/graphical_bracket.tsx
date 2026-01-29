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
  type: 'time-label' | 'winners' | 'separator' | 'losers' | 'grand-finals';
  round?: RoundWithMatches;
  label: string;
}

interface TimeGridCell {
  col: number;
  row: number;
  matches: MatchWithDetails[];
  round: RoundWithMatches;
}

interface TimeGridData {
  columns: TimeGridColumn[];
  timeSlots: Array<{ time: string }>;
  hasUnscheduled: boolean;
  cells: TimeGridCell[];
}

function buildTimeGrid(
  winnersRounds: RoundWithMatches[],
  losersRounds: RoundWithMatches[],
  grandFinalsRounds: RoundWithMatches[]
): TimeGridData | null {
  const allRoundsWithBracket: Array<{
    round: RoundWithMatches;
    bracket: 'winners' | 'losers' | 'grand-finals';
  }> = [
    ...winnersRounds.map((r) => ({ round: r, bracket: 'winners' as const })),
    ...losersRounds.map((r) => ({ round: r, bracket: 'losers' as const })),
    ...grandFinalsRounds.map((r) => ({ round: r, bracket: 'grand-finals' as const })),
  ];

  // Collect all unique start_times
  const timeSet = new Set<string>();
  let winnersHasTimes = false;
  let losersHasTimes = false;

  for (const { round, bracket } of allRoundsWithBracket) {
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

  // Build columns: time-label, winners rounds, separator, losers rounds, grand finals
  const columns: TimeGridColumn[] = [{ type: 'time-label', label: '' }];

  for (const round of winnersRounds) {
    columns.push({ type: 'winners', round, label: round.name });
  }

  columns.push({ type: 'separator', label: '' });

  for (const round of losersRounds) {
    columns.push({ type: 'losers', round, label: round.name });
  }

  for (const round of grandFinalsRounds) {
    columns.push({ type: 'grand-finals', round, label: round.name });
  }

  // Build a lookup from round id to column index
  const roundColIndex = new Map<number, number>();
  columns.forEach((col, idx) => {
    if (col.round) {
      roundColIndex.set(col.round.id, idx);
    }
  });

  // Group matches into cells: (col, row) -> matches
  const cellMap = new Map<string, { matches: MatchWithDetails[]; round: RoundWithMatches }>();
  let hasUnscheduled = false;

  for (const { round } of allRoundsWithBracket) {
    const colIdx = roundColIndex.get(round.id);
    if (colIdx === undefined) continue;

    for (const match of round.matches) {
      let rowIdx: number;
      if (match.start_time && timeIndex.has(match.start_time)) {
        rowIdx = timeIndex.get(match.start_time)!;
      } else {
        // Unscheduled matches go to an extra row at the bottom
        rowIdx = sortedTimes.length;
        hasUnscheduled = true;
      }

      const key = `${colIdx}:${rowIdx}`;
      const existing = cellMap.get(key);
      if (existing) {
        existing.matches.push(match);
      } else {
        cellMap.set(key, { matches: [match], round });
      }
    }
  }

  const cells: TimeGridCell[] = [];
  for (const [key, value] of cellMap) {
    const [col, row] = key.split(':').map(Number);
    cells.push({ col, row, matches: value.matches, round: value.round });
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

  // Compute column spans for section titles
  const winnersColIndices = columns
    .map((c, i) => (c.type === 'winners' ? i : -1))
    .filter((i) => i >= 0);
  const losersColIndices = columns
    .map((c, i) => (c.type === 'losers' ? i : -1))
    .filter((i) => i >= 0);
  const gfColIndices = columns
    .map((c, i) => (c.type === 'grand-finals' ? i : -1))
    .filter((i) => i >= 0);

  // Grid column sizes: 60px for time label, 200px per round, 24px separator
  const colSizes = columns
    .map((c) => {
      if (c.type === 'time-label') return '60px';
      if (c.type === 'separator') return '24px';
      return '200px';
    })
    .join(' ');

  const totalTimeRows = timeSlots.length + (hasUnscheduled ? 1 : 0);
  const rowSizes = `auto auto repeat(${totalTimeRows}, minmax(80px, auto))`;

  // Row offsets: row 0 = section titles, row 1 = round headers, row 2+ = time slots
  const headerRows = 2;

  // Build a lookup for cells by (col, row)
  const cellLookup = new Map<string, TimeGridCell>();
  for (const cell of cells) {
    cellLookup.set(`${cell.col}:${cell.row}`, cell);
  }

  return (
    <div
      className={classes.timeAlignedGrid}
      style={{
        gridTemplateColumns: colSizes,
        gridTemplateRows: rowSizes,
      }}
    >
      {/* Row 1: Section titles */}
      {winnersColIndices.length > 0 && (
        <div
          className={classes.sectionTitleCell}
          style={{
            gridColumn: `${winnersColIndices[0] + 1} / ${winnersColIndices[winnersColIndices.length - 1] + 2}`,
            gridRow: 1,
          }}
        >
          {t('winners_bracket')}
        </div>
      )}
      {losersColIndices.length > 0 && (
        <div
          className={classes.sectionTitleCell}
          style={{
            gridColumn: `${losersColIndices[0] + 1} / ${losersColIndices[losersColIndices.length - 1] + 2}`,
            gridRow: 1,
          }}
        >
          {t('losers_bracket')}
        </div>
      )}
      {gfColIndices.length > 0 && (
        <div
          className={classes.sectionTitleCell}
          style={{
            gridColumn: `${gfColIndices[0] + 1} / ${gfColIndices[gfColIndices.length - 1] + 2}`,
            gridRow: 1,
          }}
        >
          {t('grand_finals')}
        </div>
      )}

      {/* Row 2: Round headers */}
      {columns.map((col, colIdx) => {
        if (col.type === 'time-label' || col.type === 'separator') return null;
        return (
          <div
            key={`header-${colIdx}`}
            className={classes.roundHeaderCell}
            style={{ gridColumn: colIdx + 1, gridRow: 2 }}
          >
            {col.label}
          </div>
        );
      })}

      {/* Time slot rows */}
      {timeSlots.map((slot, slotIdx) => {
        const gridRow = slotIdx + headerRows + 1;
        return (
          <div
            key={`time-${slotIdx}`}
            className={classes.timeLabel}
            style={{ gridColumn: 1, gridRow }}
          >
            {formatTime(slot.time)}
          </div>
        );
      })}

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
      {cells.map((cell) => {
        const gridRow = cell.row + headerRows + 1;
        return (
          <div
            key={`cell-${cell.col}-${cell.row}`}
            className={classes.gridMatchCell}
            style={{ gridColumn: cell.col + 1, gridRow }}
          >
            {cell.matches.map((match) => (
              <MatchBox
                key={match.id}
                match={match}
                round={cell.round}
                tournamentData={tournamentData}
                swrStagesResponse={swrStagesResponse}
                swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
                readOnly={readOnly}
              />
            ))}
          </div>
        );
      })}
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
