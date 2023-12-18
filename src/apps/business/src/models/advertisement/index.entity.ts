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
import { Cart } from '../../../../customer/src/models/CartItems/CartItem.entity';
import { CartItem } from '../../../../customer/src/models/CartItems/ProductQty.entity';

@Entity('advertisement')
export class AdvertisementEntity extends AssociableModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  description: string;
  @Column({ default: '' })
  text: string;
  @Column({ default: '' })
  imageUrl: string;
  @Column({ default: 'interactive' })
  addType: string;
  @Column({ default: 'USD' })
  currency: string = 'USD';
  @Column({ nullable: true })
  price: string;
  @Column({ type: 'bytea' })
  base64Img: Buffer;
  @ManyToOne(() => CartItem, (cartItem) => cartItem.advertisement, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cartItemId', referencedColumnName: 'id' })
  cartItem: CartItem;
  @Column({ nullable: true })
  cartItemId?: number | string;

  @ManyToOne(() => BusinessEntity, (IBusiness) => IBusiness.advertisement, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'queueGroupId', referencedColumnName: 'id' })
  queueGroup: BusinessEntity;
  @Column({ nullable: true })
  queueGroupId?: number | string;
  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setqueueAreaId(): void {
    this.cartItemId = this.cartItem?.id;
  }

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  private setQueueGroupId(): void {
    this.queueGroupId = this.queueGroup?.id;
  }
}
