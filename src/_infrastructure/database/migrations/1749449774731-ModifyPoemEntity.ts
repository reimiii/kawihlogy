import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyPoemEntity1749449774731 implements MigrationInterface {
  name = 'ModifyPoemEntity1749449774731';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "poems" DROP COLUMN "content"`);
    await queryRunner.query(`ALTER TABLE "poems" ADD "content" json NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "poems" DROP COLUMN "content"`);
    await queryRunner.query(`ALTER TABLE "poems" ADD "content" text NOT NULL`);
  }
}
