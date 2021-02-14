import {MigrationInterface, QueryRunner} from "typeorm";

export class fixGraingerAccountEntity1613232304088 implements MigrationInterface {
    name = 'fixGraingerAccountEntity1613232304088'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grainger-account" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "grainger-account" ADD "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "grainger-account" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grainger-account" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "grainger-account" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "grainger-account" DROP COLUMN "createdAt"`);
    }

}
