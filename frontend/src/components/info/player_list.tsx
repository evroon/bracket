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
  if (displaySettings != null && displaySettings.teamNamesDisplay === 'team-names') {
    return <span>{team.name}</span>;
  }
  if (team.players.length < 1) {
    return <i>No members</i>;
  }

  const playerNames = team.players
    .map((player) => truncateString(player.name, 15))
    .sort()
    .join(', ');
  return <span>{playerNames}</span>;
}
