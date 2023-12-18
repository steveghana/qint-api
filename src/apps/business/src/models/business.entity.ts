// import { QueueGroupPossibleTypes } from '@/apps/types/queueGroup';
import { Contains } from 'class-validator';
import {
  BaseEntity,
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthtokenEntity } from '../../../auth/src/models/Token/authToken.entity';

import { BusinessPermissionEntity } from './Permissions/permission.entity';
import AssociableModel from '../../../../apps/Config/associable';

type QueueGroupType = (typeof QueueGroupPossibleTypes)[number];
let typeOptions: QueueGroupType;
import {
  IQueueGroup,
  IQueueGroupType,
  QueueGroupPossibleTypes,
} from '../../../types/queueGroup';
import { IQueue } from '../../../types/queue';
import { QueueEntity } from '../../../queue/src/model/queue.entity';
import { QueueArea } from './Area/queueArea.entity';
import { QueueGroupTable } from './businessTables/queueGroupTable.entity';
import Advertisement from '../services/advertisement/Entity/advertisement';
import { AdvertisementEntity } from './advertisement/index.entity';
import { ReservationEntity } from './reservation/index.entity';

@Entity('queueGroup')
export class BusinessEntity extends AssociableModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
   name: string;

  @Column({ nullable: true })
   logoUrl: string;

  @Column({ nullable: true })
   address: string;

  @Column({ type: 'float', nullable: true })
   geometryLat: number;

  @Column({ type: 'float', nullable: true })
   geometryLong: number;

  @Column({ type: 'float', nullable: true })
   centerLat: number;

  @Column({ type: 'float', nullable: true })
   centerLong: number;

  @Column({ nullable: true })
   countryCode: number;

  @Column({ nullable: true })
   phone: string;

  @Column({ default: QueueGroupPossibleTypes[0] })
   type: IQueueGroupType;
  @OneToMany(
    () => BusinessPermissionEntity,
    (permission) => permission.queueGroup,
    {
      onDelete: 'CASCADE',
    
    },
  )
  permissions: BusinessPermissionEntity[];
  @OneToMany(() => QueueGroupTable, (Itable) => Itable.queueGroup, {
    onDelete: 'CASCADE',
  })
  public tables: QueueGroupTable[];
  @OneToMany(() => AdvertisementEntity, (Itable) => Itable.queueGroup, {
    onDelete: 'CASCADE',
  })
  public advertisement: AdvertisementEntity[];
  @OneToMany(() => ReservationEntity, (Itable) => Itable.queueGroup, {
    onDelete: 'CASCADE',
  })
  public reservation: ReservationEntity[];

  @OneToMany(() => QueueEntity, (queue) => queue.queueGroup, {
    onDelete: 'CASCADE',
  })
  queues: QueueEntity[];

  @OneToMany(() => QueueArea, (area) => area.queueGroup, {
    onDelete: 'CASCADE',
  })
  public areas: QueueArea[];
}

export default BusinessEntity;
