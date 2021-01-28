import {MigrationInterface, QueryRunner} from "typeorm";

export class ItemsToOrderItem1611858666625 implements MigrationInterface {
    name = 'ItemsToOrderItem1611858666625'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "items"`);
        await queryRunner.query(`CREATE TYPE "order-items_graingershipmethod_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`CREATE TABLE "order-items" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "amazonItemId" character varying NOT NULL, "amazonSku" character varying NOT NULL, "amazonQuantity" integer NOT NULL DEFAULT '0', "graingerTrackingNumber" character varying, "graingerShipMethod" "order-items_graingershipmethod_enum", "graingerOrderId" character varying, "graingerShipDate" date, "graingerWebNumber" character varying, "note" character varying, "orderId" uuid, CONSTRAINT "UQ_a71e258360def237e6a2e1907d1" UNIQUE ("amazonItemId"), CONSTRAINT "PK_605fbaee38242facaa1a34b67ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order-items" ADD CONSTRAINT "FK_d42918a88740ece11347e20918f" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order-items" DROP CONSTRAINT "FK_d42918a88740ece11347e20918f"`);
        await queryRunner.query(`DROP TABLE "order-items"`);
        await queryRunner.query(`DROP TYPE "order-items_graingershipmethod_enum"`);
    }

}
