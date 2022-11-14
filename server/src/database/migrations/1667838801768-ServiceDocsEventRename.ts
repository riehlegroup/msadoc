import { MigrationInterface, QueryRunner } from 'typeorm';

export class ServiceDocsEventRename1667838801768 implements MigrationInterface {
  name = 'ServiceDocsEventRename1667838801768';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ServiceDocs" RENAME COLUMN "producedEvents" TO "publishedEvents"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ServiceDocs" RENAME COLUMN "consumedEvents" TO "subscribedEvents"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ServiceDocs" RENAME COLUMN "publishedEvents" TO "producedEvents"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ServiceDocs" RENAME COLUMN "subscribedEvents" TO "consumedEvents"`,
    );
  }
}
