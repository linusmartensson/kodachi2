
module.exports = (app) => {
    var api = {};

    if(!app.taskFilters) app.taskFilters = {};
    if(!app.tasks) app.tasks = {};

    //Delete all orphaned tasks (e.g. aborted registration)
    app.cypher('MATCH (t:Task) WHERE NOT (t)-[:HANDLED_BY]->() DELETE t');

    api.add_filter = (type, filterFunc) => {
        app.taskFilters[type] = filterFunc;
    }

    api.add_filter("button", (d)=>{return !!d;});
    api.add_filter("text", (d)=>{return ''+d;});
    api.add_filter("textbox", (d)=>{return ''+d;});
    api.add_filter("password", (d)=>{return ''+d;});
    api.add_filter("ssn", (d)=>{
        d = d.replace(/\D/g, '');
        if(d.length != 10){
            throw 'Invalid SSN';
        }
        return d;
    });
    api.add_filter("checkbox", (d)=>{return d;}); //TODO How2handle checkboxes??
    api.add_filter("hours", (d)=>{return d;}); //TODO How2handle hours??
    api.add_filter("dropdown", (d,q)=>{ //Index of values-list.
        if(~~d >= q.values.length) throw 'Invalid dropdown selection';
        return ~~d;
    });
    api.add_filter("number", (d)=>{return d.replace(/\D/g, '');});
    api.add_filter("amount", (d)=>{return d.replace(/\D/g, '');});


    api.filterResponse = (response, matches) => {
        var out = {};

        for(var v in matches) {
            if(!inputs[v].field) continue;
            out[inputs[v].field] = app.taskFilters[inputs[v].type](response[inputs[v].field], inputs[v]);
        }
        return out;
    }

    //Task creation api
    api.yesno = () => {
        return [{field:'yes', desc:'yes', type:'button'},{field:'no', desc:'no', type:'button'}];
    }
    api.okcancel = () => {
        return [{field:'ok', desc:'ok', type:'button'},{field:'cancel', desc:'cancel', type:'button'}];
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

    function uniqueTask(task){
        for(let i of task.inputs){
            if(i.unique) return true;
        }
        return false;
    }

    //DB update API
    async function updateAccessibleTaskInstance(ctx, task_id, data) {
        if(data){
            return (await app.cypher("MATCH (t:Task) WHERE t.id={target} RETURN t", {target:task_id})).records;
        } else {
            var t = (await app.cypher("MATCH (t:Task) WHERE t.id={target} SET t.data={data} RETURN t", {target:task_id, data:data})).records;

            //Find sessions
            var s = (await app.cypher("MATCH (t:Task)-[:HANDLED_BY]->()-[*0..2]-(s:Session) WHERE t.id={target} RETURN s", {target:task_id})).records;

            //Notify task update
            await app.sessionApi.notifySessions(s);
            return t;
        }
    }
    async function findTaskByType(ctx, type){
        var t = (await app.cypher("MATCH (t:Task)-[:HANDLED_BY]->()-[*0..2]-(s:Session) WHERE t.type={type} AND s.id={sessionId} RETURN t", {type:type, sessionId:ctx.session.localSession})).records;
        if(!t || t.length==0) return null;
        return t;
    }
    async function finishTask(task_id){
        var s = (await app.cypher("MATCH (t:Task)-[:HANDLED_BY]->()-[*0..2]-(s:Session) WHERE t.id={target} RETURN s", {target:inst.id})).records;

        //Find sessions
        await app.cypher("MATCH (t:Task) WHERE t.id={target} DETACH DELETE t", {target:task_id});

        //Notify task finish
        await app.sessionApi.notifySessions(s);
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
        if(task.handler_roles.length == 0){
            var user = await app.userApi.getUser(inst.origin);
            if(user){
                await addTaskToUser(inst);
            } else {
                await addTaskToSession(inst);
            }
        } else {
            await addTaskToRoles(inst, task.handler_roles);
        }

        //Find sessions
        var s = (await app.cypher("MATCH (t:Task)-[:HANDLED_BY]->()-[*0..2]-(s:Session) WHERE t.id={target} RETURN s", {target:inst.id})).records;

        var q = [];
        for(let m of s){
            q.push(m.get('s').properties.id);
        }

        //Notify task start
        await app.sessionApi.notifySessions(q);
    }
    //-----------------------------------

    //NOTE: Setting origin bypasses security. Do NOT set origin in user calls.
    api.start_task = async (ctx, task_name, start_data, origin) => {
        if(!app.tasks || !app.tasks[task_name]) return false; 
        console.dir("starting task!");

        var task = app.tasks[task_name];

        //This user/session/whatever already has a unique task for this type.
        if(uniqueTask(task)){
            if((await findTaskByType(ctx, task_name)) != null) return false;
        }

        if(!origin){
        
            //Check if user may start app.
            if(!task.starter_roles) return false; //Can't be started manually.
            if(!await app.userApi.hasAnyRole(app.userApi.userId(ctx), task.starter_roles)) return false;
        }

        if(!start_data) start_data = {};
        var inst = {task_name:task.task_name, id:app.uuid(), data:{start_data:start_data}, next_tasks:[], origin:origin||await app.userApi.userId(ctx)||await app.userApi.session(ctx), result:'WAIT_RESPONSE', response:{}}
        
        setupTask(ctx, inst, task);
        return true;
    }

    async function trickleTask(ctx, inst, child_inst){
        if(!inst.children) inst.children = {};
        
        if(child_inst)
            inst.children[child_inst.task_name] = child_inst;

        if(inst.children.length == inst.next_tasks.length){

            inst.finished_tasks = inst.next_tasks;
            inst.next_tasks = [];

            //Merge child data into instance
            for(n in inst.children){
                Object.assign(inst.data, inst.children[n].data);
            }
            
            //This layer is complete, so call the post handler.
            var result = app.tasks[inst.task_name].post_handler(inst);

            inst.result = result;

            await updateAccessibleTaskInstance(ctx, inst.id, inst);
                    
            switch(result){
                case 'OK':
                    break;
                case 'RETRY':
                    inst.children = {}; //Reset all sub-tasks.
                    inst.next_tasks = [];
                    return result;
                case 'FAIL':
                default:
                    inst.next_tasks = [];
                    finishTask(inst.id);
                    break;
            }

            //As long as we have results and parents, keep trickling.
            if(!inst.next_tasks){
                //We're only returning the top-level result in the api.
                if(inst.parent) trickleTask(ctx, inst.parent);
            } else {

                //Start new child tasks
                nextTask(ctx, inst, app.tasks[inst.task_name]);
            }

            return result;
        }
    }
    async function nextTask(ctx, inst, task){
    
        if(inst.next_tasks && inst.next_tasks.length > 0) {
            //Handle all child tasks.
            for(n in inst.next_tasks){
                var uuid = app.uuid();
                var tasktype = inst.next_tasks[n];
                if(typeof inst.next_tasks[n] == 'object'){
                    uuid = tasktype.uuid;
                    tasktype = tasktype.task;
                }
                var child_task = app.tasks[tasktype];
                var child_inst = {task_name:child_task.task_name, id:uuid, next_tasks:[], data:inst.data, parent:inst, origin:inst.origin, result:'WAIT_RESPONSE', response:{}};
                setupTask(ctx, child_inst, child_task);
            }
        
            return inst.result;
        } else {

            //Reached end of chain, so trickle the task handler upwards.
            return trickleTask(ctx, inst);
        }
    }

    api.respond_task = async (ctx, task_id, response) => {

        //Find the task instance.
        var inst = await updateAccessibleTaskInstance(ctx, task_id, null);
        if(!inst) return 'NO_TASK_ID';  //There is no matching task instance.

        //Find the task
        var task = app.tasks[inst.task_name];

        try{
            response = api.filterResponse(response, task.inputs);
        } catch (e) {
            return 'RETRY';
        }

        //Process the response
        inst.response = response;
        var result = await task.result_handler(inst, ctx);

        //Store the result
        inst.result = result;
        await updateAccessibletaskInstance(ctx, task_id, inst);

        switch(result){
            case 'OK': 
                result = await nextTask(ctx, inst, task);
                break;
            case 'RETRY':
                break;
            case 'FAIL':
            default:
                finishTask(task_id);
                return result;
        }
        

        return result;
    }

    app.taskApi = api;

	require('../tools/core').loader("tasks", app);
}
