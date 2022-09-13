import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeploymentDocsTable1663065666756 implements MigrationInterface {
  name = 'DeploymentDocsTable1663065666756';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "DeploymentDocs" ("name" character varying NOT NULL, "kubernetesUrl" character varying NOT NULL, "kubernetesUser" character varying NOT NULL, "kubernetesPassword" character varying NOT NULL, "kubernetesLabels" text array, "creationTimestamp" TIMESTAMP NOT NULL DEFAULT now(), "updateTimestamp" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7661b2c2b4bf2e5c5537c368bf2" PRIMARY KEY ("name"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "DeploymentDocs"`);
  }
}
