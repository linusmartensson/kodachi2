
const _ = require("lodash");

module.exports = async (app) => {

    // app.cypher('MATCH (s:Session) DETACH DELETE s'); //On server boot, delete all sessions.

    const patcher = require("jsondiffpatch").create({
        objectHash: (obj) => obj.id
    });
    const api = {};
    app.sessionComponents = [];

    // Core function for registering session components.
    api.register = (f) => {
        app.sessionComponents.push(f);
    };

    // Core function for updating live clients.
    api.notifySessions = async (ss) => {
        try {
            for (const s of ss) {
                if (app.clients[s]) {
                    for (const id in app.clients[s]) {
                        const ctx = app.clients[s][id];
                        const current = await api.buildSession(ctx);
                        const patch = patcher.diff(ctx.session.state, current);
                        ctx.socket.emit("update", patch);
                        ctx.session.state = current;
                    }
                }
            }
        } catch (e) {
            console.dir(e);
        }
    };

    // Build a complete session state -> The data we send to the client.
    api.buildSession = async (ctx) => {
        const state = {};
        try {

            for (const v of app.sessionComponents) {
                await v(ctx, state);
            }

        } catch (e) {
            console.dir(e);
        }
        return state;

    };

    app.sessionApi = api;

    await require("../tools/core").loader("session", app);
};
