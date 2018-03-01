
const _ = require("lodash");
module.exports = async (app) => {
    const api = {};
    if (!app.lists) {
        app.lists = {};
    }

    api.create_list = (list_group, list_name, starter_roles, options, result_handler) => {
        app.lists[list_name] = {list_group, list_name, starter_roles, options, result_handler};
        return list_name;
    };
    api.build_list = (list_group, list_name, starter_roles, query, outputs, map, options) => {
        api.create_list(list_group, list_name, starter_roles, options, async (inst, ctx) => {
            let filter = {};

            for(let k in map){
                let v = map[k];
                switch(typeof v){
                    case 'function':
                        filter[k] = await v(inst, ctx);
                        continue;
                    case 'string':
                        filter[k] = _.get({inst, ctx}, v);
                        continue;

                }
            }

            let q = app.mapCypher(await app.cypher(query, filter), outputs);
            //assume each entry in q is a row to be displayed.
            if(options.prepare){
                q = options.prepare(q);
            }

            let output = [];
            
            let header = await app.stringApi.userParse(ctx, `{|list.auto.header.${list_name}}`);

            let pos = 0;

            let prev = null;


            for(let k in q){
                let v = q[k];
                
                if(options.group_by){
                    let q = _.get(v, options.group_by);
                    if(q != prev){
                        prev = q;
                        let m = await app.stringApi.userParse(ctx, `{|list.auto.group.${list_name}}`, undefined, list_name+(pos++));
                        app.stringApi.parseDeep(m, v);
                        output = output.concat(m);       
                    }
                }

                let m = await app.stringApi.userParse(ctx, `{|list.auto.row.${list_name}}`, undefined, list_name+(pos++));
                

                //Add in targets
                app.stringApi.parseDeep(m, v);

                output = output.concat(m);
            }
            output = header.concat(output);

            await app.stringApi.translate(ctx, output);
            app.stringApi.parseDeep(output, filter);

            return {content:output, id:0};
        });
        return list_name;
    }
    api.join_lists = (list_group, list_name, starter_roles, lists) => {
        api.create_list(list_group, list_name, starter_roles, options, async (inst, ctx) => {
            var res = [];
            var ps = [];
            for(let v in lists){
                ps.push(api.fetch_list(ctx, lists[v], _.cloneDeep(inst.start_data)));
            }
            for(let v in ps){
                res.concat((await ps[v]).content);
            }
            
            return {content:res, id:0};
        });
        return list_name;
    }
    api.remap = (f) => {
        return async (inst, ctx) => {return await f(ctx);}
    }
    // -----------------------------------

    api.eventList = (list) => {
        if (!list) {
            return false;
        }
        return Boolean(list.options.event_list);
    };
    api.getList = (list_name) => {
        let list = app.lists[list_name] ? _.cloneDeep(app.lists[list_name]) : false;

        if (list === false) {
            // Retrieving list for event:
            const split = list_name.split(".");
            list = app.lists[split[0]] ? _.cloneDeep(app.lists[split[0]]) : false;

            // No list exists
            if (!list || !api.eventList(list)) {
                return false;
            }

            // Mark target event
            if (!list.start_data) {
                list.start_data = {};
            }
            list.start_data.event_id = split[1];
            list.start_data.event_list_name = split[0];
            for (const v in list.starter_roles) {
                if (!(/\.$/).test(list.starter_roles[v])) {
                    continue;
                }
                list.starter_roles[v] += split[1];
            }
        } else if (api.eventList(list)) {
            return false;
        }
        return list;
    };

    api.fetch_list = async (ctx, list_name, start_data) => {
        if (!app.lists) {
            return false;
        }

        const list = api.getList(list_name);
        if (!list) {
            return false;
        }

        if (!list.starter_roles) {
            return false;
        } // Can't be started.
        if (!await app.userApi.hasAnyRole(await app.userApi.userId(ctx), list.starter_roles)) {
            return false;
        }

        if (!start_data) {
            start_data = {};
        }
        if (list.start_data) {
            Object.assign(start_data, list.start_data);
        }
        const user = await app.userApi.userId(ctx);

        const inst = {list, start_data};

        return list.result_handler(inst, ctx);
    };

    app.listApi = api;

    await (require("../tools/core").loader("lists", app));
    const q = app.lists;
    for (const v in q) {
        const b = `list.${q[v].list_name}.title`;
        if (app.stringApi.get_string(b, "sv") === null) {
            console.log(`s('${b}', '')`);
        }
    }
};
