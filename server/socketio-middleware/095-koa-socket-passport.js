
import passport      from 'koa-passport'
import { authorize } from 'koa-socket-passport'
import winston from 'winston'

module.exports = (app) => {

	app.io.use(authorize({
		passport: app.passport,
		key     : 'koa:sess',
		secret  : app.koa.keys,
		store   : app.sessionStore,
		success : onAuthorizeSuccess,
		fail    : onAuthorizeFail,
	}));
	app.io.use((ctx, next) => {
		//Read out the session object from koa-socket-passport for standardized access.
		ctx.session = ctx.__koaSocketPassport.session;
		app.clients[ctx.socket.socket.id].session = ctx.session;

		if(ctx.user)
			app.clients[ctx.socket.socket.id].user = ctx.user;
		else 
			delete app.clients[ctx.socket.socket.id].user;
		next();
	})
}

function onAuthorizeSuccess(ksp){
    winston.info('Account '+ksp.user.id+' online.');
}

function onAuthorizeFail(err, ksp){
    winston.info('Account N/A online.');

}
