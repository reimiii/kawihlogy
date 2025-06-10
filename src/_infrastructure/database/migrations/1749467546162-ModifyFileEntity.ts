import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyFileEntity1749467546162 implements MigrationInterface {
  name = 'ModifyFileEntity1749467546162';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "poems" ADD "file_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "poems" ADD CONSTRAINT "UQ_7bafbf7c9ea82a9e57f84ee2b76" UNIQUE ("file_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "poems" ADD CONSTRAINT "FK_7bafbf7c9ea82a9e57f84ee2b76" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "poems" DROP CONSTRAINT "FK_7bafbf7c9ea82a9e57f84ee2b76"`,
    );
    await queryRunner.query(
      `ALTER TABLE "poems" DROP CONSTRAINT "UQ_7bafbf7c9ea82a9e57f84ee2b76"`,
    );
    await queryRunner.query(`ALTER TABLE "poems" DROP COLUMN "file_id"`);
  }
}
