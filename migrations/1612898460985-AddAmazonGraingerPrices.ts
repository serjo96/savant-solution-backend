import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAmazonGraingerPrices1612898460985 implements MigrationInterface {
    name = 'AddAmazonGraingerPrices1612898460985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order-items" ADD "amazonPrice" real NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order-items" ADD "graingerPrice" real`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order-items" DROP COLUMN "graingerPrice"`);
        await queryRunner.query(`ALTER TABLE "order-items" DROP COLUMN "amazonPrice"`);
    }

}
