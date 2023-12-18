import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
  UseFilters,
  Req,
  Next,
} from '@nestjs/common';
import validationUtil from '../../../util/validation';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { alpha2ToNumeric, isValid } from 'i18n-iso-countries';
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
import { LoginUser, RegisterDTO } from './user.dto';
import { QueueService } from '../services/service/queue.service';
import { HttpExceptionFilter } from '../../../middleware/err.Middleware';
import { OptionalAuthMiddleware } from '../../../middleware/optionallyAuthenticated.middleware';
import {
  Delete,
  Patch,
  Put,
} from '@nestjs/common/decorators/http/request-mapping.decorator';
import { Res } from '@nestjs/common/decorators';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('/queueGroup/:queueGroupId/queue')
// @UsePipes(
//   new ValidationPipe({
//     whitelist: true,
//     transform: true,
//   }),
// )
export class QueueController {
  constructor(private queueInteractor: QueueService) {}

  /* ===================== */

  @ApiTags('create Queue')
  @Post('/')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Create a queue',
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
    description: 'Queue created successfully',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  async createQueue(
    @Param('queueGroupId') queueGroupId: string,
    @Next() next,
    @Res() res: Response,
    @Req() req,
  ) {
    if (
      !validationUtil.exists(queueGroupId) ||
      !validationUtil.isId(queueGroupId)
    ) {
      throw new BadRequestException('validation/queueGroupId');
    }
    if (
      !validationUtil.exists(req.body.name) ||
      !validationUtil.isString(req.body.name)
    ) {
      throw new BadRequestException('validation/name');
    }
    // if (err) {
    //   return next(err);
    // }
    const result = await this.queueInteractor.create(
      req.body.name,
      req.params.queueGroupId,
      req.requestingUser.email,
    );
    return res.status(200).json(result);
  }

  /* ===================== */

  /* ===================== */

