import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Delete,
  Patch,
  HttpException,
  UseFilters,
  Next,
} from '@nestjs/common';
import { AuthMiddleware } from '../../../middleware/authenticated.middleware';

import validationUtil from '../../../util/validation';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BusinessService } from '../services/Root/service/index.service';
import { Req, Res } from '@nestjs/common/decorators';
import { Response } from 'express';
import { HttpExceptionFilter } from '../../../middleware/err.Middleware';
import { AdvertisementService } from '../services/advertisement/service/advertisement.service';
@Controller('queueGroup/:queueGroupId/advertisement')
// @UsePipes(
//   new ValidationPipe({
//     whitelist: true,
//     transform: true,
//   }),
// )
export class AdvertsController {
  constructor(private advertisementInteractor: AdvertisementService) {}

  @ApiTags('Get advertisement')
  @Post('/')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get advertisement',
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
  async postAdverts(
    @Req() req,
    @Next() next,
    @Res() res: Response,
  ): Promise<any> {
    const {
      rest: { text, imageUrl, addType, description },
    } = req.body;

    if (
      !validationUtil.exists(req.params.queueGroupId) ||
      !validationUtil.isId(req.params.queueGroupId)
    ) {
      res.status(400).send('validation/queueGroupId');
      return;
    }
    if (!validationUtil.exists(text) || !validationUtil.isString(text)) {
      res.status(400).send('validation/text');
      return;
    }
    if (
      imageUrl !== '' &&
      validationUtil.exists(imageUrl) &&
      !validationUtil.isUrl(imageUrl)
    ) {
      res.status(400).send('validation/imageUrl');
      return;
    }
    const result = await this.advertisementInteractor.create(
      req.requestingUser.email,
      req.params.queueGroupId,
      {
        text,
        imageUrl,
        addType,
        description,
      },
      req.body.uploader || '',
      req.body.rest.price_Currency.price,
      req.body.rest.price_Currency.currency,
    );
    return res.json(result);
  }
  @ApiTags('Get advertisement')
  @Get('/random')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get advertisement',
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
  async register(@Req() req, @Next() next, @Res() res: Response): Promise<any> {
    if (
      !validationUtil.exists(req.params.queueGroupId) ||
      !validationUtil.isId(req.params.queueGroupId)
    ) {
      res.status(400).send('validation/queueGroupId');
      return;
    }

    const result = await this.advertisementInteractor.getRandom(
      req.params.queueGroupId,
    );
    return res.status(200).json(result);
  }
  @ApiTags('Get advertisement')
  @Get('/all')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get advertisement',
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
  async getAllAdverts(
    @Req() req,
    @Next() next,
    @Res() res: Response,
  ): Promise<any> {
    if (
      !validationUtil.exists(req.params.queueGroupId) ||
      !validationUtil.isId(req.params.queueGroupId)
    ) {
      throw new HttpException(
        'validation/queueGroupId',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.advertisementInteractor.getAll(
      req.params.queueGroupId,
    );
    console.log(result);
    return res.status(200).json(result);
  }
  @ApiTags('Get advertisement')
  @Get('/:advertisementId')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get advertisement',
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
  async getAdvertsById(
    @Req() req,
    @Next() next,
    @Res() res: Response,
  ): Promise<any> {
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
      !validationUtil.exists(req.params.advertisementId) ||
      !validationUtil.isId(req.params.advertisementId)
    ) {
      throw new HttpException(
        'validation/advertisementId',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.advertisementInteractor.get(
      req.params.queueGroupId,
      req.params.advertisementId,
    );
    return res.status(200).json(result);
  }
  @ApiTags('Get advertisement')
  @Patch('/:advertisementId')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get advertisement',
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
  async updateAdvertsById(
    @Req() req,
    @Next() next,
    @Res() res: Response,
  ): Promise<any> {
    const { text, imageUrl, addType, description } = req.body;
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
      !validationUtil.exists(req.params.advertisementId) ||
      !validationUtil.isId(req.params.advertisementId)
    ) {
      throw new HttpException(
        'validation/advertisementId',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!validationUtil.exists(text) || !validationUtil.isString(text)) {
      throw new HttpException('validation/text', HttpStatus.BAD_REQUEST);
    }
    if (
      imageUrl !== '' &&
      validationUtil.exists(imageUrl) &&
      !validationUtil.isUrl(imageUrl)
    ) {
      res.status(400).send('validation/imageUrl');
      return;
    }
    const result = await this.advertisementInteractor.edit(
      req.requestingUser.email,
      req.params.queueGroupId,
      req.params.advertisementId,

      {
        text,
        imageUrl,
        addType,
        description,
        base64: req.body.uploader || '',
        price: req.body.price_Currency.price,
        currency: req.body.price_Currency.currency,
      },
    );
    return res.json(result);
  }
  @ApiTags('Get advertisement')
  @Delete('/:advertisementId')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get advertisement',
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
  async DeleteAdvertsById(
    @Req() req,
    @Next() next,
    @Res() res: Response,
  ): Promise<any> {
    const { text, imageUrl } = req.body;

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
      !validationUtil.exists(req.params.advertisementId) ||
      !validationUtil.isId(req.params.advertisementId)
    ) {
      throw new HttpException(
        'validation/advertisementId',
        HttpStatus.BAD_REQUEST,
      );
    }
    const destroyResult = await this.advertisementInteractor.destroy(
      req.requestingUser.email,
      req.params.queueGroupId,
      req.params.advertisementId,
    );
    return res.json(destroyResult);
  }
}
