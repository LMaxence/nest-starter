import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
import { SerializedUser } from './interfaces/serialized-user.interface';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  email: string;

  @Column('text', {
    nullable: true,
  })
  emailCandidate: string;

  @Column('text', {
    nullable: true,
  })
  emailProofToken: string;

  @Column('text')
  password: string;

  @Column('boolean', {
    default: false,
  })
  isActive: boolean;

  @BeforeInsert()
  beforeInsertActions() {
    this.isActive = false;
  }

  toRaw(): SerializedUser {
    const { password, emailCandidate, ...serializedUser } = this;
    return serializedUser;
  }

  static serializeCollection(entities: User[]): SerializedUser[] {
    return entities.map(entity => entity.toRaw());
  }
}
