if (process.env.NODE_ENV === 'production') {
  require('@google-cloud/trace-agent').start();
}


const {LoggingWinston} = require('@google-cloud/logging-winston');
const {createLogger, transports} = require('winston');

const loggingWinston = new LoggingWinston();

const logger = createLogger({
  level: 'info',
  transports: [
    new transports.Console(),
    loggingWinston,
  ],
});

const Koa = require('koa');
const app = new Koa();
const got = require('got');

const DISCOVERY_URL = 'https://www.googleapis.com/discovery/v1/apis';


app.use(async ctx => {
  const agent = require('@google-cloud/trace-agent').get();
  const rootSpan = agent.getCurrentRootSpan();
  logger.info(`Root span: ${rootSpan}`);
  logger.info(`Is active: ${agent.isActive()}`);
  logger.info(`Is real span: ${agent.isRealSpan(rootSpan)}`);
  logger.info('Before request');
  const {body} = await got(DISCOVERY_URL, {responseType: 'json'});
  logger.info('After request');
  const names = body.items.map(item => item.name);
  ctx.response.status = 200;
  ctx.body = names.join('\n');
});

app.listen(process.env.PORT || 8080);
