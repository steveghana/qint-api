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
  @ApiProperty({ description: 'queueGroupId', required: true })
  @IsString()
  queueGroupId: string;
}
export class RequestintUser {
  @ApiProperty({ description: 'email', required: true })
  @IsString()
  email: string;
}

// tslint:disable-next-line:max-classes-per-file

// tslint:disable-next-line:max-classes-per-file
export class BusinessDTO {
  @ApiProperty({ description: 'BusinessName', required: true })
  @IsString()
  readonly name: string;
  @ApiProperty({ description: 'logoUrl', required: true })
  @IsString()
  logoUrl: string;
  @ApiProperty({ description: 'country' })
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
  @ApiProperty({ description: 'BusinessType' })
  @IsString()
  readonly type: [keyof typeof QueueGroupPossibleTypes];
}

export class LoginUser {
  @ApiProperty({ description: 'email', required: true })
  @IsString()
  readonly email: string;
  @ApiProperty({ description: 'rememberMe' })
  readonly rememberMe: boolean;
  @ApiProperty({ description: 'password', required: true })
  @IsString()
  @MinLength(8)
  readonly password: string;
}
export class BusinessPatchDTO {
  @ValidateNested()
  @ValidateType(() => BusinessDTO)
  public body?: BusinessDTO;
  @ValidateNested()
  @ValidateType(() => User)
  public params?: User;
  @ValidateNested()
  @ValidateType(() => RequestintUser)
  public requestingUser?: RequestintUser;
}
