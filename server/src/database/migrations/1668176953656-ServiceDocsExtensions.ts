import { MigrationInterface, QueryRunner } from 'typeorm';

export class ServiceDocsExtensions1668176953656 implements MigrationInterface {
  name = 'ServiceDocsExtensions1668176953656';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ServiceDocs" ADD "extensions" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ServiceDocs" DROP COLUMN "extensions"`,
    );
  }
}
