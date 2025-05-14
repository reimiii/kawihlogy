import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeBaseEntityToLowerCaseSnakeCase1747183623428
  implements MigrationInterface
{
  name = 'ChangeBaseEntityToLowerCaseSnakeCase1747183623428';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "journals" DROP CONSTRAINT "FK_030fa853b4289e94a858d8cc232"`,
    );
    await queryRunner.query(`ALTER TABLE "journals" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "journals" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "journals" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "journals" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "journals" DROP COLUMN "isPrivate"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deletedAt"`);
    await queryRunner.query(
      `ALTER TABLE "journals" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "journals" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "journals" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "journals" ADD "user_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "journals" ADD "is_private" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "journals" ADD CONSTRAINT "FK_dcd8f26897887ea1ca19e9b910a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "journals" DROP CONSTRAINT "FK_dcd8f26897887ea1ca19e9b910a"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "journals" DROP COLUMN "is_private"`);
    await queryRunner.query(`ALTER TABLE "journals" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "journals" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "journals" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "journals" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "journals" ADD "isPrivate" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "journals" ADD "userId" uuid NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "journals" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "journals" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "journals" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "journals" ADD CONSTRAINT "FK_030fa853b4289e94a858d8cc232" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
