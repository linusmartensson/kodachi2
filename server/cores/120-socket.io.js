import IO from "koa-socket-2";
import cookie from "cookie";
const tools = require("../tools/core");

module.exports = async (app) => {
    app.io = new IO();
    app.io.attach(app.koa, true, app.ssl);

    tools.loader("socketio-middleware", app);

    console.log("SocketIO loaded!");
};
