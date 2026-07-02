export class BracketMatchDto {
  matchNumber: number;
  round: number; // 1=final, 2=semi, 3=quarter, etc.
  bracketPosition: number;
  teamIds: number[];
  isBye?: boolean;
}
