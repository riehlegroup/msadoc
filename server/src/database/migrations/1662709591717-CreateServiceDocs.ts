import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServiceDocs1662709591717 implements MigrationInterface {
  name = 'CreateServiceDocs1662709591717';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ServiceDocs" ("name" character varying NOT NULL, "consumedAPIs" text array, "producedAPIs" text array, "producedEvents" text array, "consumedEvents" text array, "repository" character varying, "taskBoard" character varying, "developmentDocumentation" character varying, "deploymentDocumentation" character varying, "apiDocumentation" character varying, "responsibleTeam" character varying, "responsibles" text array, "creationTimestamp" TIMESTAMP NOT NULL DEFAULT now(), "updateTimestamp" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bf85583ed145ce498187cd882af" PRIMARY KEY ("name"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ServiceDocs"`);
  }
}
