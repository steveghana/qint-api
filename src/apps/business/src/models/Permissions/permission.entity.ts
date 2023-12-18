import { Contains } from 'class-validator';
import {
  Column,
  Entity,
  Generated,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  BaseEntity,
  JoinColumn,
  AfterLoad,
  AfterInsert,
  AfterUpdate,
} from 'typeorm';
import { AuthtokenEntity } from '../../../../auth/src/models/Token/authToken.entity';
import { UserEntity } from '../../../../auth/src/models/user.entity';
import { QueueGroupPossibleTypes } from '../../../../types/queueGroup';
import { BusinessEntity } from '../business.entity';
import AssociableModel from '../../../../../apps/Config/associable';

type QueueGroupType = (typeof QueueGroupPossibleTypes)[number];
let typeOptions: QueueGroupType;
@Entity({ name: 'businessPermissions' })
export class BusinessPermissionEntity extends AssociableModel {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ nullable: false, default: false })
  canManageQueue: boolean;
  @Column({ nullable: false, default: false })
  canManagePermissions: boolean;
  @Column({ nullable: false, default: false })
  isOwner: boolean;
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.email, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: UserEntity;

  @ManyToOne(() => BusinessEntity, (IBusiness) => IBusiness.permissions, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'queueGroupId', referencedColumnName: 'id' })
  queueGroup: BusinessEntity;
  @Column({ nullable: true })
  queueGroupId?: number | string;

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setQueueGroupId(): void {
    this.queueGroupId = this.queueGroup?.id;
  }
  @Column({ nullable: true })
  userEmail?: string;

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setuserEmail(): void {
    this.userEmail = this.user?.email;
  }
}
