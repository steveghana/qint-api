import {
  Entity,
  Column,
  PrimaryColumn,
  BaseEntity,
  PrimaryGeneratedColumn,
  AfterLoad,
  AfterInsert,
  ManyToOne,
  JoinColumn,
  AfterUpdate,
  OneToMany,
} from 'typeorm';
import AssociableModel from '../../../../Config/associable';
import { CustomerEntity } from '../../../../customer/src/models/customer.entity';
import { QueueCustomerEntity } from '../QueueCustomer/queueCustomer.entity';
import { CartItem } from './ProductQty.entity';
@Entity({ name: 'cart' })
export class Cart extends AssociableModel {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true })
  totalPrice: number;
  @Column({ nullable: true })
  qty: number;
  @Column({
    nullable: true,
    default: new Date(),
  })
  time: Date;
  @Column({ default: false })
  orderPlaced: boolean;
  @Column({ default: false })
  completed: boolean;
  @ManyToOne(() => QueueCustomerEntity, (customer) => customer.cart)
  @JoinColumn({ name: 'queueCustomerId', referencedColumnName: 'id' })
  queueCustomer: QueueCustomerEntity;
  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  cartItems: CartItem[];
  @Column({ nullable: true })
  queueCustomerId: number;

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setqueueCustomerId(): void {
    this.queueCustomerId = this.queueCustomer?.id;
  }
}
