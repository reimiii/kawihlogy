import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTopicsAndEmotionsAndTitle1748598799102
  implements MigrationInterface
{
  name = 'AddTopicsAndEmotionsAndTitle1748598799102';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "journals" ADD "title" character varying(255) DEFAULT 'Untitled Journal'`,
    );
    await queryRunner.query(
      `ALTER TABLE "journals" ADD "emotions" character varying(70) array NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "journals" ADD "topics" character varying(70) array NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "journals" DROP COLUMN "topics"`);
    await queryRunner.query(`ALTER TABLE "journals" DROP COLUMN "emotions"`);
    await queryRunner.query(`ALTER TABLE "journals" DROP COLUMN "title"`);
  }
}
