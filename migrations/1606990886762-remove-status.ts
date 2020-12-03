import {MigrationInterface, QueryRunner} from "typeorm";

export class removeStatus1606990886762 implements MigrationInterface {
    name = 'removeStatus1606990886762'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."items_status_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."items_status_enum" AS ENUM('0', '1')`);
        await queryRunner.query(`ALTER TABLE "items" ADD "status" "items_status_enum" array NOT NULL DEFAULT '{0}'`);
    }

}
