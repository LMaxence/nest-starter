import { MigrationInterface, QueryRunner } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/class-name-casing
export class userEmailUnicity1586679883391 implements MigrationInterface {
  name = 'userEmailUnicity1586679883391';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `email`', undefined);
    await queryRunner.query('ALTER TABLE `user` ADD `email` varchar(255) NOT NULL', undefined);
    await queryRunner.query('ALTER TABLE `user` ADD UNIQUE INDEX `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`)', undefined);
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `emailCandidate`', undefined);
    await queryRunner.query('ALTER TABLE `user` ADD `emailCandidate` varchar(255) NULL', undefined);
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `emailProofToken`', undefined);
    await queryRunner.query('ALTER TABLE `user` ADD `emailProofToken` varchar(255) NULL', undefined);
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `password`', undefined);
    await queryRunner.query('ALTER TABLE `user` ADD `password` varchar(255) NOT NULL', undefined);
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `passwordResetToken`', undefined);
    await queryRunner.query('ALTER TABLE `user` ADD `passwordResetToken` varchar(255) NULL', undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `passwordResetToken`', undefined);
    await queryRunner.query('ALTER TABLE `user` ADD `passwordResetToken` text NULL', undefined);
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `password`', undefined);
    await queryRunner.query('ALTER TABLE `user` ADD `password` text NOT NULL', undefined);
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `emailProofToken`', undefined);
    await queryRunner.query('ALTER TABLE `user` ADD `emailProofToken` text NULL', undefined);
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `emailCandidate`', undefined);
    await queryRunner.query('ALTER TABLE `user` ADD `emailCandidate` text NULL', undefined);
    await queryRunner.query('ALTER TABLE `user` DROP INDEX `IDX_e12875dfb3b1d92d7d7c5377e2`', undefined);
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `email`', undefined);
    await queryRunner.query('ALTER TABLE `user` ADD `email` text NOT NULL', undefined);
  }
}
