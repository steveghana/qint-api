import {
  Controller,
  HttpCode,
  HttpStatus,
  UseFilters,
  Next,
} from '@nestjs/common';
import validationUtil from '../../../util/validation';
import {} from '../services/Root/service/index.service';
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

import { Put, Req, Res } from '@nestjs/common/decorators';
import { Response } from 'express';
import { HttpExceptionFilter } from '../../../middleware/err.Middleware';
import { IPermission } from '../../../types/queueGroupUserPermission';
import { UserPermissionsService } from '../services/Permissions/service/user.service';

@Controller('/queueGroup/:queueGroupId/user')
// @UsePipes(
//   new ValidationPipe({
//     whitelist: true,
//     transform: true,
//   }),
// )
export class UserPermissionController {
  constructor(private queueGroupUserservice: UserPermissionsService) {}

  @ApiTags('Get business by email')
  @Put('/')
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
  async register(@Req() req, @Next() next, @Res() res: Response): Promise<any> {
    const queueGroupId = req.params.queueGroupId;

    if (
      !validationUtil.exists(queueGroupId) ||
      !validationUtil.isId(queueGroupId)
    ) {
      res.status(400).send('validation/queueGroupId');
      return;
    }
    if (
      !validationUtil.isArray(req.body) ||
      !validationUtil.each<IPermission>(
        req.body,
        (permission) =>
          validationUtil.isEmail(permission.userEmail) &&
          validationUtil.isBool(permission.canManageQueue) &&
          validationUtil.isBool(permission.canManagePermissions) &&
          validationUtil.isBool(permission.isOwner),
      )
    ) {
      res.status(400).send('validation/body');
      return;
    }

    // if (err) {
    //   return next(err);
    // }
    const result = await this.queueGroupUserservice.setPermissions(
      req.requestingUser.email,
      queueGroupId,
      req.body,
    );
    return res.status(200).json(result);
  }
}
