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

interface TimeGridRow {
  type: 'header' | 'time' | 'unscheduled' | 'gap';
  section?: 'winners' | 'losers';
  time?: string;
}

interface TimeGridData {
  columns: TimeGridColumn[];
  rows: TimeGridRow[];
  cells: TimeGridCell[];
}

// Losers round 1 shares a column with winners round 2
const LOSERS_COLUMN_OFFSET = 1;

function sortTimes(times: Set<string>): string[] {
  return Array.from(times).sort(
    (a, b) => parseISO(a).getTime() - parseISO(b).getTime()
  );
}

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

  // Collect per-section times and check activation
  const winnersTimeSet = new Set<string>();
  const losersTimeSet = new Set<string>(); // includes grand finals
  let winnersHasUnscheduled = false;
  let losersHasUnscheduled = false;

  for (const { round, bracket } of allRounds) {
    for (const match of round.matches) {
      if (match.start_time) {
        if (bracket === 'winners') winnersTimeSet.add(match.start_time);
        else losersTimeSet.add(match.start_time);
      } else {
        if (bracket === 'winners') winnersHasUnscheduled = true;
        else losersHasUnscheduled = true;
      }
    }
  }

  // Fallback if no cross-bracket alignment is possible
  if (winnersTimeSet.size === 0 || losersTimeSet.size === 0) {
    return null;
  }

  // Build columns with offset (LR1 under WR2)
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

  // Build row sequence: winners section, gap, losers section
  const winnersTimes = sortTimes(winnersTimeSet);
  const losersTimes = sortTimes(losersTimeSet);

  const rows: TimeGridRow[] = [];
  rows.push({ type: 'header', section: 'winners' });
  for (const time of winnersTimes) {
    rows.push({ type: 'time', section: 'winners', time });
  }
  if (winnersHasUnscheduled) {
    rows.push({ type: 'unscheduled', section: 'winners' });
  }
  rows.push({ type: 'gap' });
  rows.push({ type: 'header', section: 'losers' });
  for (const time of losersTimes) {
    rows.push({ type: 'time', section: 'losers', time });
  }
  if (losersHasUnscheduled) {
    rows.push({ type: 'unscheduled', section: 'losers' });
  }

  // Build time-to-row maps for each section
  const winnersTimeRow = new Map<string, number>();
  const losersTimeRow = new Map<string, number>();
  let winnersUnschedRow = -1;
  let losersUnschedRow = -1;

  rows.forEach((row, idx) => {
    if (row.type === 'time' && row.time) {
      if (row.section === 'winners') winnersTimeRow.set(row.time, idx);
      else losersTimeRow.set(row.time, idx);
    }
    if (row.type === 'unscheduled') {
      if (row.section === 'winners') winnersUnschedRow = idx;
      else losersUnschedRow = idx;
    }
  });

  // Group matches into cells using absolute row indices
  const cellMap = new Map<string, TimeGridCellEntry[]>();

  for (const { round, bracket } of allRounds) {
    const colIdx = roundColIndex.get(round.id);
    if (colIdx === undefined) continue;

    const isWinners = bracket === 'winners';
    const timeRowMap = isWinners ? winnersTimeRow : losersTimeRow;
    const unschedRow = isWinners ? winnersUnschedRow : losersUnschedRow;

    for (const match of round.matches) {
      let rowIdx: number;
      if (match.start_time && timeRowMap.has(match.start_time)) {
        rowIdx = timeRowMap.get(match.start_time)!;
      } else if (unschedRow >= 0) {
        rowIdx = unschedRow;
      } else {
        continue;
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

  return { columns, rows, cells };
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
  const { columns, rows, cells } = gridData;

  const colSizes = columns
    .map((c) => (c.type === 'time-label' ? 'auto' : '200px'))
    .join(' ');

  const rowSizes = rows
    .map((r) => {
      if (r.type === 'header') return 'auto';
      if (r.type === 'gap') return '40px';
      return 'minmax(80px, auto)';
    })
    .join(' ');

  return (
    <div
      className={classes.timeAlignedGrid}
      style={{
        gridTemplateColumns: colSizes,
        gridTemplateRows: rowSizes,
      }}
    >
      {rows.map((row, rowIdx) => {
        const gridRow = rowIdx + 1;

        if (row.type === 'header') {
          const isWinners = row.section === 'winners';
          return (
            <div key={`row-${rowIdx}`} style={{ display: 'contents' }}>
              {/* Section label */}
              <div
                className={classes.sectionTitleCell}
                style={{ gridColumn: 1, gridRow }}
              >
                {isWinners ? t('winners_bracket') : t('losers_bracket')}
              </div>
              {/* Round headers */}
              {columns.map((col, colIdx) => {
                let label: string | undefined;
                if (isWinners) {
                  label = col.winnersRound?.name ?? col.grandFinalsRound?.name;
                } else {
                  label = col.losersRound?.name;
                }
                if (!label) return null;
                return (
                  <div
                    key={`h-${rowIdx}-${colIdx}`}
                    className={classes.roundHeaderCell}
                    style={{ gridColumn: colIdx + 1, gridRow }}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          );
        }

        if (row.type === 'time') {
          return (
            <div
              key={`time-${rowIdx}`}
              className={classes.timeLabel}
              style={{ gridColumn: 1, gridRow }}
            >
              {formatTime(row.time!)}
            </div>
          );
        }

        if (row.type === 'unscheduled') {
          return (
            <div
              key={`unsched-${rowIdx}`}
              className={classes.timeLabel}
              style={{ gridColumn: 1, gridRow }}
            >
              —
            </div>
          );
        }

        // gap row — rendered by grid sizing, nothing to draw
        return null;
      })}

      {/* Match cells */}
      {cells.map((cell) => (
        <div
          key={`cell-${cell.col}-${cell.row}`}
          className={classes.gridMatchCell}
          style={{ gridColumn: cell.col + 1, gridRow: cell.row + 1 }}
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
