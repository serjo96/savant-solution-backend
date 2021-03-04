import {MigrationInterface, QueryRunner} from "typeorm";

export class AddErrorsToOrderItem1613398051723 implements MigrationInterface {
    name = 'AddErrorsToOrderItem1613398051723'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order-items" ADD "errors" character varying`);
        await queryRunner.query(`ALTER TABLE "grainger-items" DROP CONSTRAINT "FK_87928905b726de0a821739eef22"`);
        await queryRunner.query(`COMMENT ON COLUMN "grainger-account"."id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "grainger-account" ALTER COLUMN "id" DROP DEFAULT`);
        // await queryRunner.query(`DROP SEQUENCE "grainger-account_id_seq"`);
        await queryRunner.query(`ALTER TABLE "grainger-items" ADD CONSTRAINT "FK_87928905b726de0a821739eef22" FOREIGN KEY ("graingerAccountId") REFERENCES "grainger-account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grainger-items" DROP CONSTRAINT "FK_87928905b726de0a821739eef22"`);
        await queryRunner.query(`CREATE SEQUENCE "grainger-account_id_seq" OWNED BY "grainger-account"."id"`);
        await queryRunner.query(`ALTER TABLE "grainger-account" ALTER COLUMN "id" SET DEFAULT nextval('grainger-account_id_seq')`);
        await queryRunner.query(`COMMENT ON COLUMN "grainger-account"."id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "grainger-items" ADD CONSTRAINT "FK_87928905b726de0a821739eef22" FOREIGN KEY ("graingerAccountId") REFERENCES "grainger-account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order-items" DROP COLUMN "errors"`);
    }

}
