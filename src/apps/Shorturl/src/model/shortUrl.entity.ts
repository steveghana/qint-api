import { Entity, Column, PrimaryColumn, BaseEntity } from 'typeorm';
import AssociableModel from '../../../../apps/Config/associable';

@Entity({ name: 'shorturl' })
export class ShortUrlEntity extends AssociableModel {
  @Column({ unique: true, primary: true })
  shortComponent!: string;

  @Column()
  longComponent!: string;

  @Column({ nullable: true })
  expirationDate?: Date;
}
