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
  AfterUpdate,
  AfterInsert,
} from 'typeorm';
import BusinessEntity from '../business.entity';
import { QueueCustomerQueueArea } from '../../../../customer/src/models/Areas/queueCustomerQueueArea.entity';
import { QueueAreaTrait } from '../AreaTraits/queueAreaTrait.entity';
import { QueueAreaQueueTable } from '../AreaQueTables/queueAreaQueueTable.entity';
import { QueueGroupTable } from '../businessTables/queueGroupTable.entity';
import AssociableModel from '../../../../../apps/Config/associable';
import { CustomerEntity } from '../../../../../apps/customer/src/models/customer.entity';

@Entity('feedback')
export class FeedbackEntity extends AssociableModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  businessId: number;
  @Column()
  rating: number;
  @Column()
  text: string;

  @ManyToOne(() => CustomerEntity, (IBusiness) => IBusiness.feedback, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customerId', referencedColumnName: 'id' })
  customer: CustomerEntity;
  @Column({ nullable: true })
  customerId?: number | string;

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setcustomerId(): void {
    this.customerId = this.customer?.id;
  }
}
