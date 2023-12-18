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
import { ReservationQueueAreaEntity } from '../reservation/reservationQueueArea.entity';

@Entity('queueArea')
export class QueueArea extends AssociableModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, type: 'json' })
  name: { english: string; hebrew: string };

  @ManyToOne(() => BusinessEntity, (IBusiness) => IBusiness.areas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'queueGroupId', referencedColumnName: 'id' })
  queueGroup: BusinessEntity;

  @OneToMany(
    () => QueueCustomerQueueArea,
    (queueCustomerQueueArea) => queueCustomerQueueArea.queueArea,
    { onDelete: 'CASCADE' },
  )
  queueCustomerQueueAreas: QueueCustomerQueueArea[];

  @OneToMany(
    () => ReservationQueueAreaEntity,
    (reservationQueueArea) => reservationQueueArea.queueArea,
    { onDelete: 'CASCADE' },
  )
  reservationQueueAreas: ReservationQueueAreaEntity[];

  @OneToMany(
    () => QueueAreaTrait,
    (queueAreaTrait) => queueAreaTrait.queueArea,
    { onDelete: 'CASCADE' },
  )
  traits: QueueAreaTrait[];

  @OneToMany(
    () => QueueAreaQueueTable,
    (queueAreaQueueTable) => queueAreaQueueTable.queueArea,
    { onDelete: 'CASCADE' },
  )
  queueAreaQueueTable: QueueAreaQueueTable[];
  @Column({ nullable: true })
  queueGroupId?: number | string;

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setQueueGroupId(): void {
    this.queueGroupId = this.queueGroup?.id;
  }
}
