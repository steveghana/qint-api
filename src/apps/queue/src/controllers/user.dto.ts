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
  readonly geometryLat: string;
  @ApiProperty({ description: '' })
  @IsString()
  readonly geometryLong: string;
  @ApiProperty({ description: '' })
  @IsString()
  readonly centerLat: string;
  @ApiProperty({ description: '' })
  @IsString()
  readonly centerLong: string;
  @ApiProperty({ description: 'BusinessType', required: true })
  @IsString()
  readonly type: [keyof typeof QueueGroupPossibleTypes];
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
