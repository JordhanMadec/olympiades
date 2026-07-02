import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Match } from './match.entity';
import { Team } from './team.entity';

@Entity()
export class MatchTeam {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Match, (m) => m.matchTeams, { onDelete: 'CASCADE' })
  @JoinColumn()
  match: Match;

  @Column()
  matchId: number;

  @ManyToOne(() => Team, (t) => t.matchTeams, { onDelete: 'CASCADE' })
  @JoinColumn()
  team: Team;

  @Column()
  teamId: number;

  @Column({ type: 'float', nullable: true })
  rawScore: number | null;

  @Column({ nullable: true })
  rank: number | null;

  @Column({ type: 'float', nullable: true })
  points: number | null;
}
