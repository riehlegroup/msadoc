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

  @Column('bool', { nullable: true })
  kubernetesSkipTlsVerify: boolean | null;

  @Column('character varying', { nullable: true })
  kubernetesCa: string | null;

  @Column('character varying', { nullable: false })
  kubernetesUser: string;

  @Column('character varying', { nullable: true })
  kubernetesPassword: string | null;

  @Column('character varying', { nullable: true })
  kubernetesUserCert: string | null;

  @Column('character varying', { nullable: true })
  kubernetesUserKey: string | null;

  @Column('text', { array: true, nullable: true })
  kubernetesLabels: string[] | null;

  /** Timestamps */

  @CreateDateColumn()
  creationTimestamp: Date;

  @UpdateDateColumn()
  updateTimestamp: Date;
}
