

module.exports = (app) => {
    var api = {};

    api.create_string = (name, string) => {
        app.strings[name] = string;
    }

    api.get_string = (name, lang) => {
        return app.strings[name][lang];
    }


    app.stringApi = api;
}
