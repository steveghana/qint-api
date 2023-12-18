import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  BaseEntity,
  Column,
  Entity,
  Generated,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from '../user.entity';
import { CredentialTokenEntity } from '../CredentialToken/credentialToken.entity';
import uuid from '../../../../../apps/util/uuid';
import BusinessEntity from '../../../../../apps/business/src/models/business.entity';
import AssociableModel from '../../../../../apps/Config/associable';

@Entity('authToken')
export class AuthtokenEntity extends AssociableModel {
  @PrimaryColumn('uuid')
  id: string = uuid.makeUuid();

  @Column({ nullable: false, default: true })
  isActive: boolean;

  @Column({ nullable: false, default: new Date() })
  lastUsed: Date;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.email, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: UserEntity;

  @ManyToOne(
    () => CredentialTokenEntity,
    (credentialToken) => credentialToken.authToken,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'credentialTokenId', referencedColumnName: 'id' })
  credentialTokens: CredentialTokenEntity;
  @Column({ nullable: true })
  credentialTokenId?: number;

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setcredentialTokenId(): void {
    this.credentialTokenId = this.credentialTokens?.id;
  }
}
