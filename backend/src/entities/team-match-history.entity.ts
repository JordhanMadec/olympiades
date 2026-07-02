import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { Game } from './game.entity';

@Entity()
export class TeamMatchHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Team, (t) => t.historyAsTeam1, { onDelete: 'CASCADE' })
  @JoinColumn()
  team1: Team;

  @Column()
  team1Id: number;

  @ManyToOne(() => Team, (t) => t.historyAsTeam2, { onDelete: 'CASCADE' })
  @JoinColumn()
  team2: Team;

  @Column()
  team2Id: number;

  @ManyToOne(() => Game, { onDelete: 'CASCADE' })
  @JoinColumn()
  game: Game;

  @Column()
  gameId: number;
}
