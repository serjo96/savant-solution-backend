import {MigrationInterface, QueryRunner} from "typeorm";

export class OrderDateTimeStampWithTimezome1616664423870 implements MigrationInterface {
    name = 'OrderDateTimeStampWithTimezome1616664423870'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "orderDate"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "orderDate" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "orderDate"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "orderDate" date`);
    }

}
