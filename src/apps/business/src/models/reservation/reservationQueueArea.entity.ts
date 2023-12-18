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
  import { ReservationTraitTypes, ReservationTraitType } from '../../../../types/reservation'; 
import { QueueArea } from '../Area/queueArea.entity';
import { ReservationEntity } from './index.entity';
  @Entity('reservationQueueArea')
  export class ReservationQueueAreaEntity extends AssociableModel {
    @PrimaryGeneratedColumn()
    id: number;
    @ManyToOne(() => ReservationEntity, (Ireservation) => Ireservation.reservationQueueAreas, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'reservationId', referencedColumnName: 'id' })
    reservation: ReservationEntity;
    @ManyToOne(() => QueueArea, (IqueueArea) => IqueueArea.reservationQueueAreas, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'queueAreaId', referencedColumnName: 'id' })
    queueArea: QueueArea;
  
    @Column({ nullable: true })
    queueAreaId?: number;
  
  
    @AfterLoad()
    @AfterInsert()
    @AfterUpdate()
    private setqueueAreaId(): void {
      this.queueAreaId = this.queueArea?.id;
    }
    @Column({ nullable: true })
    reservationId?: number;
  
  
    @AfterLoad()
    @AfterInsert()
    @AfterUpdate()
    private setreservationId(): void {
      this.reservationId = this.reservation?.id;
    }
  }
  