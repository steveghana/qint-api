import {
  IQueueCustomerTrait,
  QueueCustomerTraitTypes,
} from '../../../../types/queueCustomerTrait';
import {
  Column,
  Entity,
  Generated,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  BaseEntity,
  PrimaryColumn,
  JoinColumn,
  AfterLoad,
  AfterInsert,
  AfterUpdate,
} from 'typeorm';
import { Contains } from 'class-validator';
import { QueueCustomerEntity } from '../QueueCustomer/queueCustomer.entity';
import AssociableModel from '../../../../../apps/Config/associable';

type QueueGroupType = (typeof QueueCustomerTraitTypes)[number];
let typeOptions: QueueGroupType;

@Entity('queueCustomerTrait')
export class QueueCustomerTraits extends AssociableModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: QueueCustomerTraitTypes,
  })
  type: (typeof QueueCustomerTraitTypes)[number];

  @ManyToOne(() => QueueCustomerEntity, (ICustomer) => ICustomer.traits)
  @JoinColumn({ name: 'queueCustomerId', referencedColumnName: 'id' })
  queueCustomer: QueueCustomerEntity;

  @Column({ nullable: true })
  queueCustomerId?: number | string;

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setqueueCustomerId(): void {
    this.queueCustomerId = this.queueCustomer?.id;
  }
}
