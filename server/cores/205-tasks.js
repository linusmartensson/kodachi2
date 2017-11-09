
var _ = require('lodash');
module.exports = (app) => {
    var api = {};

    if(!app.taskFilters) app.taskFilters = {};
    if(!app.tasks) app.tasks = {};

    //Delete all orphaned tasks (e.g. aborted registration)
    app.cypher('MATCH (t:Task) WHERE NOT (t)-[:HANDLED_BY]->() DELETE t');

    api.add_filter = (type, filterFunc) => {
        app.taskFilters[type] = filterFunc;
    }
    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    api.add_filter("button", (d)=>{
        return d=='true';});
    api.add_filter("text", (d)=>{return ''+d;});
    api.add_filter("simpletext", (d)=>{
        if(/^[a-zA-Z0-9-_]+$/.test(d)) return d;
        throw 'Invalid Simpletext';
    });
    api.add_filter("select", (d)=>{
        var v = JSON.parse(d);
        if(!Array.isArray(v)) throw 'Invalid select data';
        return v;
    });
    api.add_filter("editor", (d)=>{
        return ''+d;
    });
    api.add_filter("textbox", (d)=>{return ''+d;});
    api.add_filter("password", (d)=>{return ''+d;});
    api.add_filter("ssn", (d)=>{
        if(!d || d=='') return '';
        d = d.replace(/\D/g, '');
        if(d.length == 10){
            if(d[0] == '0' || d[0] == '1') d = "20"+d;
            else d = "19" + d;
            return d;
        } else if(d.length == 12)
            return d;
        throw 'Invalid SSN';
    });
    api.add_filter("email", (d)=>{
        if(!validateEmail(d)) throw 'Invalid Email';
        return ''+d;
    });
    api.add_filter("bool", (d)=>{
        return !!d;
    });
    api.add_filter("date", (d)=>{
        return new Date(d).getTime();
    });
    api.add_filter("time", (d)=>{
        return new Date(d).getTime();
    });
    api.add_filter("checkbox", (d)=>{return d;}); //TODO How2handle checkboxes??
    api.add_filter("hours", (d)=>{return d;}); //TODO How2handle hours??
    api.add_filter("dropdown", (d,q)=>{ //Index of values-list.
        if(~~d >= q.values.length) throw 'Invalid dropdown selection';
        return ~~d;
    });
    api.add_filter("number", (d)=>{return d.replace(/\D/g, '');});
    api.add_filter("amount", (d)=>{return d.replace(/\D/g, '');});


    api.filterResponse = (response, inputs) => {
        var out = {};

        for(var v of inputs) {
            if(!v.field) continue;
            out[v.field] = app.taskFilters[v.type](response[v.field], v);
        }
        return out;
    }

    //Task creation api
    api.yesno = () => {
        return [{field:'no', type:'button'},{field:'yes', type:'button'}];
    }
    api.okcancel = () => {
        return [{field:'cancel', type:'button'},{field:'ok', type:'button'}];
    }
    api.step = (task_name, inputs, result_handler, post_handler) => {
        api.create_task("", task_name, [], [], inputs, result_handler, post_handler);
        return api.step;
    }
    api.create_task = (task_group, task_name, starter_roles, handler_roles, inputs, result_handler, post_handler) => {

        if(!post_handler) post_handler = ()=>{return 'OK'};

        for(var v in inputs){
            if(!inputs[v].field) continue;
            if(!app.taskFilters[inputs[v].type]){
                console.log("Missing filter:"+inputs[v].type);
                process.exit(1);
            }
        }

        app.tasks[task_name] = {
            task_group:task_group,
            task_name:task_name,
            starter_roles:starter_roles,
            handler_roles:handler_roles,
            inputs:inputs,
            result_handler:result_handler,
            post_handler:post_handler
        }
        return api.create_task;
    }
    //-----------------------------------

    api.uniqueTask = (task) => {
        if(!task) return false;
        for(let i of task.inputs){
            if(i.unique) return true;
        }
        return false;
    }
    api.eventTask = (task) => {
        if(!task) return false;
        for(let i of task.inputs) {
            if(i.event_task) return true;
        }
        return false;
    }

    async function findTaskByType(ctx, type){
        var t = (await app.cypher("MATCH (t:Task)-[:HANDLED_BY]->()-[*0..2]-(s:Session) WHERE t.type={type} AND s.id={sessionId} RETURN t", {type:type, sessionId:ctx.session.localSession})).records;
        if(!t || t.length==0) return null;
        return t;
    }

    //DB update API
    async function updateTaskInstance(task_id, data) {
        var v;
        if(!data){
            v = (await app.cypher("MATCH (t:Task) WHERE t.id={target} RETURN t", {target:task_id})).records;
        } else {
            var d = JSON.stringify(data);
            v = (await app.cypher("MATCH (t:Task) WHERE t.id={target} SET t.data={data} RETURN t", {target:task_id, data:d})).records;
        }
        if(v.length > 0) return JSON.parse(v[0].get('t').properties.data);
        return undefined;
    }
    async function notifyTask(task_id){
        var s = (await app.cypher("MATCH (t:Task)-[:HANDLED_BY]->()-[*0..2]-(s:Session) WHERE t.id={target} RETURN s", {target:task_id})).records;

        var q = [];
        for(let m of s){
            q.push(m.get('s').properties.id);
        }

        //Notify task update
        await app.sessionApi.notifySessions(q);
    }
    async function secureTask(ctx, task_id){
        var s = (await app.cypher("MATCH (t:Task)-[:HANDLED_BY]->()-[*0..2]-(s:Session) WHERE t.id={target} AND s.id={sessionId} RETURN s", {target:task_id, sessionId:ctx.session.localSession})).records;
        if(!s || s.length==0) return false;
        return true;
    }
    async function finishTask(task_id){
        //Find sessions
        var s = (await app.cypher("MATCH (t:Task)-[:HANDLED_BY]->()-[*0..2]-(s:Session) WHERE t.id={target} RETURN s", {target:task_id})).records;
        
        var q = [];
        for(let m of s){
            q.push(m.get('s').properties.id);
        }

        //Delete finished task
        await app.cypher("MATCH (t:Task) WHERE t.id={target} DETACH DELETE t", {target:task_id});

        //Notify task finish
        await app.sessionApi.notifySessions(q);
    }
    async function finishChildren(inst){
        for(var v of inst.childIds){
            var q = await updateTaskInstance(v);
            await finishChildren(q);
            await finishTask(q.id);
        }
    }
    async function addTaskToUser(task){
        await app.cypher("MATCH (u:User) WHERE u.id={target} CREATE (t:Task {id:{id}, data:{data}, type:{type}})-[:HANDLED_BY]->(u)", {target:task.origin, id:task.id, data:JSON.stringify(task), type:task.task_name});
    }
    async function addTaskToSession(task){
        await app.cypher("MATCH (s:Session) WHERE s.id={target} CREATE (t:Task {id:{id}, data:{data}, type:{type}})-[:HANDLED_BY]->(s)", {target:task.origin, id:task.id, data:JSON.stringify(task), type:task.task_name});
    }
    async function addTaskToRoles(task, roles){
        await app.cypher("MATCH (r:Role) WHRE r.name IN {targets} CREATE (t:Task {id:{id}, data:{data}, type:{type}})-[:HANDLED_BY]->(r)", {targets:roles, id:task.id, data:JSON.stringify(task), type:task.task_name});
    }
    async function setupTask(ctx, inst, task) {
        var onSession = false;
        for(var v of task.inputs){
            if(v.onSession){
                onSession = v.onSession;
            }
        }
        if(task.handler_roles.length == 0){
            var user = await app.userApi.getUser(inst.origin);
            if(!onSession && user){
                await addTaskToUser(inst);
            } else {
                await addTaskToSession(inst);
            }
        } else {
            await addTaskToRoles(inst, task.handler_roles);
        }

        await notifyTask(inst.id);
    }
    //-----------------------------------
    
    api.getTask = (task_name) => {
        var task = app.tasks[task_name]?_.cloneDeep(app.tasks[task_name]):false;
        
        if(!task){
            //Retrieving task for event:
            var split = task_name.split('.');
            task = app.tasks[split[0]]?_.cloneDeep(app.tasks[split[0]]):false;

            //No task exists
            if(!task || !api.eventTask(task)) return false;

            //Mark target event
            if(!start_data) start_data = {};
            start_data.event_id = split[1];
            start_data.event_task_name = split[0];
            for(var v in task.starter_roles){
                task.starter_roles[v] = task.starter_roles[v]+'.'+split[1];
            }
            for(var v in task.handler_roles){
                task.handler_roles[v] = task.handler_roles[v]+'.'+split[1];
            }
        }
        return task;

    }

    //NOTE: Setting origin bypasses security. Do NOT set origin in user calls.
    api.start_task = async (ctx, task_name, start_data, origin) => {
        if(!app.tasks) return false; 

        var task = api.getTask(task_name);
        if(!task) return false;

        
        //This user/session/whatever already has a unique task for this type.
        if(api.uniqueTask(task)){
            if((await findTaskByType(ctx, task_name)) != null) return false;
        }

        if(!origin){
        
            //Check if user may start app.
            if(!task.starter_roles) return false; //Can't be started manually.
            if(!await app.userApi.hasAnyRole(await app.userApi.userId(ctx), task.starter_roles)) return false;
        }

        if(!start_data) start_data = {};
        if(!origin){
            var onSession = false;
            for(var v of task.inputs){
                if(v.onSession){
                    onSession = v.onSession;
                }
            }
            var user = await app.userApi.userId(ctx);
            if(onSession || !user){
                origin = await app.userApi.session(ctx);
            } else {
                origin = user;
            }
        }
        var inst = {task_name:task.task_name, id:app.uuid(), data:{start_data:start_data}, next_tasks:[], origin:origin, result:'WAIT_RESPONSE', response:{}}
        
        setupTask(ctx, inst, task);
        return true;
    }

    async function trickleTask(ctx, inst, child_inst){
        if(!inst.children) inst.children = {};
        
        if(child_inst)
            inst.children[child_inst.task_name] = child_inst;

        if(Object.keys(inst.children).length == inst.next_tasks.length){

            inst.finished_tasks = inst.next_tasks;
            inst.next_tasks = [];

            //This layer is complete, so call the post handler.
            var result = await app.tasks[inst.task_name].post_handler(inst);

            inst.result = result;

            await updateTaskInstance(inst.id, inst);

            switch(result){
                case 'OK':
                    break;
                case 'RETRY':
                    await finishChildren(inst);
                    inst.children = {}; //Reset all sub-tasks.
                    inst.next_tasks = [];
                    inst.result = 'WAIT_RESPONSE';
                    await updateTaskInstance(inst.id, inst);
                    notifyTask(inst.id);
                    return result;
                case 'FAIL':
                default:
                    inst.next_tasks = [];
                    break;
            }

            //As long as we have results and parents, keep trickling.
            if(!inst.next_tasks || inst.next_tasks.length == 0){
                await finishTask(inst.id);

                
                //We're only returning the top-level result in the api.
                if(inst.parent) await trickleTask(ctx, await updateTaskInstance(inst.parent), inst);


            } else {

                //Start new child tasks
                await nextTask(ctx, inst, app.tasks[inst.task_name]);
            }

            return result;
        } else {
            await updateTaskInstance(inst.id, inst);
            notifyTask(inst.id);
            return 'OK';
        }
    }
    async function nextTask(ctx, inst, task){
        if(inst.next_tasks && inst.next_tasks.length > 0) {
            //Handle all child tasks.
            inst.childIds = [];
            var cinsts = [];
            for(var n=0;n<inst.next_tasks.length;++n){
                var uuid = app.uuid();
                var tasktype = inst.next_tasks[n];
                if(typeof inst.next_tasks[n] == 'object'){
                    uuid = tasktype.uuid;
                    tasktype = tasktype.task;
                }
                var child_task = api.getTask(tasktype);
                var child_inst = {task_name:child_task.task_name, id:uuid, next_tasks:[], data:inst.data, parent:inst.id, origin:inst.origin, result:'WAIT_RESPONSE', response:{}};
                inst.childIds.push(uuid);
                cinsts.push({child_inst, child_task});
            }
            await updateTaskInstance(inst.id, inst);
            for(var v of cinsts){
                await setupTask(ctx, v.child_inst, v.child_task);
            }
            notifyTask(inst.id);
            return inst.result;
        } else {
            //Reached end of chain, so trickle the task handler upwards.
            return await trickleTask(ctx, inst);
        }
    }

    api.respond_task = async (ctx, task_id, response) => {

        console.log("respond_task("+task_id+")");

        var inst = await updateTaskInstance(task_id);

        if(!inst || inst.result != 'WAIT_RESPONSE' || !await secureTask(ctx, task_id)) return 'NO_TASK_ID';  //There is no matching task instance.
        console.log("Found "+task_id+". Processing response!");

        await updateTaskInstance(task_id, inst);
        
        //Find the task
        var task = api.getTask(inst.task_name);

        try{
            for(var v of task.inputs){
                if(v.prepare) await v.prepare(v, ctx);
            }
            response = api.filterResponse(response, task.inputs);
        } catch (e) {
            console.log("Task processing error:");
            console.dir(e);
            inst.error = "{tasks.filterFailure}";
            inst.result = 'WAIT_RESPONSE';
            await updateTaskInstance(task_id, inst)
            return 'RETRY';
        }

        //Process the response
        inst.response = response;
        var result = await task.result_handler(inst, ctx);
        delete inst.response;

        //Store the result
        inst.result = result;
        await updateTaskInstance(task_id, inst);

        switch(result){
            case 'OK': 
                result = await nextTask(ctx, inst, task);
                break;
            case 'RETRY':
                inst.result = 'WAIT_RESPONSE';
                await updateTaskInstance(task_id, inst);
                notifyTask(task_id);
                break;
            case 'FAIL':
            default:
                await finishTask(task_id);
                return result;
        }
        

        return result;
    }

    app.taskApi = api;

	require('../tools/core').loader("tasks", app);
}
