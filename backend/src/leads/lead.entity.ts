import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  franchisor!: string;

  @Column({ type: 'uuid', nullable: true })
  account_id!: string | null;

  @Column()
  phone_number!: string;
}
