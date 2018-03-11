
const _ = require("lodash");
const scheduler = require("node-schedule");

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


    scheduler.scheduleJob("0 0 2 * * *", () => {
        app.cypher("MATCH (s:Session) DETACH DELETE s;"); //Everyone's session is destroyed at 2am to allow for session cleanup. Note timezone diff between sweden & server will result in 4am in sweden.
    });


    // Core function for updating live clients.
    api.notifySessions = async (ss, aux) => {
        try {
            for (const s of ss) {
                if (app.clients[s]) {
                    for (const id in app.clients[s]) {
                        const ctx = app.clients[s][id];
                        const current = await api.buildSession(ctx, aux);
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
    api.buildSession = async (ctx, aux) => {
        const state = {};
        try {

            for (const v of app.sessionComponents) {
                await v(ctx, state, aux);
            }

        } catch (e) {
            console.dir(e);
        }
        return state;

    };

    app.sessionApi = api;

    await require("../tools/core").loader("session", app);
};
