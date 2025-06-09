import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFileEntity1749458703245 implements MigrationInterface {
  name = 'CreateFileEntity1749458703245';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "key" character varying NOT NULL, "url" text NOT NULL, "bucket" character varying NOT NULL, "mime_type" character varying(128), "size" integer, "originalName" character varying, "isPublic" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id")); COMMENT ON COLUMN "files"."size" IS 'File size in bytes, null if not applicable (e.g. for external URLs)'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "files"`);
  }
}
