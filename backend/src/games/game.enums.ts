export enum GameType {
  TIME = 'TIME',
  SCORE = 'SCORE',
  POINTS = 'POINTS',
}

export enum GameFormat {
  ROUND_ROBIN = 'ROUND_ROBIN',
  ELIMINATION = 'ELIMINATION',
}

export enum ScoringDirection {
  ASC = 'ASC',  // For TIME (lower is better)
  DESC = 'DESC', // For SCORE and POINTS (higher is better)
}
