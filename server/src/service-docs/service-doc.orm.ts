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
  consumedAPIs: string[];

  @Column('text', { array: true, nullable: true })
  producedAPIs: string[];

  @Column('text', { array: true, nullable: true })
  producedEvents: string[];

  @Column('text', { array: true, nullable: true })
  consumedEvents: string[];

  @Column({ nullable: true })
  repository?: string;

  @Column({ nullable: true })
  taskBoard?: string;

  @Column({ nullable: true })
  developmentDocumentation?: string;

  @Column({ nullable: true })
  deploymentDocumentation?: string;

  @Column({ nullable: true })
  apiDocumentation?: string;

  @Column({ nullable: true })
  responsibleTeam?: string;

  @Column('text', { array: true, nullable: true })
  responsibles: string[];

  @CreateDateColumn()
  creationTimestamp: Date;

  @UpdateDateColumn()
  updateTimestamp: Date;
}
