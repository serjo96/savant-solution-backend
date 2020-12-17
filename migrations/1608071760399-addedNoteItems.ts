import {MigrationInterface, QueryRunner} from "typeorm";

export class addedNoteItems1608071760399 implements MigrationInterface {
    name = 'addedNoteItems1608071760399'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" ADD "note" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "note"`);
    }

}
