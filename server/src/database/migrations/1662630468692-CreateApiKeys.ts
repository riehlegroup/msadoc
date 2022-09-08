import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateApiKeys1662630468692 implements MigrationInterface {
  name = 'CreateApiKeys1662630468692';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ApiKeys" ("id" SERIAL NOT NULL, "keyName" character varying NOT NULL, "apiKey" character varying NOT NULL, "creationTimestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), CONSTRAINT "PK_6afa488da2335c53025b9afde86" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ApiKeys"`);
  }
}
