import {
  BadRequestException,
  Body,
  Res,
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
  UseGuards,
  Request,
  Delete,
  UseFilters,
  Put,
  Req,
  Next,
} from '@nestjs/common';
import validationUtil from '../../../util/validation';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { alpha2ToNumeric, isValid } from 'i18n-iso-countries';
import { OptionalAuthMiddleware } from '../../../middleware/optionallyAuthenticated.middleware';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthMiddleware } from '../../../middleware/authenticated.middleware';
import { Response } from 'express';
import { QueueCustomerService } from '../services/QueueCustomer/service/index.service';
import { QueueCustomerTraitTypes } from '../../../types/queueCustomerTrait';

import { QueueCustomerLeaveReasons } from '../../../types/queueCustomer';
import { HttpExceptionFilter } from '../../../middleware/err.Middleware';
import { I18n, I18nContext } from 'nestjs-i18n';
const getCleanedQueueCustomer = (
  data: any,
): {
  id: number;
  notifyUsingSms: boolean;
  peopleCount: number;
  number: number;
  comment: string;
  traits: { type: (typeof QueueCustomerTraitTypes)[number] }[];
  areas: { queueAreaId: number }[];
  complete: boolean;
} => {
  if (!data.queueCustomer) {
    return null;
  }
  const { notifyUsingSms, peopleCount, number, comment, id, complete } =
    data.queueCustomer;
  const traits =
    data.queueCustomer.traits &&
    data.queueCustomer.traits.map((trait: any) => ({ type: trait.type }));
  const areas =
    data.queueCustomer.areas &&
    data.queueCustomer.areas.map((area: any) => ({
      queueAreaId: area.queueAreaId,
    }));
  return {
    id,
    notifyUsingSms,
    peopleCount,
    number,
    comment,
    traits,
    areas,
    complete,
  };
};
@Controller('/queueGroup/:queueGroupId/queue/:queueId/customer')
// @UsePipes(
//   new ValidationPipe({
//     whitelist: true,
//     transform: true,
//   }),
// )
export class CustomerController {
  constructor(private readonly queueCustomerInteractor: QueueCustomerService) {}

  /* ===================== */

