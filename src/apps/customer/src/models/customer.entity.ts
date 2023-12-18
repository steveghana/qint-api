import { ICustomer } from '../../../types/customer';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  BaseEntity,
  PrimaryColumn,
} from 'typeorm';
import { QueueCustomerEntity } from './QueueCustomer/queueCustomer.entity';
import uuid from '../../../../apps/util/uuid';
import AssociableModel from '../../../../apps/Config/associable';
import { FeedbackEntity } from '../../../../apps/business/src/models/feedback/index.entity';
import { ReservationEntity } from '../../../../apps/business/src/models/reservation/index.entity';
import { ReservationTraitEntity } from '../../../../apps/business/src/models/reservation/reservationTrait.entity';
import { Cart } from '@/apps/customer/src/models/CartItems/CartItem.entity';

@Entity('customer')
export class CustomerEntity extends AssociableModel {
  @PrimaryColumn('uuid')
  id: string = uuid.makeUuid();

  @Column({ nullable: true })
  name!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  agent!: string;

  @Column({ nullable: true })
  ipAddress!: string;

  @Column({ nullable: true })
  vapidEndpoint!: string;

  @Column({ nullable: true })
  vapidEndpointIv!: string;

  @Column({ nullable: true })
  vapidP256dh!: string;

  @Column({ nullable: true })
  vapidP256dhIv!: string;

  @Column({ nullable: true })
  vapidAuth!: string;

  @Column({ nullable: true })
  vapidAuthIv!: string;

  @OneToMany(
    () => QueueCustomerEntity,
    (queueCustomer) => queueCustomer.customer,
  )
  queueCustomers!: QueueCustomerEntity[];
  @OneToMany(() => FeedbackEntity, (queueCustomer) => queueCustomer.customer)
  feedback!: FeedbackEntity[];
  @OneToMany(() => ReservationEntity, (Itable) => Itable.customer, {
    onDelete: 'CASCADE',
  })
  public reservation: ReservationEntity[];

  // @OneToMany(
  //   () => ReservationTraitEntity,
  //   (reservationQueueArea) => reservationQueueArea.customer,
  //   { onDelete: 'CASCADE' },
  // )
  // reservationTrait: ReservationTraitEntity[];

  // @OneToMany(() => Customer, (reservation) => reservation)
  // reservations!: Reservation[];
}
