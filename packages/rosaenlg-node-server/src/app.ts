import express = require('express');
import swaggerUi = require('swagger-ui-express');
import * as fs from 'fs';
import http = require('http');
import * as bodyParser from 'body-parser';
import cors from 'cors';
import { resolve } from 'path';
import winston = require('winston');
import jwt = require('express-jwt');
import jwks = require('jwks-rsa');
import yn from 'yn';

winston.configure({
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
});

export class App {
  public app: express.Application;
  public port: number;
  public server: http.Server;

  private getJwtChecker(): jwt.RequestHandler {
    winston.info({
      action: 'startup',
      message: `oauth with jwksUri: ${process.env.JWT_JWKS_URI}, audience:${process.env.JWT_AUDIENCE}, issuer: ${process.env.JWT_ISSUER}`,
    });
    return jwt({
      secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.JWT_JWKS_URI,
      }),
      audience: process.env.JWT_AUDIENCE,
      issuer: process.env.JWT_ISSUER,
      algorithms: ['RS256'],
    });
  }

  constructor(controllers: any[], port: number) {
    this.app = express();
    this.port = port;

    this.initializeMiddlewares();
    this.initializeControllers(controllers);

    this.server = this.app.listen(this.port, () => {
      winston.info({ action: 'startup', message: `App listening on the port ${this.port}` });
    });
  }

  private initializeMiddlewares(): void {
    // body parser
    this.app.use(bodyParser.json({ limit: '50mb' }));

    // cors
    this.app.use(cors());

    // swagger
    const openApiDocumentation = JSON.parse(
      fs.readFileSync(resolve(__dirname, 'openApiDocumentation_merged.json'), 'utf8'),
    );
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocumentation));

    // JWT
    if (yn(process.env.JWT_USE)) {
      this.app.use(this.getJwtChecker().unless({ path: ['/health', '/api-docs'] }));
      winston.info({ action: 'startup', message: `JWT activated (${process.env.JWT_USE})` });
    }

    // error management
    this.app.use(function (err, _req: express.Request, res: express.Response, _next) {
      winston.error({ message: err });
      // istanbul ignore next
      if (!err.status) err.status = 500;
      res.status(err.status).send(err.message);
    });

    /*
    // debug
    this.app.use((request: express.Request,
        response: express.Response,
        next: Function) => {
      winston.debug(`${request.method} ${request.path}`);
      next();
    });
    */
  }

  private initializeControllers(controllers: any[]): void {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }
}

// export default App;
