import {MigrationInterface, QueryRunner} from "typeorm";

export class AddUserIdToItems1611491752956 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" ADD COLUMN "userId" uuid null`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "userId"`);
    }

}
