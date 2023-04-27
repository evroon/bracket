import { MatchInterface } from './match';

export interface RoundInterface {
  id: number;
  created: string;
  name: string;
  is_draft: boolean;
  is_active: boolean;
  matches: MatchInterface[];
}
