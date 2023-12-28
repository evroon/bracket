import { useTranslation } from 'next-i18next';

import { BracketDisplaySettings } from '../../interfaces/brackets';
import { TeamInterface } from '../../interfaces/team';
import { truncateString } from '../utils/util';

export default function PlayerList({
  team,
  displaySettings,
}: {
  team: TeamInterface;
  displaySettings?: BracketDisplaySettings | null;
}) {
  const { t } = useTranslation();
  if (displaySettings != null && displaySettings.teamNamesDisplay === 'team-names') {
    return <span>{team.name}</span>;
  }
  if (team.players.length < 1) {
    return <i>{t('no_team_members_description')}</i>;
  }

  const playerNames = team.players
    .map((player) => truncateString(player.name, 15))
    .sort()
    .join(', ');
  return <span>{playerNames}</span>;
}
