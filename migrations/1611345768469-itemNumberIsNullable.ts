import { MigrationInterface, QueryRunner } from 'typeorm';

export class itemNumberIsNullable1611345768469 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "items" ALTER COLUMN "itemNumber" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "items" ALTER COLUMN "itemNumber" SET NOT NULL`);
  }

}
