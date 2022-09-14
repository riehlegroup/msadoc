import { MigrationInterface, QueryRunner } from 'typeorm';

export class ServiceDocsKubernetesLabels1663142461696
  implements MigrationInterface
{
  name = 'ServiceDocsKubernetesLabels1663142461696';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ServiceDocs" ADD "kubernetesLabels" text array`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ServiceDocs" DROP COLUMN "kubernetesLabels"`,
    );
  }
}
