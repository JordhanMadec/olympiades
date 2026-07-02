export class RoundRobinMatchDto {
  matchNumber: number;
  teamIds: number[];
  confrontationScore: number; // Lower is better (sum of confrontation counts)
}
