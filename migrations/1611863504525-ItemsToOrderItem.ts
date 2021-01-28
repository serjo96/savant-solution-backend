import {MigrationInterface, QueryRunner} from "typeorm";

export class ItemsToOrderItem1611863504525 implements MigrationInterface {
    name = 'ItemsToOrderItem1611863504525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_4233162be54c334e0ef7e4a3a68"`);
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_40e681891fea5a4b3c5c2546d15"`);
        await queryRunner.query(`CREATE TYPE "order-items_status_enum" AS ENUM('1', '0')`);
        await queryRunner.query(`CREATE TABLE "order-items" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "amazonSku" character varying NOT NULL, "graingerItemNumber" character varying, "graingerPackQuantity" integer, "graingerThreshold" integer, "status" "order-items_status_enum" NOT NULL DEFAULT '1', "graingerAccountId" uuid, "orderItemsId" uuid, "userId" uuid, CONSTRAINT "PK_605fbaee38242facaa1a34b67ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."items_status_enum"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "graingerAccountId"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "graingerItemNumber"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "graingerPackQuantity"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "graingerThreshold"`);
        await queryRunner.query(`ALTER TABLE "items" ADD "itemId" uuid`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "FK_151f283a98f27c634dacfdb965b" FOREIGN KEY ("itemId") REFERENCES "order-items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order-items" ADD CONSTRAINT "FK_9b9dbfe1d9f8da556a8454ddf37" FOREIGN KEY ("graingerAccountId") REFERENCES "grainger-account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order-items" ADD CONSTRAINT "FK_3feee8482a8522c56858d28b17c" FOREIGN KEY ("orderItemsId") REFERENCES "items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order-items" ADD CONSTRAINT "FK_bf01051e9d39496f7cac0f37244" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order-items" DROP CONSTRAINT "FK_bf01051e9d39496f7cac0f37244"`);
        await queryRunner.query(`ALTER TABLE "order-items" DROP CONSTRAINT "FK_3feee8482a8522c56858d28b17c"`);
        await queryRunner.query(`ALTER TABLE "order-items" DROP CONSTRAINT "FK_9b9dbfe1d9f8da556a8454ddf37"`);
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_151f283a98f27c634dacfdb965b"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "itemId"`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerThreshold" integer`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerPackQuantity" integer`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerItemNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerAccountId" uuid`);
        await queryRunner.query(`ALTER TABLE "items" ADD "userId" uuid`);
        await queryRunner.query(`CREATE TYPE "public"."items_status_enum" AS ENUM('1', '0')`);
        await queryRunner.query(`ALTER TABLE "items" ADD "status" "items_status_enum" NOT NULL DEFAULT '1'`);
        await queryRunner.query(`DROP TABLE "order-items"`);
        await queryRunner.query(`DROP TYPE "order-items_status_enum"`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "FK_40e681891fea5a4b3c5c2546d15" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "FK_4233162be54c334e0ef7e4a3a68" FOREIGN KEY ("graingerAccountId") REFERENCES "grainger-account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
