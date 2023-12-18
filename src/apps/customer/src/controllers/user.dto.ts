import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  isEmail,
  isNotEmpty,
  MinLength,
  isPhoneNumber,
  isBoolean,
  isNumber,
  isArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type as ValidateType } from 'class-transformer';
import validateUtil from '../../../util/validation';
import { QueueGroupPossibleTypes } from '../../../types/queueGroup';
import { QueueCustomerTraitTypes } from '../../../types/queueCustomerTrait';
// tslint:disable-next-line:max-classes-per-file
export class BusinessDTO {
  @ApiProperty({ description: 'queueCustomerid is supposed to be a number', required: true, })
  @IsString()
  readonly id: number;
  @ApiProperty({ description: 'notifyUsingSms', required: true })
  readonly notifyUsingSms: boolean;
  @ApiProperty({
    description: 'The number of people the customer will chose for a table',
    required: true,
  })
  readonly peopleCount: number;
  @ApiProperty({ description: 'queue customer number', required: true })
  @IsString()
  readonly number: number;
  @ApiProperty({ description: 'customer comment' })
  @IsString()
  readonly comment: string;
  @ApiProperty({ description: 'customer complete status' })
  readonly complete: boolean;
  @ApiProperty({ description: 'Traits' })
  readonly traits?: {
    id?: number;
    type: (typeof QueueCustomerTraitTypes)[number];
  }[];

  @ApiProperty({ description: 'areas' })
  readonly areas?: {
    id?: number;
    queueCustomerId?: any;
    queueAreaId: number;
    queueArea?: { name: string };
  }[];
}
export class Customer {
  readonly id: string ;
  @ApiProperty({ description: 'BusinessName', required: true })
  @IsString()
  readonly name: string;
  @ApiProperty({ description: 'BusinessName', required: true })
  @IsString()
  readonly phone: string;
  @ValidateNested()
  @ValidateType(() => Customer)
  public queueCustomer?: BusinessDTO;
}
