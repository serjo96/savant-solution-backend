import {MigrationInterface, QueryRunner} from "typeorm";

export class AddPricesions1612900471420 implements MigrationInterface {
    name = 'AddPricesions1612900471420'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order-items" DROP COLUMN "amazonPrice"`);
        await queryRunner.query(`ALTER TABLE "order-items" ADD "amazonPrice" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order-items" DROP COLUMN "graingerPrice"`);
        await queryRunner.query(`ALTER TABLE "order-items" ADD "graingerPrice" numeric(5,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order-items" DROP COLUMN "graingerPrice"`);
        await queryRunner.query(`ALTER TABLE "order-items" ADD "graingerPrice" real`);
        await queryRunner.query(`ALTER TABLE "order-items" DROP COLUMN "amazonPrice"`);
        await queryRunner.query(`ALTER TABLE "order-items" ADD "amazonPrice" real NOT NULL DEFAULT '0'`);
    }

}