  @ApiTags('create Queue')
  @Get('/all')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Create a queue',
  })
  @UsePipes(ValidationPipe)
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
    description: 'Queue created successfully',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  async createAllQueue(
    @Param('queueGroupId') queueGroupId: string,
    @Next() next,
    @Res() res: Response,
    @Req() req,
  ) {
    if (
      !validationUtil.exists(queueGroupId) ||
      !validationUtil.isId(queueGroupId)
    ) {
      throw new BadRequestException('validation/queueGroupId');
    }
    const result = await this.queueInteractor.getAllInGroup(
      req.params.queueGroupId,
    );

    return res.status(200).json(result);
  }

  /* ===================== */

  /* ===================== */

  @ApiTags('Get by QueueId')
  @Get('/:queueId')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'get Queue by id',
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
    description: 'Got queue',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  async createQueueByQueueId(
    @Param('queueId') queueId: string,
    @Next() next,
    @Res() res: Response,
    @Req() req,
  ) {
    console.log('enter route getqueuegetById');

    if (!validationUtil.exists(queueId) || !validationUtil.isId(queueId)) {
      throw new BadRequestException('validation/queueId');
    }
    if (
      validationUtil.exists(req.query.customerId) &&
      !validationUtil.isUuid(req.query.customerId)
    ) {
      throw new BadRequestException('validation/customerId');
    }
    const result = await this.queueInteractor.getById(
      req.params.queueId,
      req.query.customerId,
      req.requestingUser && req.requestingUser.email,
    );

    return res.json(result);
  }

  /* ===================== */

  /* ===================== */

  @ApiTags('create Queue')
  @Delete('/:queueId')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'get Queue by id',
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
    description: 'Got queue',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  async deleteQueueByQueueId(
    @Param() Param,
    @Next() next,
    @Res() res: Response,
    @Req() req,
  ) {
    console.log('enter route delqueueById');

    if (
      !validationUtil.exists(Param.queueId) ||
      !validationUtil.isId(Param.queueId)
    ) {
      throw new BadRequestException('validation/queueId');
    }
    if (
      !validationUtil.exists(Param.queueGroupId) ||
      !validationUtil.isId(Param.queueGroupId)
    ) {
      throw new BadRequestException('validation/queueGroupId');
    }
    // if (err) {
    //   return next(err);
    // }
    const result = await this.queueInteractor.destroy(
      req.params.queueId,
      req.params.queueGroupId,
      req.requestingUser.email,
    );

    return res.status(200).json(result);
  }

  /* ===================== */
  /* ===================== */

  @ApiTags('Post next')
  @Post('/:queueId/next')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'get Queue by id',
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
    description: 'Got queue',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  async postNext(
    @Param() Param,
    @Next() next,
    @I18n() i18n: I18nContext,

    @Res() res: Response,
    @Req() req,
  ) {
    if (
      !validationUtil.exists(Param.queueId) ||
      !validationUtil.isId(Param.queueId)
    ) {
      throw new BadRequestException('validation/queueId');
    }
    if (
      !validationUtil.exists(Param.queueGroupId) ||
      !validationUtil.isId(Param.queueGroupId)
    ) {
      throw new BadRequestException('validation/queueGroupId');
    }
    // if (err) {
    //   return next(err);
    // }
    const result = await this.queueInteractor.callNext(
      i18n,
      req.params.queueId,
      req.params.queueGroupId,
      req.requestingUser.email,
    );

    return res.status(200).json(result);
  }

  /* ===================== */
  /* ===================== */

  @ApiTags('Post again')
  @Post('/:queueId/again')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'get Queue by id',
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
    description: 'Got queue',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  async postAgain(
    @Param() Param,
    @Next() next,
    @I18n() i18n: I18nContext,

    @Res() res: Response,
    @Req() req,
  ) {
    if (
      !validationUtil.exists(Param.queueId) ||
      !validationUtil.isId(Param.queueId)
    ) {
      throw new BadRequestException('validation/queueId');
    }
    if (
      !validationUtil.exists(Param.queueGroupId) ||
      !validationUtil.isId(Param.queueGroupId)
    ) {
      throw new BadRequestException('validation/queueGroupId');
    }
    // if (err) {
    //   return next(err);
    // }
    const result = await this.queueInteractor.callAgain(
      i18n,
      req.params.queueId,
      req.params.queueGroupId,
      req.requestingUser.email,
    );

    return res.status(200).json(result);
  }

  /* ===================== */
  /* ===================== */

  @ApiTags('Post previous')
  @Post('/:queueId/previous')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'get Queue by id',
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
    description: 'Got queue',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  async postPrevious(
    @Param() Param,
    @Next() next,
    @I18n() i18n: I18nContext,

    @Res() res: Response,
    @Req() req,
  ) {
    if (
      !validationUtil.exists(Param.queueId) ||
      !validationUtil.isId(Param.queueId)
    ) {
      throw new BadRequestException('validation/queueId');
    }
    if (
      !validationUtil.exists(Param.queueGroupId) ||
      !validationUtil.isId(Param.queueGroupId)
    ) {
      throw new BadRequestException('validation/queueGroupId');
    }
    // if (err) {
    //   return next(err);
    // }
    const result = await this.queueInteractor.callPrevious(
      i18n,
      req.params.queueId,
      req.params.queueGroupId,
      req.requestingUser.email,
    );

    return res.status(200).json(result);
  }

  /* ===================== */
  /* ===================== */

  @ApiTags('Post again')
  @Delete('/:queueId/next')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'get Queue by id',
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
    description: 'Got queue',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  async deleteNext(
    @Param('queueId, queueGroupId') queueId: string,
    queueGroupId: string,
    @Next() next,
    @Res() res: Response,
    @Req() req,
  ) {
    if (!validationUtil.exists(queueId) || !validationUtil.isId(queueId)) {
      throw new BadRequestException('validation/queueId');
    }
    if (
      !validationUtil.exists(queueGroupId) ||
      !validationUtil.isId(queueGroupId)
    ) {
      throw new BadRequestException('validation/queueGroupId');
    }
    // if (err) {
    //   return next(err);
    // }
    const result = await this.queueInteractor.resetNumbers(
      req.params.queueId,
      req.params.queueGroupId,
      req.requestingUser.email,
    );

    return res.status(200).json(result);
  }

  /* ===================== */
  /* ===================== */

  @ApiTags('Post again')
  @Put('/:queueId/table-checkout')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'get Queue by id',
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
    description: 'Got queue',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  async tableCheckout(
    @Param('queueId, queueGroupId') queueId: string,
    queueGroupId: string,
    @Next() next,
    @Res() res: Response,
    @Req() req,
  ) {
    const { tableId, peopleCount } = req;

    if (!validationUtil.exists(queueId) || !validationUtil.isId(queueId)) {
      throw new BadRequestException('validation/queueId');
    }
    if (
      !validationUtil.exists(queueGroupId) ||
      !validationUtil.isId(queueGroupId)
    ) {
      throw new BadRequestException('validation/queueGroupId');
    }
    if (!validationUtil.exists(tableId) || !validationUtil.isString(tableId)) {
      throw new BadRequestException('validation/tableId');
    }
    if (
      !validationUtil.exists(peopleCount) ||
      !validationUtil.isNumber(peopleCount) ||
      peopleCount < 1 ||
      Math.floor(peopleCount) !== peopleCount
    ) {
      throw new BadRequestException('validation/peopleCount');
    }
    // if (err) {
    //   return next(err);
    // }
    const result = await this.queueInteractor.checkoutTable(
      queueId,
      queueGroupId,
      { tableId, peopleCount },
      req.requestingUser.email,
    );

    return res.status(200).json(result);
  }

  /* ===================== */
  /* ===================== */

  @ApiTags('Post again')
  @Patch('/:queueId')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'get Queue by id',
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
    description: 'Got queue',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  async updateQRRenewal(
    @Param('queueId, queueGroupId') queueId: string,
    queueGroupId: string,
    @Next() next,
    @Res() res: Response,
    @Req() req,
  ) {
    const { password } = req;

    if (!validationUtil.exists(queueId) || !validationUtil.isId(queueId)) {
      throw new BadRequestException('validation/queueId');
    }
    if (
      !validationUtil.exists(queueGroupId) ||
      !validationUtil.isId(queueGroupId)
    ) {
      throw new BadRequestException('validation/queueGroupId');
    }
    if (
      !validationUtil.exists(password) ||
      !validationUtil.isString(password)
    ) {
      throw new BadRequestException('validation/renewnoPass');
    }
    // if (err) {
    //   return next(err);
    // }
    const result = await this.queueInteractor.updateQueueQRId(
      queueId,
      queueGroupId,
      password,
      req.requestingUser.email,
    );

    return res.status(200).json(result);
  }

  /* ===================== */
  /* ===================== */

  @ApiTags('Post again')
  @Put('/:queueId/display-type')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'get Queue by id',
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
    description: 'Got queue',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  async updateDisplayType(
    @Param() param,
    @Next() next,
    @Res() res: Response,
    @Req() req,
  ) {
    const { isCustomDisplay } = req;
    console.log(
      'at display type controller ',
      isCustomDisplay,
      param.queueGroupId,
    );
    // if (err) {
    //   return next(err);
    // }
    const result = await this.queueInteractor.updateQueueDisplay(
      param.queueId,
      param.queueGroupId,
      isCustomDisplay,
      req.requestingUser.email,
    );

    return res.status(200).json(result);
  }

  /* ===================== */
}
