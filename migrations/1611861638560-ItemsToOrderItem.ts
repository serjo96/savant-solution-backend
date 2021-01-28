import {MigrationInterface, QueryRunner} from "typeorm";

export class ItemsToOrderItem1611861638560 implements MigrationInterface {
    name = 'ItemsToOrderItem1611861638560'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT IF EXISTS "FK_9e039229fb4b5a379ab79e887ad"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "order-items_graingershipmethod_enum";`);
        await queryRunner.query(`CREATE TYPE "order-items_graingershipmethod_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS  "order-items" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "amazonItemId" character varying NOT NULL, "amazonSku" character varying NOT NULL, "amazonQuantity" integer NOT NULL DEFAULT '0', "graingerTrackingNumber" character varying, "graingerShipMethod" "order-items_graingershipmethod_enum", "graingerOrderId" character varying, "graingerShipDate" date, "graingerWebNumber" character varying, "note" character varying, "itemId" uuid, "orderId" uuid, CONSTRAINT "UQ_a71e258360def237e6a2e1907d1" UNIQUE ("amazonItemId"), CONSTRAINT "PK_605fbaee38242facaa1a34b67ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN IF EXISTS "note"`);
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT IF EXISTS "UQ_5a7e9916adb45b3032a21c85877"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN IF EXISTS "amazonItemId"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN IF EXISTS "amazonQuantity"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN IF EXISTS "graingerTrackingNumber"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN IF EXISTS "graingerShipMethod"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."items_graingershipmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN IF EXISTS "graingerOrderId"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN IF EXISTS "graingerShipDate"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN IF EXISTS "graingerWebNumber"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN IF EXISTS "orderId"`);
        await queryRunner.query(`ALTER TABLE "items" ADD "orderItemsId" uuid`);
        await queryRunner.query(`ALTER TABLE "order-items" ADD CONSTRAINT "FK_f50f9b803432b8d669d1aa854bf" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order-items" ADD CONSTRAINT "FK_d42918a88740ece11347e20918f" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "FK_8919c7c005dd69fd47cc7b8ae54" FOREIGN KEY ("orderItemsId") REFERENCES "order-items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_8919c7c005dd69fd47cc7b8ae54"`);
        await queryRunner.query(`ALTER TABLE "order-items" DROP CONSTRAINT "FK_d42918a88740ece11347e20918f"`);
        await queryRunner.query(`ALTER TABLE "order-items" DROP CONSTRAINT "FK_f50f9b803432b8d669d1aa854bf"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "orderItemsId"`);
        await queryRunner.query(`ALTER TABLE "items" ADD "orderId" uuid`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerWebNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerShipDate" date`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerOrderId" character varying`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."items_graingershipmethod_enum";`);
        await queryRunner.query(`CREATE TYPE "public"."items_graingershipmethod_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerShipMethod" "items_graingershipmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerTrackingNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "items" ADD "amazonQuantity" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "items" ADD "amazonItemId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "UQ_5a7e9916adb45b3032a21c85877" UNIQUE ("amazonItemId")`);
        await queryRunner.query(`ALTER TABLE "items" ADD "note" character varying`);
        await queryRunner.query(`DROP TABLE IF EXISTS "order-items"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "order-items_graingershipmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "FK_9e039229fb4b5a379ab79e887ad" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
