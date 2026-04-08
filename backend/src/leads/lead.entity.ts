import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  franchisor!: string;

  @Column({ unique: true })
  phone_number!: string;
}
