import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  BaseEntity,
  Generated,
  JoinColumn,
  AfterLoad,
  AfterInsert,
  AfterUpdate,
} from 'typeorm';
import { QueueArea as QueueAreaEntity } from '../Area/queueArea.entity';
import { QueueGroupTable } from '../businessTables/queueGroupTable.entity';
import AssociableModel from '../../../../../apps/Config/associable';

@Entity('queueAreaQueueTable')
export class QueueAreaQueueTable extends AssociableModel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => QueueAreaEntity, (queueArea) => queueArea.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'queueAreaId', referencedColumnName: 'id' })
  queueArea: QueueAreaEntity;

  @ManyToOne(() => QueueGroupTable, (Itable) => Itable.areaQueueTables, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'queueGroupTableId', referencedColumnName: 'id' })
  queueGroupTable: QueueGroupTable;

  @Column({ nullable: true })
  queueAreaId?: number;

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setqueueAreaId(): void {
    this.queueAreaId = this.queueArea?.id;
  }
  @Column({ nullable: true })
  queueGroupTableId?: number;

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setqueueGroupTableId(): void {
    this.queueGroupTableId = this.queueGroupTable?.id;
  }
}
