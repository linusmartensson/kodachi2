
import winston from 'winston'

module.exports = (app) => {

	app.clients = {};


	app.io.on('connection', async (ctx) => {

        winston.info(ctx.handshake);
        var token = ctx.handshake.query.token;

        var u = await app.cypher("MATCH (s:Session)<-[:HAS_SESSION]-(u:User) WHERE s.id={id} AND NOT EXISTS(s.insecure) RETURN u", {id:token});

        if(u){
            ctx.session.userId = u.id;
            ctx.session.localSession = token;
        } else {
            var s = await app.cypher("MATCH (s:Session) WHERE s.id={id} RETURN s", {id:token});
            if(s){
                ctx.session.localSession = token;
            } else {
                ctx.close();
                return;
            }
        }

        if(ctx.handshake.secure == false){
            //If we created an insecure session, make it insecure.
            app.cypher("MATCH (s:Session) WHERE s.id={id} SET s.insecure=true", {id:token});
        }


        ctx.session.uuid = app.uuid();

		winston.info("Connected", ctx.session.uuid);
		if(!app.clients[token]) app.clients[token] = {};
		app.clients[token][ctx.session.uuid] = ctx;

        ctx.session.state = api.sessionApi.buildSession();

        ctx.socket.emit('state', ctx.session.state);
	});

	app.io.on('disconnect', ctx => {
		winston.info("Disconnected", ctx.session.uuid);
		delete app.clients[ctx.session.localSession][ctx.session.uuid];

        if(!app.clients[ctx.session.localSession]){
            app.cypher('MATCH (s:Session) WHERE EXISTS(s.insecure) AND s.id={id} DETACH DELETE s', {id:ctx.session.localSession});
        }
	});
}
