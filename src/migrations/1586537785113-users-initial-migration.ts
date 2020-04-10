import {MigrationInterface, QueryRunner} from "typeorm";

export class usersInitialMigration1586537785113 implements MigrationInterface {
    name = 'usersInitialMigration1586537785113'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `email` text NOT NULL, `password` text NOT NULL, `isActive` tinyint NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `user`", undefined);
    }

}
