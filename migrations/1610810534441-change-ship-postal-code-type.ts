import {MigrationInterface, QueryRunner} from "typeorm";

export class changeShipPostalCodeType1610810534441 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE orders
ALTER COLUMN "shipPostalCode" TYPE varchar`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE orders
ALTER COLUMN "shipPostalCode" TYPE integer`);
    }

}
