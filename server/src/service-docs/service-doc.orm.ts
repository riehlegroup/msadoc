import {
  Entity,
  Column,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { ExtensionValueType } from './service-docs.service';

@Entity({
  name: 'ServiceDocs',
})
export class ServiceDocOrm {
  @PrimaryColumn()
  name: string;

  @Column('character varying', { nullable: true })
  group: string | null;

  @Column('text', { array: true, nullable: true })
  tags: string[] | null;

  @Column('character varying', { nullable: true })
  repository: string | null;

  @Column('character varying', { nullable: true })
  taskBoard: string | null;

  /** Dependencies */

  @Column('text', { array: true, nullable: true })
  consumedAPIs: string[] | null;

  @Column('text', { array: true, nullable: true })
  providedAPIs: string[] | null;

  @Column('text', { array: true, nullable: true })
  publishedEvents: string[] | null;

  @Column('text', { array: true, nullable: true })
  subscribedEvents: string[] | null;

  /** Documentation links */

  @Column('character varying', { nullable: true })
  developmentDocumentation: string | null;

  @Column('character varying', { nullable: true })
  deploymentDocumentation: string | null;

  @Column('character varying', { nullable: true })
  apiDocumentation: string | null;

  /** Responsibilities */

  @Column('character varying', { nullable: true })
  responsibleTeam: string | null;

  @Column('text', { array: true, nullable: true })
  responsibles: string[] | null;

  /** Extensions */

  @Column('simple-json', { nullable: true })
  extensions: Record<string, ExtensionValueType>;

  /** Timestamps */

  @CreateDateColumn()
  creationTimestamp: Date;

  @UpdateDateColumn()
  updateTimestamp: Date;
}
