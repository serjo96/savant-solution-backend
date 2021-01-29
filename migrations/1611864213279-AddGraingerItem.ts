import {MigrationInterface, QueryRunner} from "typeorm";

export class AddGraingerItem1611864213279 implements MigrationInterface {
    name = 'AddGraingerItem1611864213279'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_4233162be54c334e0ef7e4a3a68"`);
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_40e681891fea5a4b3c5c2546d15"`);
        await queryRunner.query(`CREATE TYPE "grainger-item_status_enum" AS ENUM('1', '0')`);
        await queryRunner.query(`CREATE TABLE "grainger-item" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "amazonSku" character varying NOT NULL, "graingerItemNumber" character varying, "graingerPackQuantity" integer, "graingerThreshold" integer, "status" "grainger-item_status_enum" NOT NULL DEFAULT '1', "graingerAccountId" uuid, "orderItemsId" uuid, "userId" uuid, CONSTRAINT "PK_fb26b6f17a6cfb696a771a5b33d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."items_status_enum"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "graingerAccountId"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "graingerItemNumber"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "graingerPackQuantity"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "graingerThreshold"`);
        await queryRunner.query(`ALTER TABLE "items" ADD "itemId" uuid`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "FK_151f283a98f27c634dacfdb965b" FOREIGN KEY ("itemId") REFERENCES "grainger-item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grainger-item" ADD CONSTRAINT "FK_100e4e2564b2c9c8218e3f4e0ce" FOREIGN KEY ("graingerAccountId") REFERENCES "grainger-account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grainger-item" ADD CONSTRAINT "FK_46d9f5eee752a1df08fa789777f" FOREIGN KEY ("orderItemsId") REFERENCES "items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grainger-item" ADD CONSTRAINT "FK_d96559739ce9a8423390d8039b6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grainger-item" DROP CONSTRAINT "FK_d96559739ce9a8423390d8039b6"`);
        await queryRunner.query(`ALTER TABLE "grainger-item" DROP CONSTRAINT "FK_46d9f5eee752a1df08fa789777f"`);
        await queryRunner.query(`ALTER TABLE "grainger-item" DROP CONSTRAINT "FK_100e4e2564b2c9c8218e3f4e0ce"`);
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_151f283a98f27c634dacfdb965b"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "itemId"`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerThreshold" integer`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerPackQuantity" integer`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerItemNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "items" ADD "graingerAccountId" uuid`);
        await queryRunner.query(`ALTER TABLE "items" ADD "userId" uuid`);
        await queryRunner.query(`CREATE TYPE "public"."items_status_enum" AS ENUM('1', '0')`);
        await queryRunner.query(`ALTER TABLE "items" ADD "status" "items_status_enum" NOT NULL DEFAULT '1'`);
        await queryRunner.query(`DROP TABLE "grainger-item"`);
        await queryRunner.query(`DROP TYPE "grainger-item_status_enum"`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "FK_40e681891fea5a4b3c5c2546d15" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "FK_4233162be54c334e0ef7e4a3a68" FOREIGN KEY ("graingerAccountId") REFERENCES "grainger-account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
