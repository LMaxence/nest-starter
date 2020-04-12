import {MigrationInterface, QueryRunner} from "typeorm";

export class userEmailValidationFields1586673956041 implements MigrationInterface {
    name = 'userEmailValidationFields1586673956041'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD `emailCandidate` text NULL", undefined);
        await queryRunner.query("ALTER TABLE `user` ADD `emailProofToken` text NULL", undefined);
        await queryRunner.query("ALTER TABLE `user` CHANGE `isActive` `isActive` tinyint NOT NULL DEFAULT 0", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `isActive` `isActive` tinyint NOT NULL", undefined);
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `emailProofToken`", undefined);
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `emailCandidate`", undefined);
    }

}
