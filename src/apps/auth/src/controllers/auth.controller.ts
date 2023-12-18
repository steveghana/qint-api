import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  NestMiddleware,
  UsePipes,
  UseFilters,
  ValidationPipe,
  Next,
} from '@nestjs/common';
import validationUtil from '../../../util/validation';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { alpha2ToNumeric, isValid } from 'i18n-iso-countries';

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
import { AuthService } from '../services/user.service';
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/user';

import { AuthMiddleware } from '../../../middleware/authenticated.middleware';
import { HttpExceptionFilter } from '../../../middleware/err.Middleware';

@Controller('/user')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiTags('registerBusiness')
  @Post('/register')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Registering new business',
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
    description: 'Business Registered sucessfully',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request something went wrong' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  async register(@Body() req, @Res() res: Response) {
    if (
      validationUtil.exists(req.queueGroup.phone) &&
      req.queueGroup.phone !== '' &&
      !validationUtil.isPhone(req.queueGroup.phone)
    ) {
      throw new HttpException('validationUtil/phone', HttpStatus.BAD_REQUEST);
    }
    if (
      !validationUtil.exists(req.queueGroup.country) ||
      !isValid(req.queueGroup.country)
    ) {
      throw new HttpException('validationUtil/country', HttpStatus.BAD_REQUEST);
    }
    const countryCode = Number(alpha2ToNumeric(req.queueGroup.country));
    const intialQueueGroup = {
      name: req.queueGroup.name,
      phone: req.queueGroup.phone,
      type: req.queueGroup.type,
      country: countryCode,
      address: req.queueGroup.address || '',
      geometryLat: req.queueGroup.geometryLat || null,
      geometryLong: req.queueGroup.geometryLong || null,
      centerLat: req.queueGroup.centerLat || null,
      centerLong: req.queueGroup.centerLong || null,
    };
    const result = await this.authService.register(
      req.user.email,
      req.user.password,
      req.user.fullName,
      req.queueGroup.country,
      intialQueueGroup,
    );
    return res.json(result);
  }

  @Post('/login')
  // @UseFilters(new HttpExceptionFilter())
  @ApiTags('login')
  @ApiOperation({
    description: 'loggin new business',
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
    description: 'Business Registered sucessfully',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request something went wrong' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  async login(@Body() req, @Res() res: Response) {
    if (
      !validationUtil.exists(req.email) ||
      !validationUtil.isEmail(req.email)
    ) {
      throw new HttpException('validationUtil/email', HttpStatus.BAD_REQUEST);
    }
    if (
      !validationUtil.exists(req.password) ||
      !validationUtil.isPassword(req.password)
    ) {
      throw new HttpException(
        'validationUtil/password',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      validationUtil.exists(req.rememberMe) &&
      !validationUtil.isBool(req.rememberMe)
    ) {
      throw new HttpException(
        'validationUtil/rememberMe',
        HttpStatus.BAD_REQUEST,
      );
    }
    const result = await this.authService.login(
      req.email,
      req.password,
      req.rememberMe,
    );

    return res.json(result);
  }

  @Post('/login/credentialToken')
  @ApiTags('login')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'loggin new business',
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
    description: 'Business Registered sucessfully',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request something went wrong' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  async loginWithCredentials(@Body() req, @Res() res: Response) {
    if (
      !validationUtil.exists(req.credentialTokenUuid) ||
      !validationUtil.isUuid(req.credentialTokenUuid)
    ) {
      return new HttpException(
        'validationUtil/credentialTokenUuid',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.authService.loginWithCredentialToken(
      req.credentialTokenUuid,
    );
    return res.json(result);
  }

  @Post('/logout')
  @ApiTags('logout')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'logout  business',
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
    description: 'Business Registered sucessfully',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request something went wrong' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  async logout(@Next() next, @Req() req, @Res() res: Response) {
    if (
      validationUtil.exists(req.credentialToken) &&
      !validationUtil.isUuid(req.credentialToken)
    ) {
      return new HttpException(
        'validationUtil/credentialTokenUuid',
        HttpStatus.BAD_REQUEST,
      );
    }
    // if (err) {
    //   return next(err);
    // }
    const result = await this.authService.logout(
      req.requestingAuthToken.id,
      req.credentialToken,
    );
    return res.status(200).send(result);
  }
  @Get('/whoami')
  // @UseMiddleware(AuthMiddleware)
  @ApiTags('whoami')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'logout  business',
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
    description: 'Business Registered sucessfully',
    schema: { example: { isAuthenticate: true, status: 200 } },
  })
  @ApiBadRequestResponse({ description: 'Bad Request something went wrong' })
  @ApiInternalServerErrorResponse({ description: 'Server is down' })
  async whoami(@Req() req: Request, @Res() res: Response, @Next() next) {
    const user: IUser = await (req as any).requestingUser;
    // if (err) {
    //   console.log(err);
    //   return next(err);
    // }
    if (!user) {
      res.status(403).send();
      return;
    }

    return res.json({
      email: user.email,
      fullName: user.fullName,
    });
  }
}
