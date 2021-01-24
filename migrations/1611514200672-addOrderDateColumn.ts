import {MigrationInterface, QueryRunner} from "typeorm";

export class addOrderDateColumn1611514200672 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN "orderDate" timestamptz default NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "orderDate"`);
    }
}
