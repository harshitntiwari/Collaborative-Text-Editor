import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDocumentTable1767016368373 implements MigrationInterface {
    name = 'InitDocumentTable1767016368373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "document" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "s3Key" character varying NOT NULL, "contentSize" bigint, "mimeType" character varying(100) DEFAULT 'text/plain', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, CONSTRAINT "UQ_849ae5de15929dc0b19f17fe514" UNIQUE ("s3Key"), CONSTRAINT "PK_e57d3357f83f3cdc0acffc3d777" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "document"`);
    }

}
