const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const App = require('../dist/app').App;
const TemplatesController = require('../dist/templates.controller').default;
const helper = require('./helper');

chai.use(chaiHttp);
chai.should();

describe('cloudwatch', function () {
  let app;
  before(function () {
    app = new App(
      [
        new TemplatesController({
          cloudwatch: {
            logGroupName: 'rosaenlg-rapidapi',
            logStreamName: 'local-test',
            accessKeyId: process.env.AWS_CW_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_CW_SECRET_ACCESS_KEY,
            region: 'eu-west-1',
          },
        }),
      ],
      5001,
    ).server;
  });
  after(function (done) {
    app.close();
    done();
  });
  it(`should render`, function (done) {
    chai
      .request(app)
      .post(`/templates/render`)
      .set('content-type', 'application/json')
      .send(helper.getTestTemplate('chanson_with_data'))
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        const content = res.body;
        assert.strictEqual(content.renderOptions.language, 'fr_FR');
        assert.strictEqual(content.status, 'CREATED');
        assert(
          content.renderedText.indexOf(`Il chantera "Non, je ne regrette rien" d'Édith Piaf`) > -1,
          content.renderedText,
        );
        done();
      });
  });
});
