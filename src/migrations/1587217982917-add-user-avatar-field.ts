import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUserAvatarField1587217982917 implements MigrationInterface {
  name = 'addUserAvatarField1587217982917';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user` ADD `avatar` text NULL', undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `avatar`', undefined);
  }
}
