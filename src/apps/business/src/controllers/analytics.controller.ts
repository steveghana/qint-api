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
// import {} from '../services/Root/service/index.service';
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
import { AnalyticsService } from '../services/analytics/service/analytics.service';

@Controller('queueGroup/:queueGroupId/analytic')
// @UsePipes(
//   new ValidationPipe({
//     whitelist: true,
//     transform: true,
//   }),
// )
export class AnalyticsController {
  constructor(private analyticInteractor: AnalyticsService) {}

  @ApiTags('Get analytics')
  @Get('/')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get analytics',
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
  async getAnalytics(
    @Req() req,
    @Next() next,
    @Res() res: Response,
  ): Promise<any> {
    const { queueGroupId } = req.params;
    const { timezoneOffset } = req.query;
    if (
      !validationUtil.exists(req.params.queueGroupId) ||
      !validationUtil.isId(req.params.queueGroupId)
    ) {
      throw new HttpException(
        'validation/queueGroupId',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      !validationUtil.exists(timezoneOffset) ||
      !validationUtil.isNumber(Number(timezoneOffset))
    ) {
      throw new HttpException(
        'validation/timezoneOffset',
        HttpStatus.BAD_REQUEST,
      );
    }

    // if (err) {
    //   return next(err);
    // }
    const result = await this.analyticInteractor.getAnalytic(
      queueGroupId,
      req.requestingUser.email,
      Number(timezoneOffset),
    );
    return res.status(200).json(result);
  }
  @ApiTags('Get analytics')
  @Get('/shift')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get analytics',
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
  async getShift(@Req() req, @Next() next, @Res() res: Response): Promise<any> {
    const { queueGroupId } = req.params;
    const { timezoneOffset } = req.query;
    if (
      !validationUtil.exists(req.params.queueGroupId) ||
      !validationUtil.isId(req.params.queueGroupId)
    ) {
      throw new HttpException(
        'validation/queueGroupId',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.analyticInteractor.getShiftAnalytic(
      req.requestingUser.email,
    );
    return res.status(200).json(result);
  }
}
