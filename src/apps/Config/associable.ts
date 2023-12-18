import { BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export default class AssociableModel extends BaseEntity {
  @CreateDateColumn()
  public readonly createdAt!: Date;

  @UpdateDateColumn()
  public readonly updatedAt!: Date;

  public static associate: (models: any) => void;
}
