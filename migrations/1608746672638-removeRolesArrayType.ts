import {MigrationInterface, QueryRunner} from "typeorm";

export class removeRolesArrayType1608746672638 implements MigrationInterface {
    name = 'removeRolesArrayType1608746672638'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "roles"`);
        await queryRunner.query(`DROP TYPE "public"."users_roles_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_roles_enum" AS ENUM('0', '1', '2', '3')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "roles" "users_roles_enum" array NOT NULL DEFAULT '{0}'`);
    }

}
