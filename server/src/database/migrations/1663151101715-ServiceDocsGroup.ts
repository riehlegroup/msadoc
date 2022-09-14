import { MigrationInterface, QueryRunner } from 'typeorm';

export class ServiceDocsGroup1663151101715 implements MigrationInterface {
  name = 'ServiceDocsGroup1663151101715';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ServiceDocs" ADD "group" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ServiceDocs" DROP COLUMN "group"`);
  }
}
