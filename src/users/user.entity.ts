import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  Index,
} from 'typeorm';
import { SerializedUser } from './interfaces/serialized-user.interface';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column('varchar')
  email: string;

  @Column('varchar', {
    nullable: true,
  })
  emailCandidate?: string;

  @Column('varchar', {
    nullable: true,
  })
  emailProofToken?: string;

  @Column('datetime', {
    nullable: true,
  })
  emailProofTokenExpiresAt?: Date;

  @Column('varchar')
  password: string;

  @Column('varchar', {
    nullable: true,
  })
  passwordResetToken?: string;

  @Column('datetime', {
    nullable: true,
  })
  passwordResetTokenExpiresAt?: Date;

  @Column('boolean', {
    default: false,
  })
  isActive: boolean;

  @BeforeInsert()
  beforeInsertActions() {
    this.isActive = false;
  }

  toRaw(): SerializedUser {
    const {
      password,
      emailProofToken,
      emailProofTokenExpiresAt,
      passwordResetToken,
      passwordResetTokenExpiresAt,
      emailCandidate,
      ...serializedUser
    } = this;
    return serializedUser;
  }

  static serializeCollection(entities: User[]): SerializedUser[] {
    return entities.map(entity => entity.toRaw());
  }
}
