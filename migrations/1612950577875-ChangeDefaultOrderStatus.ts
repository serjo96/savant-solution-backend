import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeDefaultOrderStatus1612950577875 implements MigrationInterface {
    name = 'ChangeDefaultOrderStatus1612950577875'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."orders_status_enum" RENAME TO "orders_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "orders_status_enum" AS ENUM('0', '1', '2', '3', '4')`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" TYPE "orders_status_enum" USING "status"::"text"::"orders_status_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT '0'`);
        await queryRunner.query(`DROP TYPE "orders_status_enum_old"`);
        await queryRunner.query(`COMMENT ON COLUMN "orders"."status" IS NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT '2'`);
        await queryRunner.query(`COMMENT ON COLUMN "orders"."status" IS NULL`);
        await queryRunner.query(`CREATE TYPE "orders_status_enum_old" AS ENUM('3', '2', '1', '0')`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" TYPE "orders_status_enum_old" USING "status"::"text"::"orders_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT '0'`);
        await queryRunner.query(`DROP TYPE "orders_status_enum"`);
        await queryRunner.query(`ALTER TYPE "orders_status_enum_old" RENAME TO  "orders_status_enum"`);
    }

}
