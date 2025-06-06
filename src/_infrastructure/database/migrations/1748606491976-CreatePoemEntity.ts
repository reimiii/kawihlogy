import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePoemEntity1748606491976 implements MigrationInterface {
  name = 'CreatePoemEntity1748606491976';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "poems" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "journal_id" uuid NOT NULL, "content" text NOT NULL, CONSTRAINT "UQ_d886394b99f14ea57d71ebba467" UNIQUE ("journal_id"), CONSTRAINT "REL_d886394b99f14ea57d71ebba46" UNIQUE ("journal_id"), CONSTRAINT "PK_53e87dc228dfc6428c69f8b8ad6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "poems" ADD CONSTRAINT "FK_d886394b99f14ea57d71ebba467" FOREIGN KEY ("journal_id") REFERENCES "journals"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "poems" DROP CONSTRAINT "FK_d886394b99f14ea57d71ebba467"`,
    );
    await queryRunner.query(`DROP TABLE "poems"`);
  }
}
