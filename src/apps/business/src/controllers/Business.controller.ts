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
import {
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common/decorators';
import { Response } from 'express';
import { HttpExceptionFilter } from '../../../middleware/err.Middleware';
import { AuthenticationTtlMiddleware } from '../../../middleware/authenticationTtl.middleware';
import { AuthMiddleware } from '../../../middleware/authenticated.middleware';
const validateArea = (area: Partial<IQueueArea>) => {
  if (validationUtil.exists(area.id) && !validationUtil.isId(area.id)) {
    return 'validation/id';
  }
  // if (
  //   !validationUtil.exists(area.name) ||
  //   !validationUtil.isString(area.name)
  // ) {
  //   return 'validation/name';
  // }
  if (
    area.traits &&
    (!validationUtil.isArray(area.traits) ||
      !validationUtil.each<any>(
        area.traits,
        (trait) =>
          validationUtil.isString(trait.type) &&
          QueueCustomerTraitTypes.includes(trait.type),
      ))
  ) {
    return 'validation/traits';
  }
  return '';
};
// @UseInterceptors(AuthenticationTtlMiddleware)
@Controller('/queueGroup')
export class BusinessController {
  constructor(private queueGroupInteractor: BusinessService) {}

  @ApiTags('Get business by email')
  @Get('/')
  // @UseInterceptors(AuthenticationTtlMiddleware)
  // @UseGuards(AuthMiddleware)
  // @UseFilters(new HttpExceptionFilter())
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
  async register(@Req() req, @Next() next, @Res() res: Response): Promise<any> {
    // if (err) {
    //   return next(err);
    // }
    const result = await this.queueGroupInteractor.getQueueGroupByEmail(
      req.requestingUser?.email,
    );
    return res.json(result);
  }

  /* ================== */
  @ApiTags('Get all business')
  @Get('/all')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get all business',
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
  @ApiBadRequestResponse({
    description: "doesn't exist",
    schema: { example: { status: 404 } },
  })
  @ApiInternalServerErrorResponse({
    description: 'Server is down please try again later',
  })
  async getAllBusiness(
    @Req() req,
    @Next() next,
    @Res() res: Response,
  ): Promise<any> {
    const result = await this.queueGroupInteractor.getallQueueGroup();
    return res.status(200).json(result);
  }

  /* ================== */
  @ApiTags('Post business')
  @Post('/')
  // @UseInterceptors(AuthenticationTtlMiddleware)
  // @UseGuards(AuthMiddleware)
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Post business',
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
  @ApiBadRequestResponse({
    description: "doesn't exist",
    schema: { example: { status: 404 } },
  })
  @ApiInternalServerErrorResponse({
    description: 'Server is down please try again later',
  })
  async postBusiness(
    @Req() req,
    @Next() next,
    @Res() res: Response,
  ): Promise<any> {
    if (
      !validationUtil.exists(req.body.name) ||
      !validationUtil.isString(req.body.name)
    ) {
      throw new HttpException('invalid name', HttpStatus.BAD_REQUEST);
      return;
    }

    if (
      validationUtil.exists(req.body.phone) &&
      !validationUtil.isPhone(req.body.phone)
    ) {
      throw new HttpException('invalid phone', HttpStatus.BAD_REQUEST);
      return;
    }
    // if (err) {
    //   return next(err);
    // }
    const renameResult =
      await this.queueGroupInteractor.setQueueGroupNameByEmail(
        req.requestingUser.email,
        req.body.name,
      );
    //@ts-ignore
    if (!renameResult) {
      await this.queueGroupInteractor.createQueueGroup(
        req.body.name,
        req.requestingUser.email,
        req.body.phone,
      );
    }
    return res.status(200).json(renameResult);
  }

  /* ================== */
  @ApiTags('get Business By Id')
  @Get('/:queueGroupId')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get business',
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
  async getBusinessById(
    @Param('queueGroupId') queueGroupId: string,
    @Next() next,
    @Res() res: Response,
  ): Promise<any> {
    const result = await this.queueGroupInteractor.getQueueGroupById(
      queueGroupId,
    );
    return res.status(200).json(result);
  }

  /* ================== */
  @ApiTags('get Business By Id')
  @Patch('/:queueGroupId')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get business',
  })
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    schema: {
      example: {
        statusCode: 403,
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
  async uppdateBusinessById(
    @Body() body,
    @Req() req,
    @Next() next,
    @Res() res: Response,
  ): Promise<any> {
    if (
      validationUtil.exists(body.phone) &&
      body.phone !== '' &&
      !validationUtil.isPhone(body.phone)
    ) {
      throw new BadRequestException();
    }
    const updateObj: { [key: string]: any } = {};
    const addIfExists = (key: string) => {
      if (validationUtil.exists(body[key])) {
        updateObj[key] = body[key];
      }
    };
    addIfExists('logoUrl');
    addIfExists('name');
    addIfExists('phone');
    // if (err) {
    //   return next(err);
    // }
    let result = await this.queueGroupInteractor.patchQueueGroup(
      req.requestingUser.email,
      req.params.queueGroupId,
      updateObj,
    );
    return res.status(200).json(result);
  }

  /* ================== */
  @ApiTags('get all Business area')
  @Get('/:queueGroupId/area/all')
  // @UseInterceptors(AuthenticationTtlMiddleware)
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get business',
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
  @ApiBadRequestResponse({
    description: "doesn't exist",
    schema: { example: { status: 404 } },
  })
  @ApiInternalServerErrorResponse({
    description: 'Server is down please try again later',
  })
  async getAllBusinessArea(
    @Req() req,
    @Next() next,
    @Res() res: Response,
  ): Promise<any> {
    const { queueGroupId } = req.params;
    if (
      !validationUtil.exists(queueGroupId) ||
      !validationUtil.isId(queueGroupId)
    ) {
      return new HttpException(
        'validation/queueGroupId',
        HttpStatus.BAD_REQUEST,
      );
    }
    const result = await this.queueGroupInteractor.getQueueGroupAreas(
      queueGroupId,
    );

    return res.status(200).json(result);
  }

  /* ================== */
  @ApiTags('get Business Area Id')
  @Patch('/:queueGroupId/area')
  // @UseInterceptors(AuthenticationTtlMiddleware)
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get business area',
  })
  // @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    schema: {
      example: {
        statusCode: 403,
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
  async updateBusinessArea(
    @Param() param,
    @Body() body,
    @Req() req,
    @Next() next,
    @Res() res: Response,
  ): Promise<any> {
    const { queueGroupId } = param;

    if (
      !validationUtil.exists(queueGroupId) ||
      !validationUtil.isId(queueGroupId)
    ) {
      throw new HttpException(
        'validation/queueGroupId',
        HttpStatus.BAD_REQUEST,
      );
    }
    const updateAreas: Partial<IQueueArea>[] = body.update.map(
      (area: Partial<IQueueArea>) => ({
        id: area.id,
        name: {
          english: area.name.english || '',
          hebrew: area.name.hebrew || '',
        },
        traits:
          area.traits &&
          area.traits.map((trait: any) => ({ type: trait.type })),
      }),
    );

    const addAreas: Partial<IQueueArea>[] = body.add.map(
      (area: Partial<IQueueArea>) => ({
        id: area.id,
        name: {
          english: area.name.english || '',
          hebrew: area.name.hebrew || '',
        },
        traits:
          area.traits &&
          area.traits.map((trait: any) => ({ type: trait.type })),
      }),
    );

    const invalidArea =
      (addAreas.length > 0 &&
        addAreas.find((area) => validateArea(area) !== '')) ||
      (updateAreas.length > 0 &&
        updateAreas.find((area) => validateArea(area) !== ''));

    if (invalidArea) {
      throw new HttpException(
        validateArea(invalidArea),
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      body.delete &&
      (!validationUtil.isArray(req.body.delete) ||
        !validationUtil.each<any>(req.body.delete, (areaId) =>
          validationUtil.isId(areaId),
        ))
    ) {
      throw new HttpException('validation/delete', HttpStatus.BAD_REQUEST);
    }

    let result = await this.queueGroupInteractor.patchQueueGroupArea(
      req.requestingUser.email,
      req.params.queueGroupId,
      req.body.delete,
      addAreas,
      updateAreas,
    );
    return res.status(200).json(result);
  }

  /* ================== */
  @ApiTags('get all Business area')
  @Get('/:queueGroupId/table/all')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get business',
  })
  // @UsePipes(ValidationPipe)
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
  @HttpCode(HttpStatus.OK)
  async getAllBusinessTables(
    @Param('queueGroupId') queueGroupId: string,
    @Next() next,
    @Res() res: Response,
  ) {
    const result = await this.queueGroupInteractor.getQueueGroupTables(
      queueGroupId,
    );

    return res.status(200).json(result);
  }

  /* ================== */
  @ApiTags('get Business By Id')
  @Patch('/:queueGroupId/table')
  @UseFilters(new HttpExceptionFilter())
  @ApiOperation({
    description: 'Get business',
  })
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    schema: {
      example: {
        statusCode: 403,
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
  async updateBusinessTable(
    @Req() req,
    @Next() next,
    @Res() res: Response,
  ): Promise<any> {
    if (
      !validationUtil.exists(req.params.queueGroupId) ||
      !validationUtil.isId(req.params.queueGroupId)
    ) {
      throw new HttpException('validation/queueGroupId', HttpStatus.FORBIDDEN);
    }
    const updateTables: Partial<IQueueGroupTable>[] = req.body.update.map(
      (table: Partial<IQueueGroupTable>) => ({
        id: table.id,
        capacity: table.capacity,
        minCapacity: table.minCapacity,
        areas: table.areas,
      }),
    );

    const addTables: Partial<IQueueGroupTable>[] = req.body.add.map(
      (table: Partial<IQueueGroupTable>) => ({
        id: table.id,
        capacity: table.capacity,
        areas: table.areas,
      }),
    );

    if (
      req.body.delete &&
      (!validationUtil.isArray(req.body.delete) ||
        !validationUtil.each<any>(req.body.delete, (tableId) =>
          validationUtil.isId(tableId),
        ))
    ) {
      throw new HttpException('validation/delete', HttpStatus.FORBIDDEN);
    }
    // if (err) {
    //   return next(err);
    // }
    let result = await this.queueGroupInteractor.patchQueueGroupTable(
      req.requestingUser.email,
      req.params.queueGroupId,
      req.body.delete,
      addTables,
      updateTables,
    );
    return res.status(200).json(result);
  }
}
