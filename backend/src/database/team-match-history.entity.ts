import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('team_match_history')
export class TeamMatchHistory {
  @PrimaryColumn()
  team1Id: number;

  @PrimaryColumn()
  team2Id: number;

  @Column({ default: 0 })
  matchCount: number;
}
