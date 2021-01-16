import {MigrationInterface, QueryRunner} from "typeorm";

export class updatedOrdersRelationToUser1610795483119 implements MigrationInterface {
    name = 'updatedOrdersRelationToUser1610795483119'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_916c66b74d50fe7cad01e3e5895"`);
        await queryRunner.query(`ALTER TABLE "orders" RENAME COLUMN "userIdId" TO "userId"`);
        await queryRunner.query(`CREATE INDEX "IDX_151b79a83ba240b0cb31b2302d" ON "orders" ("userId") `);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`);
        await queryRunner.query(`DROP INDEX "IDX_151b79a83ba240b0cb31b2302d"`);
        await queryRunner.query(`ALTER TABLE "orders" RENAME COLUMN "userId" TO "userIdId"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_916c66b74d50fe7cad01e3e5895" FOREIGN KEY ("userIdId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
