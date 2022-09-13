import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeploymentDocsLogin1663075360958 implements MigrationInterface {
  name = 'DeploymentDocsLogin1663075360958';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "DeploymentDocs" ADD "kubernetesSkipTlsVerify" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "DeploymentDocs" ADD "kubernetesCa" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "DeploymentDocs" ADD "kubernetesUserCert" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "DeploymentDocs" ADD "kubernetesUserKey" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "DeploymentDocs" ALTER COLUMN "kubernetesPassword" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "DeploymentDocs" ALTER COLUMN "kubernetesPassword" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "DeploymentDocs" DROP COLUMN "kubernetesUserKey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "DeploymentDocs" DROP COLUMN "kubernetesUserCert"`,
    );
    await queryRunner.query(
      `ALTER TABLE "DeploymentDocs" DROP COLUMN "kubernetesCa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "DeploymentDocs" DROP COLUMN "kubernetesSkipTlsVerify"`,
    );
  }
}
