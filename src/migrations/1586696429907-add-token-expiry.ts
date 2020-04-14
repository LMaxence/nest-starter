import { MigrationInterface, QueryRunner } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/class-name-casing
export class addTokenExpiry1586696429907 implements MigrationInterface {
  name = 'addTokenExpiry1586696429907';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user` ADD `emailProofTokenExpiresAt` datetime NULL', undefined);
    await queryRunner.query('ALTER TABLE `user` ADD `passwordResetTokenExpiresAt` datetime NULL', undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `passwordResetTokenExpiresAt`', undefined);
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `emailProofTokenExpiresAt`', undefined);
  }
}
