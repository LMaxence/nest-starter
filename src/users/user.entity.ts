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
  emailCandidate: string;

  @Column('varchar', {
    nullable: true,
  })
  emailProofToken: string;

  @Column('varchar')
  password: string;

  @Column('varchar', {
    nullable: true,
  })
  passwordResetToken: string;

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
      passwordResetToken,
      emailCandidate,
      ...serializedUser
    } = this;
    return serializedUser;
  }

  static serializeCollection(entities: User[]): SerializedUser[] {
    return entities.map(entity => entity.toRaw());
  }
}
