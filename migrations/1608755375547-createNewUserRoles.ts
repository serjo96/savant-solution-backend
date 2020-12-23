import {MigrationInterface, QueryRunner} from "typeorm";

export class createNewUserRoles1608755375547 implements MigrationInterface {
    name = 'createNewUserRoles1608755375547'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "users_roles_enum" AS ENUM('0', '1', '2', '3')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "roles" "users_roles_enum" NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "roles"`);
        await queryRunner.query(`DROP TYPE "users_roles_enum"`);
    }

}
