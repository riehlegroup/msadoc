import { MigrationInterface, QueryRunner } from 'typeorm';

export class ServiceDocsRenameProvidedAPIs1662991810846
  implements MigrationInterface
{
  name = 'ServiceDocsRenameProvidedAPIs1662991810846';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ServiceDocs" RENAME COLUMN "producedAPIs" TO "providedAPIs"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ServiceDocs" RENAME COLUMN "providedAPIs" TO "producedAPIs"`,
    );
  }
}
