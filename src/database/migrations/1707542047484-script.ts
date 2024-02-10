import { MigrationInterface, QueryRunner } from 'typeorm';

export class Script1707542047484 implements MigrationInterface {
  name = 'Script1707542047484';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "file" RENAME COLUMN "mimetypex" TO "mimetype"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "file" RENAME COLUMN "mimetype" TO "mimetypex"`,
    );
  }
}
