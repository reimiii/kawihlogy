import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNullCascadeInPoemForFile1750557725416
  implements MigrationInterface
{
  name = 'AddNullCascadeInPoemForFile1750557725416';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "poems" DROP CONSTRAINT "FK_7bafbf7c9ea82a9e57f84ee2b76"`,
    );
    await queryRunner.query(
      `ALTER TABLE "poems" ADD CONSTRAINT "FK_7bafbf7c9ea82a9e57f84ee2b76" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "poems" DROP CONSTRAINT "FK_7bafbf7c9ea82a9e57f84ee2b76"`,
    );
    await queryRunner.query(
      `ALTER TABLE "poems" ADD CONSTRAINT "FK_7bafbf7c9ea82a9e57f84ee2b76" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
