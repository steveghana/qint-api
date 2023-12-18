import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from '../user.entity';
import { AuthtokenEntity } from '../Token/authToken.entity';
import uuid from '../../../../util/uuid';
import AssociableModel from '../../../../../apps/Config/associable';

@Entity('credentialToken')
export class CredentialTokenEntity extends AssociableModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'uuid',
    unique: true,
  })
  uuid: string = uuid.makeUuid();

  @Column({ nullable: false, default: true })
  isActive: boolean;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.credentials, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: UserEntity;
  @OneToMany(
    () => AuthtokenEntity,
    (authToken) => authToken.credentialTokens,
    {
      onDelete: 'CASCADE',
    },
  )

  authToken: AuthtokenEntity[];

  @Column({ nullable: true })
  userEmail?: string ;


  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setuserEmail(): void {
    this.userEmail = this.user?.email;
  }
}
