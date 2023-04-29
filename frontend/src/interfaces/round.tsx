import { MatchInterface } from './match';

export interface StageInterface {
  id: number;
  created: string;
  name: string;
  is_draft: boolean;
  is_active: boolean;
  matches: MatchInterface[];
}
