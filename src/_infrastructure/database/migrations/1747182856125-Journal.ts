import { MigrationInterface, QueryRunner } from 'typeorm';

export class Journal1747182856125 implements MigrationInterface {
  name = 'Journal1747182856125';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "journals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid NOT NULL, "content" text NOT NULL, "date" date NOT NULL, "isPrivate" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_157a30136385dd81cdd19111380" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "journals" ADD CONSTRAINT "FK_030fa853b4289e94a858d8cc232" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "journals" DROP CONSTRAINT "FK_030fa853b4289e94a858d8cc232"`,
    );
    await queryRunner.query(`DROP TABLE "journals"`);
  }
}
