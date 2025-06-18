import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyFileEntity1750206091426 implements MigrationInterface {
  name = 'ModifyFileEntity1750206091426';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "url"`);
    await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "bucket"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "files" ADD "bucket" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "files" ADD "url" text NOT NULL`);
  }
}
