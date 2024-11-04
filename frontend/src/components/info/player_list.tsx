import { TeamInterface } from '../../interfaces/team';

export default function PlayerList({ team }: { team: TeamInterface }) {
  return <span>{team.name}</span>;
}
