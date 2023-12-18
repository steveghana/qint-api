import { QueueGroupPossibleTypes } from '../../../types/queueGroup';
import { Contains } from 'class-validator';
import {
  Column,
  Entity,
  Generated,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
  BaseEntity,
  OneToOne,
  AfterLoad,
  AfterInsert,
  AfterUpdate,
} from 'typeorm';
import { AuthtokenEntity } from '../../../auth/src/models/Token/authToken.entity';
import { BusinessEntity } from '../../../business/src/models/business.entity';
import { QueueCustomerEntity } from '../../../customer/src/models/QueueCustomer/queueCustomer.entity';
import AssociableModel from '../../../../apps/Config/associable';

@Entity({ name: 'queue' })
export class QueueEntity extends AssociableModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  QRId?: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  isCustomDisplay!: boolean;

  @Column({ type: 'integer', nullable: false, default: 1 })
  nextEnqueueNumber!: number;

  @Column({ type: 'date', nullable: true, default: null })
  resetNumberTime!: Date;

  @ManyToOne(() => QueueCustomerEntity, (ICustomer) => ICustomer.queue)
  @JoinColumn({ name: 'currentlyServedQueueCustomer', referencedColumnName: 'id' })
  currentlyServedQueueCustomer: QueueCustomerEntity;

  @ManyToOne(() => BusinessEntity, (iqueuegroup) => iqueuegroup.queues, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'queueGroupId', referencedColumnName: 'id' })
  queueGroup: BusinessEntity;

  @OneToMany(
    () => QueueCustomerEntity,
    (queueCustomer) => queueCustomer.queue,
    { onDelete: 'CASCADE' },
  )
  queueCustomers: QueueCustomerEntity[];

  @Column({ nullable: true })
  queueGroupId?: number | string;

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setQueueGroupId(): void {
    this.queueGroupId = this.queueGroup?.id;
  }
}
