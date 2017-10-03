
import winston from 'winston'

module.exports = (app) => {

	app.clients = {};

    app.clientSessions = {};

	app.io.on('connection', async (ctx) => {
        try{
        var cid = (ctx.socket.client.id);
        var token = ctx.socket.handshake.query.token;

        var u = (await app.cypher("MATCH (s:Session)<-[:HAS_SESSION]-(u:User) WHERE s.id={id} AND NOT EXISTS(s.insecure) RETURN u", {id:token})).records;

        app.clientSessions[cid] = {};
        ctx.session = app.clientSessions[cid];

        if(u.length > 0){
            ctx.session.userId = u[0].id;
            ctx.session.localSession = token;
        } else {
            var s = (await app.cypher("MATCH (s:Session) WHERE s.id={id} RETURN s", {id:token})).records;
            if(s.length > 0){
                ctx.session.localSession = token;
            } else {
                delete app.clientSessions[cid];
                ctx.socket.disconnect();
                return;
            }
        }

        if(ctx.socket.handshake.secure == false){
            //If we created an insecure session, make it insecure.
            await app.cypher("MATCH (s:Session) WHERE s.id={id} SET s.insecure=true", {id:token});
        }


        ctx.session.uuid = app.uuid();

		winston.info("Connected", ctx.session.uuid);
		if(!app.clients[token]) app.clients[token] = {};
		app.clients[token][ctx.session.uuid] = ctx;

        ctx.session.state = await app.sessionApi.buildSession(ctx);

        app.clientSessions[cid] = ctx.session;
        ctx.socket.emit('state', ctx.session.state);
        } catch(e) {console.dir(e);}
	});

	app.io.on('disconnect', async ctx => {
        ctx.session = app.clientSessions[ctx.socket.socket.id];
		winston.info("Disconnected", ctx.session.uuid);
		delete app.clients[ctx.session.localSession][ctx.session.uuid];

        if(!app.clients[ctx.session.localSession]){
            await app.cypher('MATCH (s:Session) WHERE EXISTS(s.insecure) AND s.id={id} DETACH DELETE s', {id:ctx.session.localSession});
        }
        delete app.clientSessions[ctx.socket.socket.id];
	});

    return async (ctx, next) => {
        ctx.session = app.clientSessions[ctx.socket.client.id];
        await next();
        app.clientSessions[ctx.socket.client.id] = ctx.session;
    }

}
