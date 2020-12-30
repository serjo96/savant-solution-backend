import {MigrationInterface, QueryRunner} from "typeorm";

export class createOrders1609341756398 implements MigrationInterface {
    name = 'createOrders1609341756398'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "orders_googleshipmethod_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`CREATE TYPE "orders_status_enum" AS ENUM('3', '2', '1', '0')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "itemId" character varying, "quantity" integer NOT NULL DEFAULT '0', "recipientName" character varying, "supplier" character varying NOT NULL DEFAULT 'Grainger', "note" character varying, "shipDate" date, "carrierCode" character varying, "carrierName" character varying, "trackingNumber" character varying, "amazonSku" character varying, "amazonItemId" character varying, "amazonOrderId" character varying, "googleShipDate" date, "googleTrackingNumber" character varying, "googleShipMethod" "orders_googleshipmethod_enum", "googleAccountId" character varying, "googleWebNumber" character varying, "googleOrderId" character varying, "status" "orders_status_enum" NOT NULL DEFAULT '2', CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "orders_status_enum"`);
        await queryRunner.query(`DROP TYPE "orders_googleshipmethod_enum"`);
    }

}
