import {MigrationInterface, QueryRunner} from "typeorm";

export class changeShipCityName1610825547430 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE orders
        RENAME COLUMN "shipСity" TO "shipCity"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE orders
        RENAME COLUMN "shipCity" TO "shipСity"`);
    }

}
