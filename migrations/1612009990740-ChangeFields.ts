import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeFields1612009990740 implements MigrationInterface {
    name = 'ChangeFields1612009990740'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "order-items_graingershipmethod_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`CREATE TABLE "order-items" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "amazonItemId" character varying NOT NULL, "amazonSku" character varying NOT NULL, "amazonQuantity" integer NOT NULL DEFAULT '0', "graingerTrackingNumber" character varying, "graingerShipMethod" "order-items_graingershipmethod_enum", "graingerOrderId" character varying, "graingerShipDate" date, "graingerWebNumber" character varying, "note" character varying, "graingerItemId" uuid, "orderId" uuid, CONSTRAINT "UQ_a71e258360def237e6a2e1907d1" UNIQUE ("amazonItemId"), CONSTRAINT "PK_605fbaee38242facaa1a34b67ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "grainger-items_status_enum" AS ENUM('1', '0')`);
        await queryRunner.query(`CREATE TABLE "grainger-items" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "amazonSku" character varying NOT NULL, "graingerItemNumber" character varying, "graingerPackQuantity" integer, "graingerThreshold" integer, "status" "grainger-items_status_enum" NOT NULL DEFAULT '1', "graingerAccountId" uuid, "userId" uuid, CONSTRAINT "PK_c1363ff218e5981cbfc6365ceb8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order-items" ADD CONSTRAINT "FK_6b88e085e52c4a9e2b1544d2cb2" FOREIGN KEY ("graingerItemId") REFERENCES "grainger-items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order-items" ADD CONSTRAINT "FK_d42918a88740ece11347e20918f" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grainger-items" ADD CONSTRAINT "FK_87928905b726de0a821739eef22" FOREIGN KEY ("graingerAccountId") REFERENCES "grainger-account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grainger-items" ADD CONSTRAINT "FK_465df6511a8c8ca92b7bd387a33" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        // Перенесли данные
        await queryRunner.query(`insert into "order-items" (id, "createdAt" , "updatedAt" , "deletedAt" , "amazonSku", note , "amazonItemId" , "amazonQuantity" , "graingerTrackingNumber" , "graingerShipMethod" , "graingerOrderId" , "graingerShipDate" , "graingerWebNumber" , "orderId" , "graingerItemId" ) select id, "createdAt" , "updatedAt" , "deletedAt" , "amazonSku", note , "amazonItemId" , "amazonQuantity" , "graingerTrackingNumber" , "graingerShipMethod"::text::"order-items_graingershipmethod_enum" , "graingerOrderId" , "graingerShipDate" , "graingerWebNumber" , "orderId" , "itemId" from items`);
        await queryRunner.query(`delete from items`);
        // Дропнули ключи
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_9e039229fb4b5a379ab79e887ad"`); // orderId
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_151f283a98f27c634dacfdb965b"`); // graingerItemId
        // Дропнули таблицу и тип
        await queryRunner.query(`DROP TABLE items`);
        await queryRunner.query(`DROP TYPE "items_graingershipmethod_enum"`);

        // УДАЛЕНИЕ PROFILES
        await queryRunner.query(`delete from profiles`);
        await queryRunner.query(`DROP TABLE profiles`);

        // УДАЛЕНИЕ orders-config-visibility
        await queryRunner.query(`delete from "orders-config-visibility"`);
        await queryRunner.query(`ALTER TABLE "user-settings" DROP CONSTRAINT "FK_99669b845696d8b3e5d253ed18e"`);
        await queryRunner.query(`DROP TABLE "orders-config-visibility"`);

        // УДАЛЕНИЕ grainger-items-config-visibility
        await queryRunner.query(`delete from "items-config-visibility"`);
        await queryRunner.query(`ALTER TABLE "user-settings" DROP CONSTRAINT "FK_030898e4a2a3c25cd96638c898b"`);
        await queryRunner.query(`DROP TABLE "items-config-visibility"`);

        // УДАЛЕНИЕ grainger-items-config-visibility
        await queryRunner.query(`delete from "user-settings"`);
        await queryRunner.query(`DROP TABLE "user-settings"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {// Создали тип и таблицу
        await queryRunner.query(`CREATE TYPE "items_graingershipmethod_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`CREATE TABLE items ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "amazonItemId" character varying NOT NULL, "amazonSku" character varying NOT NULL, "amazonQuantity" integer NOT NULL DEFAULT '0', "graingerTrackingNumber" character varying, "graingerShipMethod" "items_graingershipmethod_enum", "graingerOrderId" character varying, "graingerShipDate" date, "graingerWebNumber" character varying, "note" character varying, "itemId" uuid, "orderId" uuid, CONSTRAINT "UQ_5a7e9916adb45b3032a21c85877" UNIQUE ("amazonItemId"), CONSTRAINT "PK_ba5885359424c15ca6b9e79bcf6" PRIMARY KEY ("id"))`);
        // Создали ключи
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "FK_151f283a98f27c634dacfdb965b" FOREIGN KEY ("itemId") REFERENCES "grainger-item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "FK_9e039229fb4b5a379ab79e887ad" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        // Перенесли данные
        await queryRunner.query(`insert into items (id, "createdAt" , "updatedAt" , "deletedAt" , "amazonSku", note , "amazonItemId" , "amazonQuantity" , "graingerTrackingNumber" , "graingerShipMethod" , "graingerOrderId" , "graingerShipDate" , "graingerWebNumber" , "orderId" , "itemId" ) select id, "createdAt" , "updatedAt" , "deletedAt" , "amazonSku", note , "amazonItemId" , "amazonQuantity" , "graingerTrackingNumber" , "graingerShipMethod"::text::"items_graingershipmethod_enum" , "graingerOrderId" , "graingerShipDate" , "graingerWebNumber" , "orderId" , "graingerItemId" from "order-items"`);
        await queryRunner.query(`delete from "order-items"`);

        await queryRunner.query(`ALTER TABLE "grainger-items" DROP CONSTRAINT "FK_465df6511a8c8ca92b7bd387a33"`);
        await queryRunner.query(`ALTER TABLE "grainger-items" DROP CONSTRAINT "FK_87928905b726de0a821739eef22"`);
        await queryRunner.query(`ALTER TABLE "order-items" DROP CONSTRAINT "FK_d42918a88740ece11347e20918f"`);
        await queryRunner.query(`ALTER TABLE "order-items" DROP CONSTRAINT "FK_6b88e085e52c4a9e2b1544d2cb2"`);
        await queryRunner.query(`DROP TABLE "grainger-items"`);
        await queryRunner.query(`DROP TYPE "grainger-items_status_enum"`);
        await queryRunner.query(`DROP TABLE "order-items"`);
        await queryRunner.query(`DROP TYPE "order-items_graingershipmethod_enum"`);

        // ДОБАВЛЕНИЕ grainger-items-config-visibility
        await queryRunner.query(`CREATE TABLE "items-config-visibility" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "orderId" boolean NOT NULL DEFAULT true, "quantity" boolean NOT NULL DEFAULT true, "amazonSku" boolean NOT NULL DEFAULT true, "itemNumber" boolean NOT NULL DEFAULT true, "threshold" boolean NOT NULL DEFAULT true, "supplier" boolean NOT NULL DEFAULT true, "altSupplier" boolean NOT NULL DEFAULT true, "note" boolean NOT NULL DEFAULT true, "createdItemAt" boolean NOT NULL DEFAULT true, "status" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_14d24793ee6957dde49096fe2d4" PRIMARY KEY ("id"))`);

        // ДОБАВЛЕНИЕ orders-config-visibility
        await queryRunner.query(`CREATE TABLE "orders-config-visibility" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "orderId" boolean NOT NULL DEFAULT true, "itemId" boolean NOT NULL DEFAULT true, "supplier" boolean NOT NULL DEFAULT true, "recipientName" boolean NOT NULL DEFAULT true, "shipDate" boolean NOT NULL DEFAULT true, "carrierCode" boolean NOT NULL DEFAULT true, "carrierName" boolean NOT NULL DEFAULT true, "trackingNumber" boolean NOT NULL DEFAULT true, "note" boolean NOT NULL DEFAULT true, "createdOrderAt" boolean NOT NULL DEFAULT true, "status" boolean NOT NULL DEFAULT true, "amazonItemId" boolean NOT NULL DEFAULT true, "amazonOrderId" boolean NOT NULL DEFAULT true, "amazonSku" boolean NOT NULL DEFAULT true, "quantity" boolean NOT NULL DEFAULT true, "googleShipDate" boolean NOT NULL DEFAULT true, "googleTrackingNumber" boolean NOT NULL DEFAULT true, "googleShipMethod" boolean NOT NULL DEFAULT true, "googleAccountId" boolean NOT NULL DEFAULT true, "googleWebNumber" boolean NOT NULL DEFAULT true, "googleOrderId" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_e570d6ac652367b6e34a92dba2a" PRIMARY KEY ("id"))`);

        // ДОБАВЛЕНИЕ grainger-items-config-visibility
        await queryRunner.query(`CREATE TABLE "user-settings" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "ordersTableId" uuid, "itemsTableId" uuid, CONSTRAINT "REL_99669b845696d8b3e5d253ed18" UNIQUE ("ordersTableId"), CONSTRAINT "REL_030898e4a2a3c25cd96638c898" UNIQUE ("itemsTableId"), CONSTRAINT "PK_0fbe28c9f064a04d90aca6b3514" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user-settings" ADD CONSTRAINT "FK_99669b845696d8b3e5d253ed18e" FOREIGN KEY ("ordersTableId") REFERENCES "orders-config-visibility"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user-settings" ADD CONSTRAINT "FK_030898e4a2a3c25cd96638c898b" FOREIGN KEY ("itemsTableId") REFERENCES "items-config-visibility"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // ДОБАВЛЕНИЕ PROFILES
        await queryRunner.query(`CREATE TABLE "profiles" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying, "photoURL" character varying, CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`);
    }

}
