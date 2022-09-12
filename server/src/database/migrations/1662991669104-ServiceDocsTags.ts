import { MigrationInterface, QueryRunner } from 'typeorm';

export class ServiceDocsTags1662991669104 implements MigrationInterface {
  name = 'ServiceDocsTags1662991669104';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ServiceDocs" ADD "tags" text array`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ServiceDocs" DROP COLUMN "tags"`);
  }
}
