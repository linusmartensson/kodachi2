
var _ = require('lodash');
module.exports = async (app) => {
    var api = {};
    if(!app.lists) app.lists = {};

    api.create_list = (list_group, list_name, starter_roles, options, result_handler) => {
        app.lists[list_name] = {list_group, list_name, starter_roles, options, result_handler}
        return api.create_list;
    }
    //-----------------------------------

    api.eventList = (list) => {
        if(!list) return false;
        return !!list.options.event_list;
    }
    api.getList = (list_name) => {
        var list = app.lists[list_name]?_.cloneDeep(app.lists[list_name]):false;
        
        if(!list){
            //Retrieving list for event:
            var split = list_name.split('.');
            list = app.lists[split[0]]?_.cloneDeep(app.lists[split[0]]):false;

            //No list exists
            if(!list || !api.eventList(list)) return false;

            //Mark target event
            if(!list.start_data) list.start_data = {};
            list.start_data.event_id = split[1];
            list.start_data.event_list_name = split[0];
            for(var v in list.starter_roles){
                if(!/\.$/.test(list.starter_roles[v])) continue;
                list.starter_roles[v] = list.starter_roles[v]+split[1];
            }
        }
        return list;

    }

    api.fetch_list = async (ctx, list_name, start_data) => {
        if(!app.lists) return false; 

        var list = api.getList(list_name);
        if(!list) return false;

        if(!list.starter_roles) return false; //Can't be started.
        if(!await app.userApi.hasAnyRole(await app.userApi.userId(ctx), list.starter_roles)) return false;

        if(!start_data) start_data = {};
        if(list.start_data) Object.assign(start_data, list.start_data);
        var user = await app.userApi.userId(ctx);

        var inst = {list, start_data:start_data}
        
        return list.result_handler(inst, ctx);
    }

    app.listApi = api;

	await (require('../tools/core').loader("lists", app));
    var q = app.lists;
    for(var v in q){
        var b = "list."+q[v].list_name+".title";
        if(app.stringApi.get_string(b,"sv") == undefined){
                    console.log("s('"+b+"', '')"); 
        }
    }
}
