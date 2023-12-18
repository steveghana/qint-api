import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  UsePipes,
  ValidationPipe,
  Param,
  ParseIntPipe,
  Patch,
  HttpException,
  Request,
  UseFilters,
  Next,
} from '@nestjs/common';
import validationUtil from '../../../util/validation';
import {} from '../services/Root/service/index.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { alpha2ToNumeric, isValid } from 'i18n-iso-countries';
import { OptionalAuthMiddleware } from '../../../middleware/optionallyAuthenticated.middleware';
import { AuthMiddleware } from '../../../middleware/authenticated.middleware';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BusinessPatchDTO } from './user.dto';
import { BusinessService } from '../services/Root/service/index.service';
import { QueueCustomerTraitTypes } from '../../../types/queueCustomerTrait';
import { IQueueArea } from '../../../types/queueArea';
import { IQueueGroupTable } from '../../../types/queueGroupTable';
import { Req, Res } from '@nestjs/common/decorators';
import { Response } from 'express';
import { HttpExceptionFilter } from '../../../middleware/err.Middleware';
import {
  IReservation,
  ReservationTraitType,
  ReservationTraitTypes,
} from '../../../../apps/types/reservation';
import { ReservationService } from '../services/reservation/service/reservation.service';

@Controller('queueGroup/:queueGroupId/reservation')
// @UsePipes(
//   new ValidationPipe({
//     whitelist: true,
//     transform: true,
//   }),
// )
export class ReservationController {
  constructor(private reservationInteractor: ReservationService) {}

  @ApiTags('Post reservation')
  @Post('/')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Post reservation',
  })
  // @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorised user',
        error: 'Unauthorized',
      },
    },
  })
  @ApiOkResponse({
    description: 'Ok',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'not allowed' })
  @ApiInternalServerErrorResponse({
    description: 'Server is down please try again later',
  })
  async postAReservation(
    @Req() req,
    @Next() next,
    @Res() res: Response,
  ): Promise<any> {
    const { queueGroupId } = req.params;
    const reservation: IReservation & {
      customer: {
        name: string;
        phone: string;
      };
      traits: ReservationTraitType[];
      areas: number[];
      tables: number[];
    } = req.body.reservation;

    if (
      !validationUtil.exists(queueGroupId) ||
      !validationUtil.isId(queueGroupId)
    ) {
      return new HttpException(
        'validation/queueGroupId',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!validationUtil.exists(reservation)) {
      return new HttpException(
        'validation/reservation',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!validationUtil.exists(reservation.customer)) {
      return new HttpException(
        'validation/reservation/customer',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      !validationUtil.exists(reservation.customer.name) ||
      !validationUtil.isString(reservation.customer.name)
    ) {
      return new HttpException(
        'validation/reservation/customer/name',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      !validationUtil.exists(reservation.customer.phone) ||
      !validationUtil.isPhone(reservation.customer.phone)
    ) {
      return new HttpException(
        'validation/reservation/customer/phone',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      !validationUtil.exists(reservation.date) ||
      !validationUtil.isDate(reservation.date)
    ) {
      return new HttpException(
        'validation/reservation/date',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      !validationUtil.exists(reservation.startTimeHour) ||
      !validationUtil.isNumber(reservation.startTimeHour) ||
      Number(reservation.startTimeHour) < 0 ||
      Number(reservation.startTimeHour) > 23 ||
      Number(reservation.startTimeHour) !==
        Math.floor(Number(reservation.startTimeHour))
    ) {
      return new HttpException(
        'validation/reservation/startTimeHour',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      !validationUtil.exists(reservation.startTimeMinute) ||
      !validationUtil.isNumber(reservation.startTimeMinute) ||
      Number(reservation.startTimeMinute) < 0 ||
      Number(reservation.startTimeMinute) > 59 ||
      Number(reservation.startTimeMinute) !==
        Math.floor(Number(reservation.startTimeMinute))
    ) {
      return new HttpException(
        'validation/reservation/startTimeMinute',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      !validationUtil.exists(reservation.endTimeHour) ||
      !validationUtil.isNumber(reservation.endTimeHour) ||
      Number(reservation.endTimeHour) < 0 ||
      Number(reservation.endTimeHour) > 23 ||
      Number(reservation.endTimeHour) !==
        Math.floor(Number(reservation.endTimeHour))
    ) {
      return new HttpException(
        'validation/reservation/endTimeHour',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      !validationUtil.exists(reservation.endTimeMinute) ||
      !validationUtil.isNumber(reservation.endTimeMinute) ||
      Number(reservation.endTimeMinute) < 0 ||
      Number(reservation.endTimeMinute) > 59 ||
      Number(reservation.endTimeMinute) !==
        Math.floor(Number(reservation.endTimeMinute))
    ) {
      return new HttpException(
        'validation/reservation/endTimeMinute',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      !validationUtil.exists(reservation.peopleCount) ||
      !validationUtil.isNumber(reservation.peopleCount) ||
      Number(reservation.peopleCount) < 1 ||
      Number(reservation.peopleCount) !==
        Math.floor(Number(reservation.peopleCount))
    ) {
      return new HttpException(
        'validation/reservation/peopleCount',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      !validationUtil.exists(reservation.areas) ||
      !validationUtil.isArray(reservation.areas) ||
      !validationUtil.each(reservation.areas, (v) => validationUtil.isId(v))
    ) {
      return new HttpException(
        'validation/reservation/areas',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      !validationUtil.exists(reservation.tables) ||
      !validationUtil.isArray(reservation.tables) ||
      !validationUtil.each(reservation.tables, (v) => validationUtil.isId(v))
    ) {
      return new HttpException(
        'validation/reservation/tables',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      !validationUtil.exists(reservation.comment) ||
      !validationUtil.isString(reservation.comment)
    ) {
      return new HttpException(
        'validation/reservation/comment',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      !validationUtil.exists(reservation.traits) ||
      !validationUtil.isArray(reservation.traits) ||
      !validationUtil.each(
        reservation.traits,
        (trait) =>
          validationUtil.isString(trait) &&
          ReservationTraitTypes.includes(trait),
      )
    ) {
      res.status(400).send('validation/reservation/traits');
      return;
    }

    const result = await this.reservationInteractor.createReservation(
      queueGroupId,
      reservation,
    );
    return res.status(200).json(result);
  }
  @ApiTags('Get business by email')
  @Get('/all')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get business by email',
  })
  // @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorised user',
        error: 'Unauthorized',
      },
    },
  })
  @ApiOkResponse({
    description: 'Ok',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'not allowed' })
  @ApiInternalServerErrorResponse({
    description: 'Server is down please try again later',
  })
  async getAllReservations(
    @Req() req,
    @Next() next,
    @Res() res: Response,
  ): Promise<any> {
    const { queueGroupId } = req.params;

    if (
      !validationUtil.exists(queueGroupId) ||
      !validationUtil.isId(queueGroupId)
    ) {
      throw new HttpException(
        'validation/queueGroupId',
        HttpStatus.BAD_REQUEST,
      );
    }
    // if (err) {
    //   return next(err);
    // }
    const result = await this.reservationInteractor.getQueueGroupReservations(
      queueGroupId,
      req.requestingUser.email,
    );

    return res.status(200).send(result);
  }
}
