import {MigrationInterface, QueryRunner} from "typeorm";

export class createStatusColumnItem1606991381534 implements MigrationInterface {
    name = 'createStatusColumnItem1606991381534'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "items_status_enum" AS ENUM('1', '0')`);
        await queryRunner.query(`ALTER TABLE "items" ADD "status" "items_status_enum" NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "items_status_enum"`);
    }

}
