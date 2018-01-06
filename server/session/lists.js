
module.exports = (app) => {
    app.sessionApi.register(async (ctx, state) => {

        // Pick out accessible lists.

        const lists = [];
        const roles = await app.userApi.getUserRoles(ctx);
        const activeEvent = (await app.userApi.getActiveEvent(ctx)).id;

        for (const t in app.lists) {
            let rs = app.lists[t].starter_roles;
            let event_list = false;
            if (app.listApi.eventList(app.lists[t])) {
                rs = app.listApi.getList(`${t}.${activeEvent}`).starter_roles;
                event_list = true;
            }
            let skip = false;
            for (const v of rs) {
                if (v.match(/^!/) !== null && roles.includes(v.split("!")[1])) {
                    skip = true;
                    break;
                }
            }
            if (skip) {
                continue;
            }
            for (const v of rs) {
                if (roles.includes(v)) {
                    const id = event_list ? (`${t}.${activeEvent}`) : t;
                    lists.push({
                        id,
                        list: id,
                        title: `{list.${app.lists[t].list_name}.title}`
                    });
                    break;
                }
            }
        }

        await app.stringApi.translate(ctx, lists);
        state.lists = lists;
    });
};
