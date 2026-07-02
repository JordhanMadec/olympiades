import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { GameType, GameFormat } from './enums';
import { Match } from './match.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'simple-enum', enum: GameType })
  type: GameType;

  @Column({ type: 'simple-enum', enum: GameFormat })
  format: GameFormat;

  /** ASC = lowest score wins (time), DESC = highest score wins */
  @Column({ default: 'DESC' })
  scoringDirection: 'ASC' | 'DESC';

  @Column({ default: '' })
  description: string;

  @OneToMany(() => Match, (m) => m.game)
  matches: Match[];
}
