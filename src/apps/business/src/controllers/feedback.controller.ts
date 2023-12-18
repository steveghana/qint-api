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
import { Req, Res } from '@nestjs/common/decorators';
import { Response } from 'express';
import { HttpExceptionFilter } from '../../../middleware/err.Middleware';
import { FeedbackService } from '../services/feedback/service/feedback.service';

@Controller('/feedback')
// @UsePipes(
//   new ValidationPipe({
//     whitelist: true,
//     transform: true,
//   }),
// )
export class FeedbackController {
  constructor(private feedbackInteractor: FeedbackService) {}

  @ApiTags('Get business by email')
  @Post('/')
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
  async registerFeedback(
    @Req() req,
    @Next() next,
    @Res() res: Response,
  ): Promise<any> {
    const { customerId, rating, feedback, queueGroupId } = req.body;

    // console.log('enter getmine', req.body);
    if (
      !validationUtil.exists(customerId) ||
      !validationUtil.isUuid(customerId)
    ) {
      throw new HttpException('validation/customerId', HttpStatus.BAD_REQUEST);
    }
    if (!validationUtil.exists(rating) || !validationUtil.isNumber(rating)) {
      throw new HttpException('validation/rating', HttpStatus.BAD_REQUEST);
    }
    // if (
    //   !validationUtil.exists(req.body.queueGroupId) ||
    //   !validationUtil.isId(req.body.queueGroupId)
    // ) {
    //   // res.status(400).send('validation/queueGroupId');
    //   throw new HttpException(
    //     'validation/queueGroupId',
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }

    if (
      !validationUtil.exists(feedback) ||
      !validationUtil.isString(feedback)
    ) {
      throw new HttpException('validation/feedback', HttpStatus.BAD_REQUEST);
    }
    console.log('enter getmine', req.body);

    let result = await this.feedbackInteractor.create({
      customerId,
      id: queueGroupId,
      rating,
      text: feedback,
    });
    return res.json(result);
  }

  @ApiTags('Get feedback')
  @Get('/:queueGroupId')
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
  async getFeedback(
    @Req() req,
    @Next() next,
    @Res() res: Response,
  ): Promise<any> {
    console.log(req.params.queueGroupId);
    let feedback = await this.feedbackInteractor.getAllFeedback(
      req.params.queueGroupId,
    );
    res.status(200).send(feedback);
  }
}
