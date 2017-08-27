import session from 'koa-session';
import winston from 'winston';

module.exports = (app) => {
	app.koa.use(app.sessionHandler = session(app.koa, {store: app.sessionStore}));
    app.koa.use(async (ctx,next) => {
        await app.userApi.session(ctx);
        if(!ctx.session.uuid) ctx.session.uuid = app.uuid();
        next();
    });
}
