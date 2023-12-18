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
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type as ValidateType } from 'class-transformer';
import validateUtil from '../../../util/validation';
import { QueueGroupPossibleTypes } from '@/apps/types/queueGroup';
import { IQueueGroupType } from '@/apps/types/queueGroup';
// tslint:disable-next-line:max-classes-per-file
export class BusinessDTO {
  @ApiProperty({ description: 'BusinessName', required: true })
  @IsString()
  readonly name: string;
  @ApiProperty({ description: 'country', required: true })
  @IsString()
  readonly country: string;
  @ApiProperty({ description: '', required: true })
  @IsString()
  readonly phone: string;
  @ApiProperty({ description: '', required: true })
  @IsString()
  readonly address: string;
  @ApiProperty({ description: '' })
  @IsString()
  readonly geometryLat: number;
  @ApiProperty({ description: '' })
  @IsString()
  readonly geometryLong: number;
  @ApiProperty({ description: '' })
  @IsString()
  readonly centerLat: number;
  @ApiProperty({ description: '' })
  @IsString()
  readonly centerLong: number;
  @ApiProperty({ description: 'BusinessType', required: true })
  @IsString()
  readonly type: IQueueGroupType;
}
export class User {
  @ApiProperty({ description: 'email', required: true })
  @IsString()
  // @isEmail({})
  email: string;

  // @isNotEmpty()
  @ApiProperty({ description: 'password', required: true })
  @IsString()
  @MinLength(8)
  readonly password: string;
  @ApiProperty({ description: '', required: true })
  @IsString()
  readonly fullName: string;

  readonly country: string;
  @ApiProperty({ description: '', required: true })
  @IsString()
  readonly state: number;
}

// tslint:disable-next-line:max-classes-per-file
export class RegisterDTO {
  @ValidateNested()
  @ValidateType(() => User)
  public user?: User;

  @ValidateNested()
  @ValidateType(() => User)
  public queueGroup?: BusinessDTO;
}

export class LoginUser {
  @ApiProperty({ description: 'email', required: true })
  @IsString()
  readonly email: string;
  @ApiProperty({ description: 'remember me' })
  readonly rememberMe: boolean;
  @ApiProperty({ description: 'password', required: true })
  @IsString()
  @MinLength(8)
  readonly password: string;
}
