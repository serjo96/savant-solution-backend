import {MigrationInterface, QueryRunner} from "typeorm";

export class AddOrderItemErrorField1617119533406 implements MigrationInterface {
    name = 'AddOrderItemErrorField1617119533406'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order-items" DROP COLUMN "errors"`);
        await queryRunner.query(`CREATE TYPE "order-items_error_enum" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14')`);
        await queryRunner.query(`ALTER TABLE "order-items" ADD "error" "order-items_error_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order-items" DROP COLUMN "error"`);
        await queryRunner.query(`DROP TYPE "order-items_error_enum"`);
        await queryRunner.query(`ALTER TABLE "order-items" ADD "errors" character varying`);
    }

}
