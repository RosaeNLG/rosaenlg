import express = require('express');
import swaggerUi = require('swagger-ui-express');
import * as fs from 'fs';
import http = require('http');
import * as bodyParser from 'body-parser';
import { resolve } from 'path';

export default class App {
  public app: express.Application;
  public port: number;
  public server: http.Server;

  constructor(controllers: any[], port: number) {
    this.app = express();
    this.port = port;

    this.initializeMiddlewares();
    this.initializeControllers(controllers);

    this.server = this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }

  private initializeMiddlewares(): void {
    this.app.use(bodyParser.json({ limit: '50mb' }));
    const openApiDocumentation = JSON.parse(
      fs.readFileSync(resolve(__dirname, 'openApiDocumentation_merged.json'), 'utf8'),
    );
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocumentation));

    /*
    this.app.use((request: express.Request,
        response: express.Response,
        next: Function) => {
      console.log(`${request.method} ${request.path}`);
      next();
    });
    */
  }

  private initializeControllers(controllers: any[]): void {
    controllers.forEach(controller => {
      this.app.use('/', controller.router);
    });
  }
}

// export default App;
