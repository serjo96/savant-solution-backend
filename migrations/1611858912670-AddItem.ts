import {MigrationInterface, QueryRunner} from "typeorm";

export class AddItem1611858912670 implements MigrationInterface {
    name = 'AddItem1611858912670'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "items" ("id" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "amazonSku" character varying NOT NULL, "graingerItemNumber" character varying, "graingerPackQuantity" integer, "graingerThreshold" integer, "status" "items_status_enum" NOT NULL DEFAULT '1', "graingerAccountId" uuid, "orderItemsId" uuid, "userId" uuid, CONSTRAINT "PK_ba5885359424c15ca6b9e79bcf6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order-items" ADD "itemId" uuid`);
        await queryRunner.query(`ALTER TABLE "order-items" ADD CONSTRAINT "FK_f50f9b803432b8d669d1aa854bf" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "FK_4233162be54c334e0ef7e4a3a68" FOREIGN KEY ("graingerAccountId") REFERENCES "grainger-account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "FK_8919c7c005dd69fd47cc7b8ae54" FOREIGN KEY ("orderItemsId") REFERENCES "order-items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "FK_40e681891fea5a4b3c5c2546d15" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_40e681891fea5a4b3c5c2546d15"`);
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_8919c7c005dd69fd47cc7b8ae54"`);
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_4233162be54c334e0ef7e4a3a68"`);
        await queryRunner.query(`ALTER TABLE "order-items" DROP CONSTRAINT "FK_f50f9b803432b8d669d1aa854bf"`);
        await queryRunner.query(`ALTER TABLE "order-items" DROP COLUMN "itemId"`);
        await queryRunner.query(`DROP TABLE "items"`);
    }

}
