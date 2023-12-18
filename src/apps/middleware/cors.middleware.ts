import { Injectable, NestMiddleware, Next } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import config from '../Config/config';
import logger from '../util/log';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(process.env.NODE_ENV, 'this is the node environment');
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins: string[] = [config.BusinessURL, config.customerURL];
      const origin = req.get('origin');
      if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
      } else {
        logger.log(
          'api',
          'Attempted access from not allowed origin: ' + origin,
        );
      }
    } else {
      const acceptLanguage = req.headers['accept-language'];

      console.log(`Accept-Language: ${acceptLanguage}`);
      console.log('api', 'Access is granted for development mode:  ');
      res.header('Access-Control-Allow-Origin', '*');
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.status(200).send();
      return;
    }
    next();
  }
}
