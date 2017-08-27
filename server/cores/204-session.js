

module.exports = (app) => {

    app.cypher('DETACH DELETE (s:Session)'); //On server boot, delete all sessions.

    var patcher = require('jsondiffpatch').create({
        objectHash: (obj) => {
            return obj.id || obj._id;
        }
    });
    var api = {};

    //Core function for updating live clients.
    api.notifySessions = (ss) => {
        for(var s of ss){
            if(clients[s.id]){
                for(var ctx of clients[s.id]){
                    var current = api.buildSession(ctx);
                    var patch = patcher.diff(ctx.session.state, current);
                    ctx.socket.emit('update', patch);
                    ctx.session.state = current;
                }
            }
        }
    }
        
    //Build a complete session state -> The data we send to the client.
    api.buildSession = (ctx) => {//TODO
        //Pages
        //Tasks
        //Tools
        //State
    }

    app.sessionApi = api;
}
