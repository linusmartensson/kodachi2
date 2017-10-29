
var _ = require('lodash');

module.exports = (app) => {

    app.cypher('MATCH (s:Session) DETACH DELETE s'); //On server boot, delete all sessions.

    var patcher = require('jsondiffpatch').create({
        objectHash: (obj) => {
            return obj.id || obj._id;
        }
    });
    var api = {};
    app.sessionComponents = [];

    //Core function for registering session components.
    api.register = (f) => {
        app.sessionComponents.push(f);
    }

    //Core function for updating live clients.
    api.notifySessions = async (ss) => {
        try{
            for(var s of ss){
                if(app.clients[s]){
                    for(var id in app.clients[s]){
                        var ctx = app.clients[s][id];
                        var current = await api.buildSession(ctx);
                        var patch = patcher.diff(ctx.session.state, current);
                        ctx.socket.emit('update', patch);
                        ctx.session.state = current;
                    }
                }
            }
        }catch(e){
            console.dir(e);
        }
    }

    //Build a complete session state -> The data we send to the client.
    api.buildSession = async (ctx) => {
        var state = {};
        try{

            for(var v of app.sessionComponents){
                await v(ctx, state);
            }

        } catch (e) {
            console.dir(e);
        }
        return state;

    }

    app.sessionApi = api;

    require('../tools/core').loader("session", app);
}
