import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeItemRelations1611923705131 implements MigrationInterface {
    name = 'ChangeItemRelations1611923705131'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grainger-item" DROP CONSTRAINT "FK_46d9f5eee752a1df08fa789777f"`);
        await queryRunner.query(`ALTER TABLE "grainger-item" DROP COLUMN "orderItemsId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grainger-item" ADD "orderItemsId" uuid`);
        await queryRunner.query(`ALTER TABLE "grainger-item" ADD CONSTRAINT "FK_46d9f5eee752a1df08fa789777f" FOREIGN KEY ("orderItemsId") REFERENCES "items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
