import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  BaseEntity,
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import BusinessEntity from '../business.entity';
import { QueueAreaQueueTable } from '../AreaQueTables/queueAreaQueueTable.entity';
import AssociableModel from '../../../../../apps/Config/associable';

@Entity('businessTable')
export class QueueGroupTable extends AssociableModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  capacity: number;

  @Column({ type: 'integer', default: 1 })
  minCapacity: number;

  @ManyToOne(() => BusinessEntity, (queueGroup) => queueGroup.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'queueGroupId', referencedColumnName: 'id' })

  queueGroup: BusinessEntity;

  @OneToMany(
    () => QueueAreaQueueTable,
    (areaQueueTable) => areaQueueTable.queueGroupTable,
    { onDelete: 'CASCADE' },
  )
  areaQueueTables: QueueAreaQueueTable[];
  @Column({ nullable: true })
  queueGroupId?: number | string;


  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setQueueGroupId(): void {
    this.queueGroupId = this.queueGroup?.id;
  }
}
