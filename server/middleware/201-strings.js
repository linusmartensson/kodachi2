

module.exports = (app) => {
    var api = {};

    app.create_string = (name, string) => {
        app.strings[name] = string;
    }

    app.get_string = (name, lang) => {
        return app.strings[name][lang];
    }


    app.stringApi = api;
}
