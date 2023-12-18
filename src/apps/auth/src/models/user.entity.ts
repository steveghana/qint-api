import { BusinessPermissionEntity } from '../../../../apps/business/src/models/Permissions/permission.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthtokenEntity } from './Token/authToken.entity';
import { CredentialTokenEntity } from './CredentialToken/credentialToken.entity';
import AssociableModel from '../../../../apps/Config/associable';

@Entity('user')
export class UserEntity extends AssociableModel {
  @Column({ nullable: false, primary: true })
  email: string;

  @Column({ default: '' })
  fullName: string;

  @Column()
  password: string;

  @Column({ nullable: true, default: null })
  lockReason: string;

  @OneToMany(() => AuthtokenEntity, (IAuthToken) => IAuthToken.user, {
    onDelete: 'CASCADE',
  })
  authToken: AuthtokenEntity[];
  @OneToMany(
    () => BusinessPermissionEntity,
    (Ipermission) => Ipermission.user,
    {
      onDelete: 'CASCADE',
    },
  )
  permissions: BusinessPermissionEntity[];
  @OneToMany(() => CredentialTokenEntity, (credential) => credential.user)
  credentials: CredentialTokenEntity;
}
