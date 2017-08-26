

module.exports = (app) => {
    var api = {};

    api.create_achievement = (name, desc, image, value) => {
        if(!app.achievements) app.achievements = {};

        app.achievements[name] = {
            name:name,
            desc:desc,
            image:image,
            value:value
        }
    }

    api.give_achievement = (user_id, name) => {
    }


    app.achievementApi = api;
}
