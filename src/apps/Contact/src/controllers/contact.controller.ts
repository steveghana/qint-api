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
import emailUtil from '../../../util/email';
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

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/gu, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
    }
    return c;
  });
}
@Controller(`/contact'}`)
export class ContactController {
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
    const { name, phone, emailAddress, message } = req.body;

    if (!validationUtil.exists(name) || !validationUtil.isString(name)) {
      res.status(400).send('validation/name');
      return;
    }
    if (!validationUtil.exists(phone) || !validationUtil.isPhone(phone)) {
      res.status(400).send('validation/phone');
      return;
    }
    if (
      !validationUtil.exists(emailAddress) ||
      !validationUtil.isEmail(emailAddress)
    ) {
      res.status(400).send('validation/emailAddress');
      return;
    }
    if (validationUtil.exists(message) && !validationUtil.isString(message)) {
      res.status(400).send('validation/message');
      return;
    }

    await emailUtil.sendStyled({
      to: 'sitbonyohai@gmail.com',
      subject: `מישהו השאיר פרטים בעמוד הנחיתה של Q-int: ${escapeXml(name)}`,
      rtl: true,
      html: `<h1>
שלום רן.<br/>
מישהו השאיר פרטים הרגע ב<a href="https://www.q-int.com/#contact">עמוד הנחיתה של q-int</a>.
</h1>
<table>
    <tr>
        <th>שם</th>
        <th>טלפון</th>
        <th>כתובת דוא&quot;ל</th>
        <th>הודעה</th>
    </tr>
    <tr>
        <td>${escapeXml(name)}</td>
        <td>${escapeXml(phone)}</td>
        <td>${escapeXml(emailAddress)}</td>
        <td>${escapeXml(message)}</td>
    </tr>
</table>
<br/><br/>
בברכה,
מערכת q-int`,
    });

    res.status(200).send();
  }

  /* ===================== */

  /* ===================== */

  /* ===================== */
}
