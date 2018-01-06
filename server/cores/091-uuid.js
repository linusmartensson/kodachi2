
const u = require("uuid/v4");

module.exports = (app) => {

    app.uuid = () => u();

};
