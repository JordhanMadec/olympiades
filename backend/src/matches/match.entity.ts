import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Game } from '../games/game.entity';
import { MatchTeam } from './match-team.entity';
import { MatchStatus } from './match.enums';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gameId: number;

  @ManyToOne(() => Game, game => game.matches)
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @Column()
  matchNumber: number;

  @Column({ nullable: true })
  round: number; // For elimination: 1=final, 2=semi, 3=quarter, etc.

  @Column({ nullable: true })
  bracketPosition: number; // Position in the bracket tree

  @Column({
    type: 'varchar',
    enum: MatchStatus,
    default: MatchStatus.PENDING,
  })
  status: MatchStatus;

  @OneToMany(() => MatchTeam, matchTeam => matchTeam.match, { cascade: true })
  matchTeams: MatchTeam[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
