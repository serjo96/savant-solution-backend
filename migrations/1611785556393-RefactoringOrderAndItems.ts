import {MigrationInterface, QueryRunner} from "typeorm";

export class RefactoringOrderAndItems1611785556393 implements MigrationInterface {
    name = 'RefactoringOrderAndItems1611785556393'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_151b79a83ba240b0cb31b2302d"`);
        await queryRunner.query(`DROP INDEX "IDX_40e681891fea5a4b3c5c2546d1"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_76ba283779c8441fd5ff819c8cf"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "settingsId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "firstShipAddress"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "secondShipAddress"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "thirdShipAddress"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "amazonItemId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "graingerOrderId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "graingerWebNumber"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "graingerAccountId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "graingerShipMethod"`);
        await queryRunner.query(`DROP TYPE "public"."orders_graingershipmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "graingerTrackingNumber"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "graingerShipDate"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "amazonSku"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "supplier"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "quantity"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "itemId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "trackingNumber"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "quantity"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "itemNumber"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "threshold"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "altSupplier"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "shipAddress" character varying`);
        await queryRunner.query(`ALTER TABLE "items" ADD "amazonItemId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "UQ_5a7e9916adb45b3032a21c85877" UNIQUE ("amazonItemId")`);
        await queryRunner.query(`ALTER TABLE "items" ADD "amazonQuantity" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerTrackingNumber" character varying`);
        await queryRunner.query(`CREATE TYPE "items_graingershipmethod_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerShipMethod" "items_graingershipmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerOrderId" character varying`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerShipDate" date`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerWebNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerItemNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerPackQuantity" integer`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerThreshold" integer`);
        await queryRunner.query(`ALTER TABLE "items" ADD "orderId" uuid`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "amazonOrderId" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "orders"."amazonOrderId" IS NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "UQ_1554694af402a545dbd2500ec37" UNIQUE ("amazonOrderId")`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "shipPostalCode"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "shipPostalCode" character varying`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "FK_9e039229fb4b5a379ab79e887ad" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "FK_40e681891fea5a4b3c5c2546d15" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_40e681891fea5a4b3c5c2546d15"`);
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_9e039229fb4b5a379ab79e887ad"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "shipPostalCode"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "shipPostalCode" integer`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "UQ_1554694af402a545dbd2500ec37"`);
        await queryRunner.query(`COMMENT ON COLUMN "orders"."amazonOrderId" IS NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "amazonOrderId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "orderId"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "graingerThreshold"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "graingerPackQuantity"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "graingerItemNumber"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "graingerWebNumber"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "graingerShipDate"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "graingerOrderId"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "graingerShipMethod"`);
        await queryRunner.query(`DROP TYPE "items_graingershipmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "graingerTrackingNumber"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "amazonQuantity"`);
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "UQ_5a7e9916adb45b3032a21c85877"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "amazonItemId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "shipAddress"`);
        await queryRunner.query(`ALTER TABLE "items" ADD "altSupplier" character varying`);
        await queryRunner.query(`ALTER TABLE "items" ADD "threshold" integer`);
        await queryRunner.query(`ALTER TABLE "items" ADD "itemNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "items" ADD "quantity" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "trackingNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "itemId" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "quantity" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "supplier" character varying NOT NULL DEFAULT 'Grainger'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "amazonSku" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "graingerShipDate" date`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "graingerTrackingNumber" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."orders_graingershipmethod_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "graingerShipMethod" "orders_graingershipmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "graingerAccountId" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "graingerWebNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "graingerOrderId" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "amazonItemId" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "thirdShipAddress" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "secondShipAddress" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "firstShipAddress" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "settingsId" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_76ba283779c8441fd5ff819c8cf" UNIQUE ("settingsId")`);
        await queryRunner.query(`CREATE INDEX "IDX_40e681891fea5a4b3c5c2546d1" ON "items" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_151b79a83ba240b0cb31b2302d" ON "orders" ("userId") `);
    }

}
