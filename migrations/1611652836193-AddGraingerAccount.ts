import {MigrationInterface, QueryRunner} from "typeorm";

export class AddGraingerAccount1611652836193 implements MigrationInterface {
    name = 'AddGraingerAccount1611652836193'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" RENAME COLUMN "supplier" TO "graingerAccountId"`);
        await queryRunner.query(`CREATE TABLE "grainger-account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "login" character varying NOT NULL, "password" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_3cdb6254375fd85d41997dbd818" UNIQUE ("login"), CONSTRAINT "PK_c18f29c7774ecf03a2d1dea5334" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "graingerAccountId"`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerAccountId" uuid`);
        await queryRunner.query(`COMMENT ON COLUMN "orders"."createdAt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`COMMENT ON COLUMN "orders"."updatedAt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "orderDate"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "orderDate" date`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "shipState"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "shipState" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "shipPostalCode"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "shipPostalCode" integer`);
        await queryRunner.query(`CREATE INDEX "IDX_40e681891fea5a4b3c5c2546d1" ON "items" ("userId") `);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "FK_4233162be54c334e0ef7e4a3a68" FOREIGN KEY ("graingerAccountId") REFERENCES "grainger-account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_4233162be54c334e0ef7e4a3a68"`);
        await queryRunner.query(`DROP INDEX "IDX_40e681891fea5a4b3c5c2546d1"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "shipPostalCode"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "shipPostalCode" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "shipState"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "shipState" character varying(2)`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "orderDate"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "orderDate" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "updatedAt" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "orders"."updatedAt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "createdAt" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "orders"."createdAt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "graingerAccountId"`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerAccountId" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "grainger-account"`);
        await queryRunner.query(`ALTER TABLE "items" RENAME COLUMN "graingerAccountId" TO "supplier"`);
    }

}
