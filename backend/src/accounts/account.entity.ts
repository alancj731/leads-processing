import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('accounts')
@Index(['franchisor', 'name'], { unique: true })
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  franchisor!: string;
}
