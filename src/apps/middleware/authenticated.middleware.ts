import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import asyncWrapper from '../util/asyncWrapper';
import { Dependencies, injectDependencies } from '../util/dependencyInjector';
import AuthToken from '../auth/src/services/Token/Entity/authToken';

export type IMockRequest = any;
export type IMockResponse = any;
export type IMockNextFunction = (err?: Error) => void;

type RequestType = Request | IMockRequest;
type ResponseType = Response | IMockResponse;
type NextFunctionType = NextFunction | IMockNextFunction;

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly dependencies: Dependencies = null;
  // constructor(private readonly dependencies: Dependencies = null) {
  //     this.dependencies = injectDependencies(dependencies, ['db']);
  // }

  async use(req: RequestType, res: ResponseType, next: NextFunctionType) {
    try {
      console.log('Authenticate middleware entered', process.env.NODE_ENV);
      const authTokenId = req.headers.authorization;
      console.log(authTokenId);
      if (!authTokenId) {
        res.status(403).send('Authorization header required');
        // throw new HttpException(
        //   'Authorization header required',
        //   HttpStatus.FORBIDDEN,
        // );
        return;
      }
      const authToken = await AuthToken.getWithUser(
        authTokenId,
        this.dependencies,
      );
      if (!authToken) {
        res.status(403).send('not found');
        // throw new HttpException('Not found', HttpStatus.FORBIDDEN);
        return;
      }
      if (authToken.isInactive()) {
        // throw new HttpException('inactive', HttpStatus.FORBIDDEN);
        res.status(403).send('inactive');

        return;
      }
      req.requestingAuthToken = authToken;
      req.requestingUser = authToken.user;
      next();
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
