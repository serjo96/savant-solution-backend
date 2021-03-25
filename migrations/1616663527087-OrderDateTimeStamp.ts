import {MigrationInterface, QueryRunner} from "typeorm";

export class OrderDateTimeStamp1616663527087 implements MigrationInterface {
    name = 'OrderDateTimeStamp1616663527087'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "orderDate"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "orderDate" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "orderDate"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "orderDate" date`);
    }

}
