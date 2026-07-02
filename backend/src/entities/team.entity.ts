import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MatchTeam } from './match-team.entity';
import { TeamMatchHistory } from './team-match-history.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ default: '#3B82F6' })
  color: string;

  @OneToMany(() => MatchTeam, (mt) => mt.team)
  matchTeams: MatchTeam[];

  @OneToMany(() => TeamMatchHistory, (h) => h.team1)
  historyAsTeam1: TeamMatchHistory[];

  @OneToMany(() => TeamMatchHistory, (h) => h.team2)
  historyAsTeam2: TeamMatchHistory[];
}
