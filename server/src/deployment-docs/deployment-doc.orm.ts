import {
  Entity,
  Column,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({
  name: 'DeploymentDocs',
})
export class DeploymentDocOrm {
  @PrimaryColumn()
  name: string;

  /** Kubernetes */

  @Column('character varying', { nullable: false })
  kubernetesUrl: string;

  @Column('character varying', { nullable: false })
  kubernetesUser: string;

  @Column('character varying', { nullable: false })
  kubernetesPassword: string;

  @Column('text', { array: true, nullable: true })
  kubernetesLabels: string[] | null;

  /** Timestamps */

  @CreateDateColumn()
  creationTimestamp: Date;

  @UpdateDateColumn()
  updateTimestamp: Date;
}
