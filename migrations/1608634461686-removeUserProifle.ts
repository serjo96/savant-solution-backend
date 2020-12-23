import {MigrationInterface, QueryRunner} from "typeorm";

export class removeUserProifle1608634461686 implements MigrationInterface {
    name = 'removeUserProifle1608634461686'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_b1bda35cdb9a2c1b777f5541d87"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "profileId" TO "name"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME CONSTRAINT "REL_b1bda35cdb9a2c1b777f5541d8" TO "UQ_51b8b26ac168fbe7d6f5653e6cf"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_51b8b26ac168fbe7d6f5653e6cf"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "name" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "name" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_51b8b26ac168fbe7d6f5653e6cf" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "users" RENAME CONSTRAINT "UQ_51b8b26ac168fbe7d6f5653e6cf" TO "REL_b1bda35cdb9a2c1b777f5541d8"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "name" TO "profileId"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_b1bda35cdb9a2c1b777f5541d87" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
