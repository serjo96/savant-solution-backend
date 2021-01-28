import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateGraingerAccount1611658446316 implements MigrationInterface {
    name = 'UpdateGraingerAccount1611658446316'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grainger-account" RENAME COLUMN "login" TO "email"`);
        await queryRunner.query(`ALTER TABLE "grainger-account" RENAME CONSTRAINT "UQ_3cdb6254375fd85d41997dbd818" TO "UQ_75bc929721a12e80041db8714c2"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grainger-account" RENAME CONSTRAINT "UQ_75bc929721a12e80041db8714c2" TO "UQ_3cdb6254375fd85d41997dbd818"`);
        await queryRunner.query(`ALTER TABLE "grainger-account" RENAME COLUMN "email" TO "login"`);
    }

}
