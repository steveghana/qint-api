import {
  Controller,
  Get,
  UseFilters,
  Res,
  Post,
  Req,
  Logger,
  Next,
} from '@nestjs/common';
import validationUtil from '../../../util/validation';
import xml2js from 'xml2js';

import {
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { HttpExceptionFilter } from '../../../middleware/err.Middleware';
import smsUtil from '../../../util/sms';
import { Response } from 'express';
import ipWhitelist from '../../../middleware/ipWhitelist';
@Controller(`/${process.env.SMS_WEBHOOK_ROUTE || 'sms'}`)
export class SmsController {
  // constructor() {}

  /* ===================== */

  @ApiTags('Get short url for qr code')
  @Post('/')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get sms',
  })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  // @UseInterceptors(CacheInterceptor)
  async getVapidPublicKey(@Next() next, @Res() res: Response, @Req() req) {
    ipWhitelist(
      process.env.NODE_ENV === 'production'
        ? [
            '192.114.70.82',
            '192.114.70.20',
            '192.114.70.21',
            '192.114.70.22',
            '192.114.70.23',
            '192.114.70.24',
            '192.114.70.25',
            '192.114.70.26',
            '192.114.70.27',
            '192.114.70.28',
            '192.114.70.29',
            '192.114.70.30',
            '192.114.70.31',
            '192.114.70.32',
            '192.114.70.33',
            '192.114.70.34',
            '192.114.70.35',
            '192.114.70.36',
            '192.114.70.37',
            '192.114.70.93',
            '192.114.70.112',
          ]
        : ['127.0.0.1', '::1'],
    )(req, null, async () => {
      const logger = new Logger();
      logger.log('api', 'Received SMS webhook', [
        {
          requestor: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          incomingXML: req.body.IncomingXML,
        },
      ]);
      res.status(200).send();
      const asJson = await xml2js.parseStringPromise(req.body.IncomingXML);
      const from = asJson.IncomingData.PhoneNumber[0];
      const message = asJson.IncomingData.Message[0];
      await smsUtil.receiveMessage(message, from, '');
    });
  }

  /* ===================== */

  /* ===================== */

  /* ===================== */
}
