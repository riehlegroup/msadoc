import {
  Entity,
  Column,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({
  name: 'ServiceDocs',
})
export class ServiceDocOrm {
  @PrimaryColumn()
  name: string;

  @Column('text', { array: true, nullable: true })
  tags?: string[];

  @Column({ nullable: true })
  repository?: string;

  @Column({ nullable: true })
  taskBoard?: string;

  /** Dependencies */

  @Column('text', { array: true, nullable: true })
  consumedAPIs?: string[];

  @Column('text', { array: true, nullable: true })
  providedAPIs?: string[];

  @Column('text', { array: true, nullable: true })
  producedEvents?: string[];

  @Column('text', { array: true, nullable: true })
  consumedEvents?: string[];

  /** Documentation links */

  @Column({ nullable: true })
  developmentDocumentation?: string;

  @Column({ nullable: true })
  deploymentDocumentation?: string;

  @Column({ nullable: true })
  apiDocumentation?: string;

  /** Responsibilities */

  @Column({ nullable: true })
  responsibleTeam?: string;

  @Column('text', { array: true, nullable: true })
  responsibles?: string[];

  /** Timestamps */

  @CreateDateColumn()
  creationTimestamp: Date;

  @UpdateDateColumn()
  updateTimestamp: Date;
}
