import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Game } from './game.entity';
import { MatchTeam } from './match-team.entity';
import { MatchStatus } from './match-status.enum';

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Game, (g) => g.matches, { onDelete: 'CASCADE' })
  @JoinColumn()
  game: Game;

  @Column()
  gameId: number;

  @Column({ type: 'simple-enum', enum: MatchStatus, default: MatchStatus.PENDING })
  status: MatchStatus;

  @Column({ default: 1 })
  round: number;

  @OneToMany(() => MatchTeam, (mt) => mt.match, { cascade: true })
  matchTeams: MatchTeam[];
}
