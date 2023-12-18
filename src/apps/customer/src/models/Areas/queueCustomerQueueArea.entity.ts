import {
  Column,
  Entity,
  Generated,
  ManyToOne,
  BaseEntity,
  ManyToMany,
  JoinColumn,
  JoinTable,
  PrimaryGeneratedColumn,
  AfterLoad,
  AfterInsert,
  AfterUpdate,
} from 'typeorm';
import { QueueCustomerEntity } from '../QueueCustomer/queueCustomer.entity';
import { QueueArea } from '../../../../business/src/models/Area/queueArea.entity';
import AssociableModel from '../../../../../apps/Config/associable';

export type IQueueCustomerQueueArea = {
  id: number;
  queueCustomerId?: string;
  queueAreaId?: number;
};

// class queueCustomerQueueArea
//     extends AssociableModel<IQueueCustomerQueueArea, Optional<IQueueCustomerQueueArea, 'id'>>
//     implements IQueueCustomerQueueArea
// {
//     public id!: number;
// }
@Entity('queueCustomerQueueArea')
export class QueueCustomerQueueArea extends AssociableModel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => QueueCustomerEntity, (ICustomer) => ICustomer.areas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'queueCustomerId', referencedColumnName: 'id' })
  queueCustomer: QueueCustomerEntity;
  @ManyToOne(() => QueueArea, (IQueueArea) => IQueueArea.queueCustomerQueueAreas, {
    onDelete: 'CASCADE',
    eager:true
  })
  @JoinColumn({ name: 'queueAreaId', referencedColumnName: 'id' })
  
  queueArea: QueueArea;
  

  @Column({ nullable: true })
  queueCustomerId?: number | string;


  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setqueueCustomerId(): void {
    this.queueCustomerId = this.queueCustomer?.id;
  }
  @Column({ nullable: true })
  queueAreaId?: number | string;


  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setqueueAreaId(): void {
    this.queueAreaId = this.queueArea?.id;
  }
}
