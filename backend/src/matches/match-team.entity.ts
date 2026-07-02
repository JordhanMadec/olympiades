import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Match } from './match.entity';
import { Team } from '../teams/team.entity';

@Entity('match_teams')
export class MatchTeam {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  matchId: number;

  @ManyToOne(() => Match, match => match.matchTeams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matchId' })
  match: Match;

  @Column()
  teamId: number;

  @ManyToOne(() => Team, team => team.matchTeams)
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  rawScore: number; // Time in seconds, match score, or points depending on gameType

  @Column({ nullable: true })
  rank: number; // 1st, 2nd, 3rd... calculated from rawScore

  @Column({ default: 0 })
  points: number; // Olympic points: 1st=10, 2nd=8, 3rd=6, etc.

  @Column({ default: false })
  isEliminated: boolean; // For elimination format
}
