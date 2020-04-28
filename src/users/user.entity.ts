/* eslint-disable unused-imports/no-unused-vars-ts */
import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, Index } from 'typeorm';

import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column('varchar')
  email: string;

  @Exclude()
  @Column('varchar', {
    nullable: true,
  })
  emailCandidate?: string;

  @Exclude()
  @Column('varchar', {
    nullable: true,
  })
  emailProofToken?: string;

  @Exclude()
  @Column('datetime', {
    nullable: true,
  })
  emailProofTokenExpiresAt?: Date;

  @Exclude()
  @Column('varchar')
  password: string;

  @Exclude()
  @Column('varchar', {
    nullable: true,
  })
  passwordResetToken?: string;

  @Exclude()
  @Column('datetime', {
    nullable: true,
  })
  passwordResetTokenExpiresAt?: Date;

  @Column('boolean', {
    default: false,
  })
  isActive: boolean;

  @Column()
  avatar?: string;

  @BeforeInsert()
  beforeInsertActions() {
    this.isActive = false;
  }
}
