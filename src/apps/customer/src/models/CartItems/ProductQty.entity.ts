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
import { AdvertisementEntity } from '../../../../business/src/models/advertisement/index.entity';
import { CustomerEntity } from '../../../../customer/src/models/customer.entity';
import { QueueCustomerEntity } from '../QueueCustomer/queueCustomer.entity';
import { Cart } from './CartItem.entity';

@Entity({ name: 'cartItem' })
export class CartItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cart, (cart) => cart.cartItems)
  @JoinColumn({ name: 'cartId', referencedColumnName: 'id' })
  cart: Cart;

  @ManyToOne(() => AdvertisementEntity, (ad) => ad.cartItem)
  @JoinColumn({ name: 'advertisementId', referencedColumnName: 'id' })
  advertisement: AdvertisementEntity;

  @Column()
  quantity: number;
}
