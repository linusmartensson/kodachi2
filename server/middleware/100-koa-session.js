import session from 'koa-session';
import winston from 'winston';

module.exports = (app) => {
	app.koa.use(app.sessionHandler = session(app.koa, {store: app.sessionStore}));
}