  @ApiTags('customer post')
  @Post('/')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Create customer with details',
  })
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    schema: {
      example: {
        statusCode: 401,
        message: 'customer creation failed',
        error: 'Unauthorized',
      },
    },
  })
  @ApiOkResponse({
    description: 'customer created successfully',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  async createCustomer(
    @Param() param,
    @Body() body,
    @Req() req,
    @Next() next,
    @Res() res: Response,
    @I18n() i18n: I18nContext,
  ) {
    const { phone, id, name } = body;
    const queueCustomer = getCleanedQueueCustomer(body);

    if (
      validationUtil.exists(phone) &&
      phone !== '' &&
      !validationUtil.isPhone(phone)
    ) {
      throw new HttpException('validation/phone', HttpStatus.BAD_REQUEST);
    }
    if (
      !validationUtil.exists(param.queueGroupId) ||
      !validationUtil.isId(param.queueGroupId)
    ) {
      return new HttpException(
        'validation/queueGroupId',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      !validationUtil.exists(param.queueId) ||
      !validationUtil.isId(param.queueId)
    ) {
      throw new HttpException('validation/queueId', HttpStatus.BAD_REQUEST);
    }
    if (
      validationUtil.exists(queueCustomer?.traits) &&
      (!validationUtil.isArray(queueCustomer.traits) ||
        !validationUtil.each(
          queueCustomer.traits,
          (trait) =>
            validationUtil.isString(trait.type) &&
            QueueCustomerTraitTypes.includes(trait.type),
        ))
    ) {
      new HttpException('invalid traits types', HttpStatus.BAD_REQUEST);
      return;
    }
    if (
      validationUtil.exists(queueCustomer?.areas) &&
      (!validationUtil.isArray(queueCustomer.areas) ||
        !validationUtil.each<any>(queueCustomer.areas, (area) =>
          validationUtil.isId(area.queueAreaId),
        ))
    ) {
      new HttpException('invalid area types', HttpStatus.BAD_REQUEST);
      return;
    }
    const result = await this.queueCustomerInteractor.enqueue(
      i18n,
      param.queueId,
      {
        id: id,
        name: name,
        phone: phone,
        agent: req.headers['user-agent'],
        ipAddress:
          req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      },
      queueCustomer,
    );
    if (result['type'] === 'enqueued') {
      return res.status(200).json(result);
    } else if (result['type'] === 'already queued') {
      return res.status(202).json(result);
    } else {
      return res.json(result);
    }
  }

  /* ================== */

  @ApiTags('Restore the queucustomer')
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
  @ApiBadRequestResponse({
    description: "doesn't exist",
    schema: { example: { status: 404 } },
  })
  @ApiInternalServerErrorResponse({
    description: 'Server is down please try again later',
  })
  @Post('/restore')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get all business',
  })
  async restoreCustomer(
    @Request() req,
    @Body() body: any,
    @Next() next,
    @Res() res: Response,
    @I18n() i18n: I18nContext,

    @Param('queueGroupId') queueGroupId: string,
    @Param('queueId') queueId: string,
  ) {
    const { customerId, queueCustomerId } = body;
    if (
      !validationUtil.exists(queueGroupId) ||
      !validationUtil.isId(queueGroupId)
    ) {
      new HttpException(
        'queuegroup id was not provided, make sure to include that',
        HttpStatus.BAD_REQUEST,
      );
      return;
    }

    if (!validationUtil.exists(queueId) || !validationUtil.isId(queueId)) {
      new HttpException(
        'queueid  was not provided, make sure to include that',
        HttpStatus.BAD_REQUEST,
      );
      return;
    }
    // Use optionallyAuthenticatedMiddleware() to add optional authentication
    // Inside this callback, the middleware has either passed through or finished successfully

    const result = await this.queueCustomerInteractor.restoreCustomer(
      i18n,
      queueGroupId,
      queueId,
      queueCustomerId,
      customerId,
      req.requestingUser?.email, // Use req.user.email if using AuthGuard and authentication is required
    );
    return res.status(200).json(result);
  }

  /* ================== */
  /* ================== */

  @ApiTags('Restore the queucustomer')
  @Get('/removedQueueCustomers')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get all business',
  })
  async removedQueueCustomers(
    @Request() req,
    @Body() body: any,
    @Next() next,
    @Res() res: Response,
    @Param('queueGroupId') queueGroupId: string,
    @Param('queueId') queueId: string,
  ) {
    if (
      !validationUtil.exists(queueGroupId) ||
      !validationUtil.isId(queueGroupId)
    ) {
      throw new HttpException(
        'queuegroup id was not provided, make sure to include that',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!validationUtil.exists(queueId) || !validationUtil.isId(queueId)) {
      throw new HttpException(
        'queueid  was not provided, make sure to include that',
        HttpStatus.BAD_REQUEST,
      );
    }
    // Use optionallyAuthenticatedMiddleware() to add optional authentication
    // if (err) {
    //   return next(err);
    // }
    // Inside this callback, the middleware has either passed through or finished successfully

    const result = await this.queueCustomerInteractor.getQueueCustomersRemoved(
      queueId,
      queueGroupId,
      req.requestingUser.email,
    );
    return res.status(200).json(result);
  }
  /* ================== */

  @ApiTags('update the queucustomer by their respective id')
  @UseFilters(new HttpExceptionFilter())
  @Patch('/:customerId')
  @ApiOperation({
    description: 'Update customer by id',
  })
  async updateByCustomerId(
    @Request() req,
    @Body() body,
    @Next() next,
    @Res() res: Response,
    @Param('queueGroupId') queueGroupId: string,
    @Param('queueId') queueId: string,
    @Param('customerId') customerId: string,
  ) {
    console.log('customer update route enterd');
    const { phone } = req.body;
    if (
      validationUtil.exists(phone) &&
      phone !== '' &&
      !validationUtil.isPhone(phone)
    ) {
      throw new HttpException(
        'customers phone  was not provided, make sure to include that',
        HttpStatus.BAD_REQUEST,
      );
      return;
    }
    if (!validationUtil.exists(queueId) || !validationUtil.isId(queueId)) {
    }
    // Use optionallyAuthenticatedMiddleware() to add optional authentication

    const result = await this.queueCustomerInteractor.editCustomer(
      queueId,
      queueGroupId,
      customerId,
      { name: body.name, phone },
      body.queueCustomer,
    );
    return res.status(200).json(result);
  }

  /* ================== */
  /* ================== */

  @ApiTags('Restore the queucustomer')
  @Patch('/:queueCustomerId/number')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get all business',
  })
  async updateByCustomerIdWithNumber(
    @Request() req,
    @Body() body: any,
    @Next() next,
    @I18n() i18n: I18nContext,

    @Res() res: Response,
    @Param('queueGroupId') queueGroupId: string,
    @Param('queueId') queueId: string,
    @Param('queueCustomerId') queueCustomerId: string,
  ) {
    const { offset } = body;

    if (
      !validationUtil.exists(offset) ||
      !validationUtil.isNumber(offset) ||
      offset <= 0
    ) {
      throw new HttpException(
        'offset  was not provided, or is not a number, make sure to include that',
        HttpStatus.BAD_REQUEST,
      );
    }
    console.log('enter route delayCustomerNumber');

    const result = await this.queueCustomerInteractor.delayCustomerNumber(
      i18n,
      queueId,
      queueGroupId,
      queueCustomerId,
      offset,
    );
    return res.status(200).json(result);
  }

  /* ================== */
  /* ================== */

  @ApiTags('Calling the customer')
  @Post('/:queueCustomerId/call-now')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'CAll customer',
  })
  async updateByCustomerIdWithCallNow(
    @Request() req,
    @Body() body: any,
    @Next() next,
    @I18n() i18n: I18nContext,

    @Res() res: Response,
    @Param() param,
  ) {
    const { queueGroupId, queueId, queueCustomerId } = param;

    if (
      !validationUtil.exists(queueGroupId) ||
      !validationUtil.isId(queueGroupId)
    ) {
      res.status(400).send('validation/queueGroupId');
      return;
    }
    if (!validationUtil.exists(queueId) || !validationUtil.isId(queueId)) {
      res.status(400).send('validation/queueId');
      return;
    }
    if (
      !validationUtil.exists(queueCustomerId) ||
      !validationUtil.isId(queueCustomerId)
    ) {
      res.status(400).send('validation/queueCustomerId');
      return;
    }

    // if (err) {
    //   return next(err);
    // }
    const result = await this.queueCustomerInteractor.callCustomer(
      i18n,
      param.queueGroupId,
      param.queueId,
      param.queueCustomerId,
      req.requestingUser.email,
    );
    return res.status(200).json(result);
  }

  /* ================== */

  @ApiTags('Soft Deleting the customer')
  @Delete('/:queueCustomerId')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Deleting customer',
  })
  async deleteByCustomerId(
    @Request() req,
    @Body() body: any,
    @Next() next,
    @I18n() i18n: I18nContext,

    @Res() res: Response,
    @Param('queueGroupId') queueGroupId: string,
    @Param('queueId') queueId: string,
    @Param('queueCustomerId') queueCustomerId: string,
  ) {
    const { customerId, reason } = req.body;
    if (
      !validationUtil.exists(customerId) ||
      !validationUtil.isUuid(customerId)
    ) {
      throw new HttpException(
        'customer id  was not provided, make sure to include that',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      !validationUtil.exists(reason) ||
      !validationUtil.isString(reason) ||
      !QueueCustomerLeaveReasons.includes(reason)
    ) {
      throw new HttpException(
        'A valid reason for deleting the customer was not provided, make sure to include that',
        HttpStatus.BAD_REQUEST,
      );
    }
    const result = await this.queueCustomerInteractor.removeCustomer(
      i18n,
      queueId,
      queueGroupId,
      queueCustomerId,
      customerId,
      reason,
      req.requestingUser && req.requestingUser.email,
    );
    return res.json(result);
  }

  /* ================== */
  /* ================== */

  @ApiTags('Soft Deleting all the customers from the queue')
  @Delete('/all/silent')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description:
      'This operation is done with the Empty queue in the Business sections ',
  })
  async silentlyDeleteOrEmptyAllCustomers(
    @Request() req,
    @Body() body: any,
    @Next() next,
    @Res() res: Response,
    @Param('queueGroupId') queueGroupId: string,
    @Param('queueId') queueId: string,
  ) {
    // if (err) {
    //   return next(err);
    // }
    const result = await this.queueCustomerInteractor.silentlyRemoveCustomers(
      queueId,
      queueGroupId,
      req.requestingUser.email,
    );
    return res.status(200).json(result);
  }

  /* ================== */
  /* ================== */

  @ApiTags('Notify this customer using sms')
  @Post('/:queueCustomerId/notify-using-sms')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'This operation notifies customer with sms',
  })
  async notifyCustomerUsingSms(
    @Request() req,
    @Body() body: any,
    @Next() next,
    @Res() res: Response,
    @Param('queueGroupId') queueGroupId: string,
    @Param('queueId') queueId: string,
    @Param('queueCustomerId') queueCustomerId: string,
  ) {
    const { customerId } = req.body;
    if (
      !validationUtil.exists(customerId) ||
      !validationUtil.isUuid(customerId)
    ) {
      throw new HttpException(
        'customer id was not provided or included in the request body, make sure to include that',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.queueCustomerInteractor.notifyCustomerUsingSms(
      queueGroupId,
      queueId,
      queueCustomerId,
      customerId,
    );
    return res.status(200).json(result);
  }

  /* ================== */
  /* ================== */

  @ApiTags('notify Customer Using Push Notification')
  @Post('/:queueCustomerId/notify-using-push-notification')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'notify Customer Using Push Notification',
  })
  async notifyCustomerUsingPushNotification(
    @Request() req,
    @Body() body: any,
    @Next() next,
    @Res() res: Response,
    @Param('queueGroupId') queueGroupId: string,
    @Param('queueId') queueId: string,
    @Param('queueCustomerId') queueCustomerId: string,
  ) {
    const { endpoint, keys, customerId } = req.body;
    const { p256dh: p256dhKey, auth: authKey } = keys || {};
    if (!validationUtil.exists(endpoint) || !validationUtil.isUrl(endpoint)) {
      throw new HttpException('include the endpoint', HttpStatus.BAD_REQUEST);
    }
    if (!validationUtil.exists(keys)) {
      throw new HttpException('include the keys', HttpStatus.BAD_REQUEST);
    }
    if (
      validationUtil.exists(p256dhKey) &&
      !validationUtil.isString(p256dhKey)
    ) {
      throw new HttpException(
        'include the keys.p256dhKey',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (validationUtil.exists(authKey) && !validationUtil.isString(authKey)) {
      throw new HttpException('include the keys.auth', HttpStatus.BAD_REQUEST);
    }

    const result =
      await this.queueCustomerInteractor.notifyCustomerUsingPushNotification(
        queueGroupId,
        queueId,
        queueCustomerId,
        customerId,
        {
          endpoint,
          p256dhKey,
          authKey,
        },
      );
    return res.status(200).json(result);
  }

  /* ================== */
  /* ================== */

  @ApiTags('notify Customer Using Push Notification')
  @Put('/:queueCustomerId/confirmed')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'notify Customer Using Push Notification',
  })
  async confirmCustomerSubscribedToComing(
    @Request() req,
    @Body() body: any,
    @Next() next,
    @Res() res: Response,
    @Param('queueGroupId') queueGroupId: string,
    @Param('queueId') queueId: string,
    @Param('queueCustomerId') queueCustomerId: string,
  ) {
    const { customerId } = req.body;

    if (
      !validationUtil.exists(customerId) ||
      !validationUtil.isUuid(customerId)
    ) {
      throw new HttpException('include the customerid', HttpStatus.BAD_REQUEST);
    }
    const result = await this.queueCustomerInteractor.confirmCustomerComing(
      queueGroupId,
      queueCustomerId,
      customerId,
      queueId,
    );
    return res.status(200).json(result);
  }

  /* ================== */

  @ApiTags('Add Cartitems')
  @Post('/:queueCustomerId/cartItems')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description:
      'Add items to the shopping cart with their respective customer',
  })
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
    description: 'successfull',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  // @UseInterceptors(CacheInterceptor)
  async postCartItems(
    @Body() body,
    @Res() res: Response,
    @Param('queueGroupId') queueGroupId: string,
    @Param('queueCustomerId') queueCustomerId: string,
    @Param('queueId') queueId: string,
  ) {
    const { product, totalPrice, orderPlaced } = body;

    if (
      !validationUtil.exists(queueCustomerId) ||
      !validationUtil.isId(queueCustomerId)
    ) {
      return new HttpException('Invalid id', HttpStatus.BAD_REQUEST);
    }
    const result = await this.queueCustomerInteractor.addToCart(
      product,
      totalPrice,
      orderPlaced,
      queueCustomerId,
      queueGroupId,
      queueId,
    );
    return res.status(200).json(result);
  }
  /* ================== */

  @ApiTags('Add Cartitems')
  @Get('/:queueCustomerId/cartItems')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description:
      'Add items to the shopping cart with their respective customer',
  })
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
    description: 'successfull',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  // @UseInterceptors(CacheInterceptor)
  async getCartItems(
    @Res() res: Response,
    @Param('queueGroupId') queueGroupId: string,
    @Param('queueCustomerId') queueCustomerId: string,
    @Param('queueId') queueId: string,
  ) {
    if (
      !validationUtil.exists(queueCustomerId) ||
      !validationUtil.isId(queueCustomerId)
    ) {
      return new HttpException('Invalid id', HttpStatus.BAD_REQUEST);
    }
    const result = await this.queueCustomerInteractor.getCartItems(
      queueCustomerId,
      queueGroupId,
      queueId,
    );
    return res.status(200).json(result);
  }
  /* ================== */

  @ApiTags('Add Cartitems')
  @Patch('/:queueCustomerId/cartItems')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description:
      'Add items to the shopping cart with their respective customer',
  })
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
    description: 'successfull',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  // @UseInterceptors(CacheInterceptor)
  async updateCartItems(
    @Res() res: Response,
    @Body() body,
    @Req() req,
    @Param('queueCustomerId') queueCustomerId: string,
    @Param('queueGroupId') queueGroupId: string,
    @Param('queueId') queueId: string,
  ) {
    console.log(body, 'body from cart');
    const { completed, cartId } = body;
    if (
      !validationUtil.exists(queueGroupId) ||
      !validationUtil.isId(queueGroupId)
    ) {
      return new HttpException('Invalid id', HttpStatus.BAD_REQUEST);
    }
    const result = await this.queueCustomerInteractor.updateCartItems(
      completed,
      req.requestingUser.email,
      cartId,
      queueGroupId,
      queueId,
    );
    return res.status(200).json(result);
  }
  /* ================== */

  @ApiTags('Add Cartitems')
  @Delete('/:queueCustomerId/cartItems')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description:
      'Add items to the shopping cart with their respective customer',
  })
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
    description: 'successfull',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  // @UseInterceptors(CacheInterceptor)
  async deleteCartItems(
    @Res() res: Response,
    @Body() body,
    @Req() req,
    @Param('queueCustomerId') queueCustomerId: string,
    @Param('queueGroupId') queueGroupId: string,
    @Param('queueId') queueId: string,
  ) {
    console.log(body, 'body from cart');
    const { cartId, cartItemId } = body;
    if (
      !validationUtil.exists(queueGroupId) ||
      !validationUtil.isId(queueGroupId)
    ) {
      return new HttpException('Invalid id', HttpStatus.BAD_REQUEST);
    }
    const result = await this.queueCustomerInteractor.deleteCartItems(
      req.requestingUser.email,
      cartId,
      cartItemId,
      queueGroupId,
      queueId,
    );
    return res.status(200).json(result);
  }
}
