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
import { ReservationEntity } from './index.entity';
  @Entity('reservationTrait')
  export class ReservationTraitEntity extends AssociableModel {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
   type: ReservationTraitType;
  
    @ManyToOne(() => ReservationEntity, (IreservationTrait) => IreservationTrait.reservationTrait, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'reservationId', referencedColumnName: 'id' })
    reservation: ReservationEntity;
    @Column({ nullable: true })
    reservationId?: number;
  
  
    @AfterLoad()
    @AfterInsert()
    @AfterUpdate()
    private setreservationId(): void {
      this.reservationId = this.reservation?.id;
    }
  }
  