import {MigrationInterface, QueryRunner} from "typeorm";

export class createItemTable1606855837692 implements MigrationInterface {
    name = 'createItemTable1606855837692'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "items_status_enum" AS ENUM('0', '1')`);
        await queryRunner.query(`CREATE TABLE "items" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "itemNumber" character varying NOT NULL, "quantity" integer NOT NULL, "threshold" integer, "amazonSku" character varying NOT NULL, "supplier" character varying NOT NULL, "altSupplier" character varying, "status" "items_status_enum" array NOT NULL DEFAULT '{0}', CONSTRAINT "PK_ba5885359424c15ca6b9e79bcf6" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "items"`);
        await queryRunner.query(`DROP TYPE "items_status_enum"`);
    }

}
