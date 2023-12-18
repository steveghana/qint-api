import {
  Column,
  Entity,
  Generated,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  BaseEntity,
  JoinColumn,
  JoinTable,
  AfterLoad,
  AfterInsert,
  AfterUpdate,
} from 'typeorm';
import { Contains } from 'class-validator';
import {
  IQueueCustomer,
  QueueCustomerLeaveReasons,
} from '../../../../types/queueCustomer';
import { CustomerEntity } from '../customer.entity';
import { QueueEntity } from '../../../../queue/src/model/queue.entity';
import { QueueCustomerTraits } from '../Traits/queueCustomerTrait.entity';
import { QueueCustomerQueueArea } from '../Areas/queueCustomerQueueArea.entity';
import { IQueue } from '../../../../types/queue';
import AssociableModel from '../../../../../apps/Config/associable';
import { Cart } from '../CartItems/CartItem.entity';

type QueueGroupType = (typeof QueueCustomerLeaveReasons)[number];
let typeOptions: QueueGroupType;
// import { createQueryBuilder } from "typeorm";

// const nowExpression = createQueryBuilder().expr("NOW()");

@Entity('queueCustomer')
export class QueueCustomerEntity extends AssociableModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,

    default: new Date(),
  })
  joinTime: Date;
  @Column({ nullable: true })
  leaveTime: Date;
  @Column({ nullable: true })
  callTime: Date;
  @Column()
  number: number;
  @Column({ default: 0 })
  snoozeCounter: number;
  @Column({ default: 1 })
  peopleCount: number;
  @Column({
    type: 'enum',
    enum: ['served', 'quit', 'removed', 'expired', 'inActive', 'delete'],
    nullable: true,
  })
  leaveReason: (typeof QueueCustomerLeaveReasons)[number];
  @Column({ default: '' })
  comment: string;
  @Column({ default: false })
  notifyUsingSms: boolean;
  @Column({ nullable: false, default: false })
  confirmed: boolean;
  @Column({ default: false })
  complete: boolean;

  @ManyToOne(() => CustomerEntity, (ICustomer) => ICustomer.queueCustomers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customerId', referencedColumnName: 'id' })
  customer: CustomerEntity;
  @ManyToOne(() => QueueEntity, (IQueue) => IQueue.queueCustomers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'queueId', referencedColumnName: 'id' })
  queue: QueueEntity;
  @OneToMany(
    () => QueueCustomerTraits,
    (ICustomer) => ICustomer.queueCustomer,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  traits: QueueCustomerTraits[];
  @OneToMany(() => Cart, (cartItem) => cartItem.queueCustomer, {
    onDelete: 'CASCADE',
  })
  cart: Cart[];
  @OneToMany(
    () => QueueCustomerQueueArea,
    (IQueueCustomerQueueArea) => IQueueCustomerQueueArea.queueCustomer,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  areas: QueueCustomerQueueArea[];

  @Column({ nullable: true })
  customerId?: number | string;

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setcustomerId(): void {
    this.customerId = this.customer?.id;
  }
  @Column({ nullable: true })
  queueId?: number | string;

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setqueueId(): void {
    this.queueId = this.queue?.id;
  }
}
