import {MigrationInterface, QueryRunner} from "typeorm";

export class updateOrderTable1610658543936 implements MigrationInterface {
    name = 'updateOrderTable1610658543936'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" DROP COLUMN "googleShipDate"`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" DROP COLUMN "googleTrackingNumber"`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" DROP COLUMN "googleShipMethod"`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" DROP COLUMN "googleAccountId"`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" DROP COLUMN "googleWebNumber"`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" DROP COLUMN "googleOrderId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "googleShipDate"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "googleTrackingNumber"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "googleShipMethod"`);
        await queryRunner.query(`DROP TYPE "public"."orders_googleshipmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "googleAccountId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "googleWebNumber"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "googleOrderId"`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" ADD "graingerShipDate" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" ADD "graingerTrackingNumber" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" ADD "graingerShipMethod" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" ADD "graingerAccountId" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" ADD "graingerWebNumber" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" ADD "graingerOrderId" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "graingerShipDate" date`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "graingerTrackingNumber" character varying`);
        await queryRunner.query(`CREATE TYPE "orders_graingershipmethod_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "graingerShipMethod" "orders_graingershipmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "graingerAccountId" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "graingerWebNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "graingerOrderId" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "firstShipAddress" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "secondShipAddress" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "thirdShipAddress" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "shipСity" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "shipState" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "shipPostalCode" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "shipPostalCode"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "shipState"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "shipСity"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "thirdShipAddress"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "secondShipAddress"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "firstShipAddress"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "graingerOrderId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "graingerWebNumber"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "graingerAccountId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "graingerShipMethod"`);
        await queryRunner.query(`DROP TYPE "orders_graingershipmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "graingerTrackingNumber"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "graingerShipDate"`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" DROP COLUMN "graingerOrderId"`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" DROP COLUMN "graingerWebNumber"`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" DROP COLUMN "graingerAccountId"`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" DROP COLUMN "graingerShipMethod"`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" DROP COLUMN "graingerTrackingNumber"`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" DROP COLUMN "graingerShipDate"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "googleOrderId" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "googleWebNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "googleAccountId" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."orders_googleshipmethod_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "googleShipMethod" "orders_googleshipmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "googleTrackingNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "googleShipDate" date`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" ADD "googleOrderId" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" ADD "googleWebNumber" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" ADD "googleAccountId" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" ADD "googleShipMethod" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" ADD "googleTrackingNumber" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "orders-config-visibility" ADD "googleShipDate" boolean NOT NULL DEFAULT true`);
    }

}
