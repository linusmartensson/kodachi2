
const _ = require("lodash");
module.exports = async (app) => {
    const api = {};

    if (!app.taskFilters) {
        app.taskFilters = {};
    }
    if (!app.tasks) {
        app.tasks = {};
    }

    // Delete all orphaned tasks (e.g. aborted registration)
    app.cypher("MATCH (t:Task) WHERE NOT (t)-[:HANDLED_BY]->() DELETE t");

    api.add_filter = (type, filterFunc) => {
        app.taskFilters[type] = filterFunc;
    };
    function validateEmail (email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    api.add_filter("button", (d) => d === "true" || d === true);
    api.add_filter("text", (d) => `${d}`);
    api.add_filter("simpletext", (d) => {
        if (/^[a-zA-Z0-9-_]*$/.test(d)) {
            return d;
        }
        throw "Invalid Simpletext";
    });
    api.add_filter("phone", (d) => {
        if (/^[0-9-+ ]*$/.test(d)) {
            return d;
        }
        throw "Invalid phone number";
    });
    api.add_filter("select", (d) => {
        const v = JSON.parse(d);
        if (!Array.isArray(v)) {
            throw "Invalid select data";
        }
        return v;
    });
    api.add_filter("editor", (d) => `${d}`);
    api.add_filter("textbox", (d) => `${d}`);
    api.add_filter("password", (d) => `${d}`);
    api.add_filter("ssn", (d) => {
        if (d === "") {
            return "";
        }
        d = d.replace(/\D/g, "");
        if (d.length === 10) {
            if (d[0] === "0" || d[0] === "1") {
                d = `20${d}`;
            } else {
                d = `19${d}`;
            }
            return d;
        } else if (d.length === 12) {
            return d;
        }
        throw "Invalid SSN";
    });
    api.add_filter("email", (d) => {
        if (d === "") {
            return d;
        }
        if (!validateEmail(d)) {
            throw "Invalid Email";
        }
        return `${d}`;
    });
    api.add_filter("file", (d) => ({file: d.path, mimeType: d.mimeType}));
    api.add_filter("image", (d) => ({file: d.path, mimeType: d.mimeType}));
    api.add_filter("bool", (d) => d === "true" || d === true);
    api.add_filter("date", (d) => new Date(d).getTime());
    api.add_filter("time", (d) => new Date(d).getTime());
    api.add_filter("checkbox", (d) => d === "true" || d === true);
    api.add_filter("dropdown", (d, q) => { // Index of values-list.
        d = JSON.parse(d);
        if (q.values.length === 0) {
            return "";
        }
        if (!Array.isArray(d) || d.length < 1) {
            throw "Invalid dropdown selection";
        }
        d = d[0];
        if (~~d >= q.values.length) {
            throw "Invalid dropdown selection";
        }
        const v = q.values[~~d];
        return v;
    });
    api.add_filter("staticselect", (d, q) => { // Index of values-list.
        d = JSON.parse(d);
        if (!Array.isArray(d)) {
            throw "Invalid dropdown selection";
        }
        for (const v in d) {
            if (~~d[v] >= q.values.length) {
                throw "Invalid dropdown selection";
            }
            d[v] = q.values[~~d[v]];
        }
        return d;
    });
    api.add_filter("number", (d) => {
        return d.replace(/\D/g, "");
    });
    api.add_filter("amount", (d) => {
        return d.replace(/\D/g, "");
    });


    api.filterResponse = (response, inputs) => {
        const out = {};

        for (const v of inputs) {
            if (!v.field) {
                continue;
            }
            if(!Object.prototype.hasOwnProperty.call(response, v.field)) 
                continue;
            out[v.field] = app.taskFilters[v.type](response[v.field], v);
        }
        return out;
    };

    // Task creation api
    api.yesno = () => [{field: "no", type: "button"}, {field: "yes", type: "button"}];
    api.okcancel = () => [{field: "cancel", type: "button"}, {field: "ok", type: "button"}];
    api.step = (task_name, inputs, result_handler, post_handler) => {
        api.create_task("", task_name, [], [], inputs, result_handler, post_handler);
        return api.step;
    };
    api.create_task = (task_group, task_name, starter_roles, handler_roles, inputs, result_handler, post_handler) => {

        if (!post_handler) {
            post_handler = () => "OK";
        }

        for (const v in inputs) {
            if (!inputs[v].field) {
                continue;
            }
            if (!app.taskFilters[inputs[v].type]) {
                console.log(`Missing filter:${inputs[v].type}`);
                process.exit(1);
            }
        }

        app.tasks[task_name] = {
            task_group,
            task_name,
            starter_roles,
            handler_roles,
            inputs,
            result_handler,
            post_handler
        };
        return api.create_task;
    };
    // -----------------------------------

    api.uniqueTask = (task) => {
        if (!task) {
            return false;
        }
        for (const i of task.inputs) {
            if (i.unique) {
                return true;
            }
        }
        return false;
    };
    api.eventTask = (task) => {
        if (!task) {
            return false;
        }
        for (const i of task.inputs) {
            if (i.event_task) {
                return true;
            }
        }
        return false;
    };

    // This is a dangerous flag. It bypasses all security and input filters to provide raw input from an external api.
    api.externalTask = (task) => {
        if (!task) {
            return false;
        }
        for (const i of task.inputs) {
            if (i.external) {
                return true;
            }
        }
        return false;
    };

    api.emptyFields = (inst) => {
        const task = api.getTask(inst.task_name);

        for (const v of task.inputs) {
            if (v.field && !(v.type === "bool") && !(v.type === "checkbox") && !v.nocheck && (!Object.prototype.hasOwnProperty.call(inst.response, v.field) || inst.response[v.field] === "")) {
                inst.error = "{task.error.emptyFields}";
                return true;
            }
        }
        return false;
    };

    async function findTaskByType (ctx, type) {
        const t = (await app.cypher("MATCH (t:Task {type:{type}}), (s:Session {id:{sessionId}}) WHERE (t)-[:HANDLED_BY]->(s) OR (t)-[:HANDLED_BY]->(:User)-[:HAS_SESSION]->(s) OR (t)-[:HANDLED_BY]->(:Role)<-[:HAS_ROLE]-(:User)-[:HAS_SESSION]->(s) RETURN t", {type, sessionId: ctx.session.localSession})).records;
        if (!t || t.length === 0) {
            return null;
        }
        return t;
    }

    // DB update API
    async function updateTaskInstance (task_id, data = null) {
        let v = null;
        if (data === null) {
            v = (await app.cypher("MATCH (t:Task) WHERE t.id={target} RETURN t", {target: task_id})).records;
        } else {
            const d = JSON.stringify(data);
            v = (await app.cypher("MATCH (t:Task) WHERE t.id={target} SET t.data={data} RETURN t", {target: task_id, data: d})).records;
        }
        if (v.length > 0) {
            return JSON.parse(v[0].get("t").properties.data);
        }
        return null;
    }
    async function notifyTask (task_id) {
        const s = (await app.cypher("MATCH (t:Task {id:{target}}), (s:Session) WHERE (t)-[:HANDLED_BY]->(s) OR (t)-[:HANDLED_BY]->(:User)-[:HAS_SESSION]->(s) OR (t)-[:HANDLED_BY]->(:Role)<-[:HAS_ROLE]-(:User)-[:HAS_SESSION]->(s) RETURN s", {target: task_id})).records;

        const q = [];
        for (const m of s) {
            q.push(m.get("s").properties.id);
        }

        // Notify task update
        await app.sessionApi.notifySessions(q, {taskChanged:task_id});
    }
    async function secureTask (ctx, task_id, inst) {
        const task = api.getTask(inst.task_name);

        if (api.externalTask(task)) {
            return true;
        }

        const s = (await app.cypher("MATCH (t:Task {id:{target}}), (s:Session {id:{sessionId}}) WHERE (t)-[:HANDLED_BY]->(s) OR (t)-[:HANDLED_BY]->(:User)-[:HAS_SESSION]->(s) OR (t)-[:HANDLED_BY]->(:Role)<-[:HAS_ROLE]-(:User)-[:HAS_SESSION]->(s) RETURN s", {target: task_id, sessionId: ctx.session.localSession})).records;
        if (!s || s.length === 0) {
            return false;
        }
        return true;
    }
    async function finishTask (task_id) {
        // Find sessions
        const s = (await app.cypher("MATCH (t:Task {id:{target}}), (s:Session) WHERE (t)-[:HANDLED_BY]->(s) OR (t)-[:HANDLED_BY]->(:User)-[:HAS_SESSION]->(s) OR (t)-[:HANDLED_BY]->(:Role)<-[:HAS_ROLE]-(:User)-[:HAS_SESSION]->(s) RETURN s", {target: task_id})).records;

        const q = [];
        for (const m of s) {
            q.push(m.get("s").properties.id);
        }

        // Delete finished task
        await app.cypher("MATCH (t:Task) WHERE t.id={target} DETACH DELETE t", {target: task_id});

        // Notify task finish
        await app.sessionApi.notifySessions(q, {taskChanged:task_id});
    }
    async function finishChildren (inst) {
        if (inst.childIds) {
            for (const v of inst.childIds) {
                const q = await updateTaskInstance(v);
                if (q) {
                    await finishChildren(q);
                    await finishTask(q.id);
                }
            }
        }
    }
    async function addTaskToUser (task) {
        await app.cypher("MATCH (u:User) WHERE u.id={target} CREATE (t:Task {id:{id}, data:{data}, type:{type}})-[:HANDLED_BY]->(u)", {target: task.origin, id: task.id, data: JSON.stringify(task), type: task.task_name});
    }
    async function addTaskToSession (task) {
        await app.cypher("MATCH (s:Session) WHERE s.id={target} CREATE (t:Task {id:{id}, data:{data}, type:{type}})-[:HANDLED_BY]->(s)", {target: task.origin, id: task.id, data: JSON.stringify(task), type: task.task_name});
    }
    async function addTaskToRoles (task, roles) {
        await app.cypher("CREATE (t:Task {id:{id}, data:{data}, type:{type}})", {id: task.id, data: JSON.stringify(task), type: task.task_name});

        for (const v in roles) {
            await app.roleApi.create_role(roles[v]);
            await app.cypher("MATCH (r:Role {type:{role}}), (t:Task {id:{id}}) CREATE (t)-[:HANDLED_BY]->(r)", {role: roles[v], id: task.id});
        }
        for (const role of roles) {
            await app.roleApi.emailMembers(role);
        }
    }
    async function setupTask (ctx, inst, task) {
        let onSession = false;
        for (const v of task.inputs) {
            if (v.onSession) {
                onSession = v.onSession;
            }
        }
        if (task.handler_roles.length === 0 && (!inst.handler_roles || inst.handler_roles.length === 0)) {
            const user = await app.userApi.getUser(inst.origin);
            if (!onSession && user) {
                await addTaskToUser(inst);
            } else {
                await addTaskToSession(inst);
            }
        } else {
            await addTaskToRoles(inst, inst.handler_roles ? inst.handler_roles : task.handler_roles);
        }

        await notifyTask(inst.id);
    }
    // -----------------------------------

    api.getTask = (task_name) => {
        let task = app.tasks[task_name] ? _.cloneDeep(app.tasks[task_name]) : false;

        if (!task) {
            // Retrieving task for event:
            const split = task_name.split(".");
            task = app.tasks[split[0]] ? _.cloneDeep(app.tasks[split[0]]) : false;

            // No task exists
            if (!task || !api.eventTask(task)) {
                return false;
            }

            // Mark target event
            if (!task.start_data) {
                task.start_data = {};
            }
            task.start_data.event_id = split[1];
            task.start_data.event_task_name = split[0];
            for (const v in task.starter_roles) {
                if (!(/\.$/).test(task.starter_roles[v])) {
                    continue;
                }
                task.starter_roles[v] += split[1];
            }
            for (const v in task.handler_roles) {
                if (!(/\.$/).test(task.handler_roles[v])) {
                    continue;
                }
                task.handler_roles[v] += split[1];
            }
        }
        return task;

    };

    // NOTE: Setting origin bypasses security. Do NOT set origin in user calls.
    api.start_task = async (ctx, task_name, start_data, origin) => {
        if (!app.tasks) {
            return false;
        }

        const task = api.getTask(task_name);
        if (!task) {
            return false;
        }

        // This user/session/whatever already has a unique task for this type.
        if (api.uniqueTask(task)) {
            if ((await findTaskByType(ctx, task_name)) !== null) {
                return false;
            }
        }

        if (!origin) {

            // Check if user may start app.
            if (!task.starter_roles) {
                return false;
            } // Can't be started manually.
            if (!await app.userApi.hasAnyRole(await app.userApi.userId(ctx), task.starter_roles)) {
                return false;
            }
        }

        if (!start_data) {
            start_data = {};
        }
        if (task.start_data) {
            Object.assign(start_data, task.start_data);
        }
        if (!origin) {
            let onSession = false;
            for (const v of task.inputs) {
                if (v.onSession) {
                    onSession = v.onSession;
                }
            }
            const user = await app.userApi.userId(ctx);
            if (onSession || !user) {
                origin = await app.userApi.session(ctx);
            } else {
                origin = user;
            }
        }
        const inst = {task_name: task.task_name, id: app.uuid(), data: {private: {}, start_data}, next_tasks: [], origin, result: "WAIT_RESPONSE", response: {}};

        setupTask(ctx, inst, task);
        return true;
    };

    async function trickleTask (ctx, inst, child_inst) {
        if (!inst) {
            return "FAIL";
        }
        if (!inst.children) {
            inst.children = {};
        }

        if (child_inst) {
            inst.children[child_inst.task_name] = child_inst;
        }

        if (Object.keys(inst.children).length === inst.next_tasks.length) {

            inst.finished_tasks = inst.next_tasks;
            inst.next_tasks = [];

            // This layer is complete, so call the post handler.
            const result = await app.tasks[inst.task_name].post_handler(inst);

            inst.result = result;

            await updateTaskInstance(inst.id, inst);

            switch (result) {
            case "OK":
                break;
            case "RETRY":
                await finishChildren(inst);
                inst.children = {}; // Reset all sub-tasks.
                inst.next_tasks = [];
                inst.result = "WAIT_RESPONSE";
                await updateTaskInstance(inst.id, inst);
                notifyTask(inst.id);
                return result;
            case "FAIL":
            default:
                inst.next_tasks = [];
                break;
            }

            // As long as we have results and parents, keep trickling.
            if (!inst.next_tasks || inst.next_tasks.length === 0) {
                await finishTask(inst.id);


                // We're only returning the top-level result in the api.
                if (inst.parent) {
                    await trickleTask(ctx, await updateTaskInstance(inst.parent), inst);
                }


            } else {

                // Start new child tasks
                await nextTask(ctx, inst, app.tasks[inst.task_name]);
            }

            return result;
        }
        await updateTaskInstance(inst.id, inst);
        notifyTask(inst.id);
        return "OK";

    }
    async function nextTask (ctx, inst, task) {
        if (inst.next_tasks && inst.next_tasks.length > 0) {
            // Handle all child tasks.
            inst.childIds = [];
            const cinsts = [];
            for (let n = 0; n < inst.next_tasks.length; ++n) {
                let uuid = app.uuid();
                let tasktype = inst.next_tasks[n];
                if (typeof inst.next_tasks[n] === "object") {
                    uuid = tasktype.uuid || uuid;
                    tasktype = tasktype.task;
                }
                let child_task = api.getTask(tasktype);
                if (api.eventTask(child_task)) {
                    child_task = api.getTask(`${tasktype}.${inst.data.start_data.event_id}`);
                }
                const child_inst = {task_name: child_task.task_name, id: uuid, next_tasks: [], data: inst.data, parent: inst.id, origin: inst.origin, result: "WAIT_RESPONSE", response: {}};
                if (typeof inst.next_tasks[n] === "object") {
                    if (inst.next_tasks[n].handlers) {
                        child_inst.handler_roles = inst.next_tasks[n].handlers;
                    }
                }

                inst.childIds.push(uuid);
                cinsts.push({child_inst, child_task});
            }
            await updateTaskInstance(inst.id, inst);
            for (const v of cinsts) {
                await setupTask(ctx, v.child_inst, v.child_task);
            }
            notifyTask(inst.id);
            return inst.result;
        }
        // Reached end of chain, so trickle the task handler upwards.
        return await trickleTask(ctx, inst);

    }

    api.respond_task = async (ctx, task_id, response) => {

        console.log(`respond_task(${task_id})`);

        const inst = await updateTaskInstance(task_id);

        if (!inst || inst.result !== "WAIT_RESPONSE" || !await secureTask(ctx, task_id, inst)) {
            return "NO_TASK_ID";
        } // There is no matching task instance.
        inst.error = "no error message :(";
        console.log(`Found ${task_id}. Processing response!`);

        await updateTaskInstance(task_id, inst);

        // Find the task
        const task = api.getTask(inst.task_name);

        try {
            for (const v of task.inputs) {
                if (v.prepare) {
                    await v.prepare(v, ctx, inst);
                }
            }
            if (!api.externalTask(task)) {
                response = api.filterResponse(response, task.inputs);
            }
        } catch (e) {
            console.dir(e);
            inst.error = "{task.error.filterFailure}";
            inst.result = "WAIT_RESPONSE";
            await updateTaskInstance(task_id, inst);
            console.log(`Task processing error: ${inst.error}`);
            return "RETRY";
        }

        // Process the response
        inst.response = response;
        let result = null;
        
        //Default handlers to avoid common task pitfalls
        if(inst.response.cancel) result = 'OK';
        else if(app.taskApi.emptyFields(inst)) result = 'RETRY';
        else result = await task.result_handler(inst, ctx);

        delete inst.response;

        // Store the result
        inst.result = result;
        await updateTaskInstance(task_id, inst);

        switch (result) {
        case "OK":
            result = await nextTask(ctx, inst, task);
            return result;
        case "RETRY":
            inst.result = "WAIT_RESPONSE";
            await updateTaskInstance(task_id, inst);
            notifyTask(task_id);
            return app.stringApi.parse(inst.error, await app.userApi.getLanguage(ctx));
        case "FAIL":
        default:
            inst.next_tasks = [];
            await nextTask(ctx, inst, task);
            return app.stringApi.parse(inst.error, await app.userApi.getLanguage(ctx));
        }

    };

    app.taskApi = api;

    await (require("../tools/core").loader("tasks", app));

    const q = app.tasks;
    for (const v in q) {
        for (const w of q[v].inputs) {
            if (!w.field) {
                continue;
            }
            const a = `input.${w.field}.desc`;
            const b = `input.${w.field}.name`;
            if (app.stringApi.get_string(a, "sv") === null) {
                // cry
            }
            if (app.stringApi.get_string(b, "sv") === null) {
                // cry
            }

        }
        const a = `task.${q[v].task_name}.desc`;
        const b = `task.${q[v].task_name}.title`;
        const c = `task.${q[v].task_name}.title.active`;
        if (app.stringApi.get_string(a, "sv") === null) {
            // cry
        }
        if (app.stringApi.get_string(b, "sv") === null) {
            // cry
        }
        if (app.stringApi.get_string(c, "sv") === null) {
            // cry
        }
    }
};
