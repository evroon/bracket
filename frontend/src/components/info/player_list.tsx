import { Team } from '../../interfaces/team';

export default function PlayerList({ team }: { team: Team }) {
  if (team.players.length < 1) {
    return <i>No members</i>;
  }
  const playerNames = team.players
    .map((player) => player.name)
    .sort()
    .join(', ');
  return <span>{playerNames}</span>;
}
