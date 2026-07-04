import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { GameType, GameFormat, ScoringDirection } from "./game.enums";
import { Match } from "../matches/match.entity";

@Entity("games")
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column("text")
  description: string;

  @Column("text")
  rules: string;

  @Column({
    type: "varchar",
    enum: GameType,
  })
  gameType: GameType;

  @Column({
    type: "varchar",
    enum: GameFormat,
  })
  gameFormat: GameFormat;

  @Column({
    type: "varchar",
    enum: ScoringDirection,
  })
  scoringDirection: ScoringDirection;

  @Column({ nullable: true })
  teamsPerMatch: number;

  @Column({ nullable: true })
  unit: string; // Unit for quantity-based games (mL, kg, etc.)

  @Column({ nullable: true })
  winPoints: number; // Points awarded for a win in SCORE games (default: use Olympic system)

  @OneToMany(() => Match, (match) => match.game)
  matches: Match[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
