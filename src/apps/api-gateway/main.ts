import * as express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AddressInfo } from 'net';
import * as http from 'http';
import smsUtil from '../util/sms';
import emailUtil from '../util/email';
import pushUtil from '../util/push';
import language from '../util/language';
import { createServer, Server } from 'https';
import { WinstonModule } from 'nest-winston';
import config from '../Config/config';
import helmet from 'helmet';
// import  rateLimit from 'express-rate-limit';
// import  csurf from 'csurf';
import { AppModule } from './api-gateway.module';
import { NestExpressApplication } from '@nestjs/platform-express/interfaces';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { createDocument } from './src/swagger/swagger';
import * as winston from 'winston';
import { Logger, ValidationPipe, Next } from '@nestjs/common';
import { HttpExceptionFilter } from '../middleware/err.Middleware';
import Websocket from '../ws/';
export function getPort(): number {
  // If port is omitted or is 0, the operating system will assign an arbitrary unused port
  return process.env.NODE_ENV === 'test'
    ? 0
    : Number(process.env.PORT) || config.restApiPort;
}
const globalContext: {
  server?: http.Server | Server;
} = {};
function getEncryptionKeys() {
  return [
    Buffer.from(`-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----
`),
    Buffer.from(`-----BEGIN CERTIFICATE-----
MIIE7DCCAtQCCQC9bbb7vz7zCjANBgkqhkiG9w0BAQsFADA4MQ0wCwYDVQQKEwRI
b21lMQwwCgYDVQQHEwNUTFYxDDAKBgNVBAgTA1RMVjELMAkGA1UEBhMCSUwwHhcN
MjEwODAzMTMwMzI2WhcNMjIwODAzMTMwMzI2WjA4MQ0wCwYDVQQKEwRIb21lMQww
CgYDVQQHEwNUTFYxDDAKBgNVBAgTA1RMVjELMAkGA1UEBhMCSUwwggIiMA0GCSqG
SIb3DQEBAQUAA4ICDwAwggIKAoICAQC2Ya69bUWCdXZUY/By/oQzn6YVhOeZdDDR
L2KMDhWWlTm7zoBA8vsz/mZKFF1dUG23Q8+WTWRV6pgZB/wYEIN6rSlW2YFd4hIm
U0sfhq2JStGpdXpIUxSOiq079VljBaMetukadKmyBzaOktDfL4k7YcnGi3dUb8II
BDh977J2XLeezYYW6VGFQqR6LU6cYm1kzmKoRSe/h2YfLgygUQG9imI+pChLh86p
gLHg30SthIPV1jlI4WG5DJi8p8Gtns8/K2aJM03ZjPEY5BeT6nWxCEXzei5jE/W5
60DuVWI3tNgBTo6W1B3MrNQdBEI+IRhaC4yoAlb+PTRqiAKg7gl6qZMQUDmsE2kd
qF7rTe1Zcnsr9iCJf+KqJNeoUrefgB7jAY7dVO49zA+Y8k7GQKTcsgusi+dynknE
Qu1p8GyP1v2Kvu0BCIleiwQiO0P9oyiujg+7KhPAC4ODor0OkZcYbIRPHwrA2cwu
radA7gLvOhJCSMTdQIG4UuO1UJk3BX4NPR9vuj/rr6RwA5VWhmzconwHXtra9XQA
kfTjdlBgtq0lZyYUM3poGj3r6vJIEUqaicjOxAjfQrFycbbLdszFih7/xoVQ7zsG
iV8D9cWZnM/u2AmLV6TubOJmx+Llt6KyekPnvNnX122uGR60XCnjc++epdeUqClf
3eZxXyo1GQIDAQABMA0GCSqGSIb3DQEBCwUAA4ICAQA2xf9wQ/OwnrW/ijXF2Hjm
p3JkYxAX+854NCgmksq+hhw++IsoRvwd3wrOyc+kI4wo4kqHZbAZSwRIR6PcUoh9
8ad+MBtW5xAG1tm9yMbws9zWLf+LmkF5xcPTTjVubkNEEP4ar/juJbf6Ts8wx/2P
fK1tOOqH/Prfdmmn5iks/bF4KE84Gq0axvy8laz5e1wpVEdpdO/rsj/tha0w4Qy3
46ktmLeopMjtm0wQNfrdBUO4bxSv7dCZx2iQphJN9CrtZUEEzNHpRdkOHkxp3vmT
SGbs6ME1VdYFGGdDhQTAt6DsiZ0fmeQ1P6NkugpyvFETciBXpFXAXbWkMFgC2FBM
wKhapqXef+P9BPRDNfy2wWoRK8mQyUBxubdx7SfrzJ+RFr+9ljnteksTd5x5KSjY
ugrob/yJO/sle1uB3H1xPnnfdxBmlLD/yCq3X3zh2blmsnMWZDRkpQz+Jv/EIguy
+cpVpRA9Ugao0nRMFctAeTxFDLBHN8WBY+n3P5bS9b7VrKnzq2aT2wgOTkiLDfuL
dIcmTVyc1GI/q3rrXvwrc0zWpihhDZ6OHtt67xFCgrX1sP1aSBfftsQ5qOJtL8kW
bE1lRcOFekHqr+a8QERhisF+TcDSRe7ihGePIhUqUqDeDKAdJhqe57GPcw5QWFzG
eptanz81UbGC/NJO3kZCfA==
-----END CERTIFICATE-----
`),
  ];
}

export async function init() {
  const expressApp = express();
  const logger = WinstonModule.createLogger({
    level: 'debug',
    transports: [new winston.transports.Console()],
  });

  // Creating NestJS application with Express adapter
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger: new Logger() },
  );
  // app.use((req, res, next) => {
  //   res.json('Server now started');
  //   next();
  // });
  app.use(helmet());
  /*
   app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 250, // limit each IP to 100 requests per windowMs
    }),
  );
  For cross site request forgery attacks
  app.use(csurf()); 
  */

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.enableCors();
  app.useLogger(new Logger());
  app.useGlobalFilters(new HttpExceptionFilter());
  expressApp.use(express.urlencoded({ extended: false }));
  expressApp.use(express.json({ limit: '5mb' }));
  // Serve the service worker file from a non-public directory
  app.use('/worker', express.static(__dirname + '/worker'));
  // Initialize HTTP server
  let server: http.Server | Server;
  if (process.env.NODE_ENV !== 'production' && config.development.useHttps) {
    const [privateKey, certificate] = getEncryptionKeys();
    server = createServer({ key: privateKey, cert: certificate }, expressApp);
  } else {
    server = http.createServer(expressApp);
  }
  // Initialize WebSocket server
  Websocket.init(server);
  smsUtil.init();
  emailUtil.init();
  pushUtil.init();
  language.initialize();
  app.init();
  server.listen(3000, () => {
    const addr: AddressInfo = server.address() as AddressInfo;
    logger.log('api', `Now listening on port ${getPort()}`);
  });
  globalContext.server = server;
  process.on('SIGINT', async () => {
    logger.log('api', 'Shutting down gracefully...');
    await app.close();
    server.close();
    process.exit(0);
  });

  SwaggerModule.setup('api/v1', app, createDocument(app));
}
init();
export function getServer(context = globalContext): http.Server | Server {
  return context.server;
}
export default {
  getPort,
  getServer,
};
