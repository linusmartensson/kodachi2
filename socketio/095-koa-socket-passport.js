
import IO            from 'koa-socket'
import passport      from 'koa-passport'
import { authorize } from 'koa-socket-passport'

module.exports = (app) => {

	app.io.use(authorize({
		passport: app.passport,
		key     : 'koa:sess',
		secret  : app.koa.keys,
		store   : app.sessionStore,
		success : onAuthorizeSuccess,
		fail    : onAuthorizeFail,
	}));

}

function onAuthorizeSuccess(ksp){
    console.log('successful connection to socket.io: ', ksp);
}

function onAuthorizeFail(err, ksp){
    if(err) accept(new Error(err));
    console.log('failed connection to socket.io:', err);
    console.log('failed connection to socket.io:', ksp);
}
