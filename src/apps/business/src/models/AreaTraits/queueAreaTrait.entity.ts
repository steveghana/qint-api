import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QueueArea as QueueAreaEntity } from '../Area/queueArea.entity';
import { QueueAreaTraitTypes } from '../../../../types/queueAreaTrait';
import AssociableModel from '../../../../../apps/Config/associable';

@Entity({ name: 'queueAreaTrait' })
export class QueueAreaTrait extends AssociableModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: QueueAreaTraitTypes, nullable: false })
  type!: (typeof QueueAreaTraitTypes)[number];

  @ManyToOne(() => QueueAreaEntity, (queueArea) => queueArea.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'queueAreaId', referencedColumnName: 'id' })
  queueArea: QueueAreaEntity;
  @Column({ nullable: true })
  queueAreaId?: number ;


  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setqueueAreaId(): void {
    this.queueAreaId = this.queueArea?.id;
  }
}
