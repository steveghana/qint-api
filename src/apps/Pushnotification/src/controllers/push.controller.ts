import { Controller, Get, UseFilters, Res, Next } from '@nestjs/common';
import validationUtil from '../../../util/validation';

import {
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { HttpExceptionFilter } from '../../../middleware/err.Middleware';
import pushUtil from '../../../util/push';
import { Response } from 'express';
@Controller('notification')
export class PushController {
  // constructor() {}

  /* ===================== */

  @ApiTags('Get short url for qr code')
  @Get('/parameters')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get vapid key',
  })
  @ApiUnauthorizedResponse({
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorised user',
        error: 'Unauthorized',
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  // @UseInterceptors(CacheInterceptor)
  async getVapidPublicKey(@Next() next, @Res() res: Response) {
    return res.status(200).send({
      vapidPublicKey: pushUtil.getVapidPublicKey(),
    });
  }

  /* ===================== */

  /* ===================== */

  /* ===================== */
}
