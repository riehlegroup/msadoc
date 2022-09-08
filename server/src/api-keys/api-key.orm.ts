import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'ApiKeys',
})
export class ApiKeyOrm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  keyName: string;

  @Column()
  apiKey: string;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  creationTimestamp: Date;
}
