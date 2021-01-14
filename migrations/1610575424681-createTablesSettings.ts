import {MigrationInterface, QueryRunner} from "typeorm";

export class createTablesSettings1610575424681 implements MigrationInterface {
    name = 'createTablesSettings1610575424681'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "items-config-visibility" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "orderId" boolean NOT NULL DEFAULT true, "quantity" boolean NOT NULL DEFAULT true, "amazonSku" boolean NOT NULL DEFAULT true, "itemNumber" boolean NOT NULL DEFAULT true, "threshold" boolean NOT NULL DEFAULT true, "supplier" boolean NOT NULL DEFAULT true, "altSupplier" boolean NOT NULL DEFAULT true, "note" boolean NOT NULL DEFAULT true, "createdItemAt" boolean NOT NULL DEFAULT true, "status" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_14d24793ee6957dde49096fe2d4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "orders-config-visibility" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "orderId" boolean NOT NULL DEFAULT true, "itemId" boolean NOT NULL DEFAULT true, "supplier" boolean NOT NULL DEFAULT true, "recipientName" boolean NOT NULL DEFAULT true, "shipDate" boolean NOT NULL DEFAULT true, "carrierCode" boolean NOT NULL DEFAULT true, "carrierName" boolean NOT NULL DEFAULT true, "trackingNumber" boolean NOT NULL DEFAULT true, "note" boolean NOT NULL DEFAULT true, "createdOrderAt" boolean NOT NULL DEFAULT true, "status" boolean NOT NULL DEFAULT true, "amazonItemId" boolean NOT NULL DEFAULT true, "amazonOrderId" boolean NOT NULL DEFAULT true, "amazonSku" boolean NOT NULL DEFAULT true, "quantity" boolean NOT NULL DEFAULT true, "googleShipDate" boolean NOT NULL DEFAULT true, "googleTrackingNumber" boolean NOT NULL DEFAULT true, "googleShipMethod" boolean NOT NULL DEFAULT true, "googleAccountId" boolean NOT NULL DEFAULT true, "googleWebNumber" boolean NOT NULL DEFAULT true, "googleOrderId" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_e570d6ac652367b6e34a92dba2a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user-settings" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "ordersTableId" uuid, "itemsTableId" uuid, CONSTRAINT "REL_99669b845696d8b3e5d253ed18" UNIQUE ("ordersTableId"), CONSTRAINT "REL_030898e4a2a3c25cd96638c898" UNIQUE ("itemsTableId"), CONSTRAINT "PK_0fbe28c9f064a04d90aca6b3514" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "settingsId" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_76ba283779c8441fd5ff819c8cf" UNIQUE ("settingsId")`);
        await queryRunner.query(`ALTER TABLE "user-settings" ADD CONSTRAINT "FK_99669b845696d8b3e5d253ed18e" FOREIGN KEY ("ordersTableId") REFERENCES "orders-config-visibility"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user-settings" ADD CONSTRAINT "FK_030898e4a2a3c25cd96638c898b" FOREIGN KEY ("itemsTableId") REFERENCES "items-config-visibility"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_76ba283779c8441fd5ff819c8cf" FOREIGN KEY ("settingsId") REFERENCES "user-settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_76ba283779c8441fd5ff819c8cf"`);
        await queryRunner.query(`ALTER TABLE "user-settings" DROP CONSTRAINT "FK_030898e4a2a3c25cd96638c898b"`);
        await queryRunner.query(`ALTER TABLE "user-settings" DROP CONSTRAINT "FK_99669b845696d8b3e5d253ed18e"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_76ba283779c8441fd5ff819c8cf"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "settingsId"`);
        await queryRunner.query(`DROP TABLE "user-settings"`);
        await queryRunner.query(`DROP TABLE "orders-config-visibility"`);
        await queryRunner.query(`DROP TABLE "items-config-visibility"`);
    }

}
