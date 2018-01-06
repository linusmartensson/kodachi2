
module.exports = (app) => {
    app.sessionApi.register(async (ctx, state) => {
        
        //Pick out accessible lists.

        var lists = [];
        var roles = await app.userApi.getUserRoles(ctx);
        var activeEvent = (await app.userApi.getActiveEvent(ctx)).id;
        
        for(var t in app.lists){
            var rs = app.lists[t].starter_roles;
            var event_list = false;
            if(app.listApi.eventList(app.lists[t])){
                rs = app.listApi.getList(t+"."+activeEvent).starter_roles;
                event_list = true;
            }
            var skip = false;
            for(let v of rs){
                if(v.match(/^!/) != null && roles.includes(v.split("!")[1])){skip = true; break;};
            }
            if(skip) continue;
            for(let v of rs){
                if(roles.includes(v)){
                    var id = event_list?(t+"."+activeEvent):t;
                    lists.push({
                        id:id, 
                        list:id, 
                        title:"{list."+app.lists[t].list_name+".title}"
                    });
                    break;
                }
            }
        }

        await app.stringApi.translate(ctx, lists);
        state.lists = lists;
    });
};
