import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  BaseEntity,
  Generated,
  ManyToMany,
  JoinColumn,
  AfterLoad,
  AfterInsert,
  AfterUpdate,
} from 'typeorm';
import BusinessEntity from '../business.entity';
import { QueueCustomerQueueArea } from '../../../../customer/src/models/Areas/queueCustomerQueueArea.entity';
import { QueueAreaTrait } from '../AreaTraits/queueAreaTrait.entity';
import { QueueAreaQueueTable } from '../AreaQueTables/queueAreaQueueTable.entity';
import { QueueGroupTable } from '../businessTables/queueGroupTable.entity';
import AssociableModel from '../../../../../apps/Config/associable';
import { CustomerEntity } from '../../../../../apps/customer/src/models/customer.entity';
import { ReservationQueueAreaEntity } from './reservationQueueArea.entity';
import { ReservationTraitEntity } from './reservationTrait.entity';

@Entity('reservation')
export class ReservationEntity extends AssociableModel {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  date: Date;
  @Column()
  startTimeHour: number;
  @Column()
  startTimeMinute: number;
  @Column()
  endTimeHour: number;
  @Column()
  endTimeMinute: number;
  @Column({ default: 1 })
  peopleCount: number;
  @Column({ default: '' })
  comment: string;

  @Column({ default: '' })
  text: string;
  @Column({ default: '' })
  imageUrl: string;

  @ManyToOne(() => BusinessEntity, (IBusiness) => IBusiness.reservation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'queueGroupId', referencedColumnName: 'id' })
  queueGroup: BusinessEntity;
  @ManyToOne(() => CustomerEntity, (IBusiness) => IBusiness.reservation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customerId', referencedColumnName: 'id' })
  customer: CustomerEntity;
  @OneToMany(
    () => ReservationQueueAreaEntity,
    (reservationQueueArea) => reservationQueueArea.reservation,
    { onDelete: 'CASCADE' },
  )
  reservationQueueAreas: ReservationQueueAreaEntity[];
  @OneToMany(
    () => ReservationTraitEntity,
    (reservationQueueArea) => reservationQueueArea.reservation,
    { onDelete: 'CASCADE' },
  )
  reservationTrait: ReservationQueueAreaEntity[];
  @Column({ nullable: true })
  queueGroupId?: number ;


  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setQueueGroupId(): void {
    this.queueGroupId = this.queueGroup?.id;
  }
  @Column({ nullable: true })
  customerId?: string;


  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setcustomerId(): void {
    this.customerId = this.customer?.id;
  }
  
}
