
var _ = require('lodash');

module.exports = (app) => {

    app.cypher('MATCH (s:Session) DETACH DELETE s'); //On server boot, delete all sessions.

    var patcher = require('jsondiffpatch').create({
        objectHash: (obj) => {
            return obj.id || obj._id;
        }
    });
    var api = {};

    //Core function for updating live clients.
    api.notifySessions = async (ss) => {
        try{
        for(var s of ss){
            if(app.clients[s]){
                for(var id in app.clients[s]){
                    var ctx = app.clients[s][id];
                    var current = await api.buildSession(ctx);
                    var patch = patcher.diff(ctx.session.state, current);
                    ctx.socket.emit('update', patch);
                    ctx.session.state = current;
                }
            }
        }
        }catch(e){
            console.dir(e);
        }
    }
        
    //Build a complete session state -> The data we send to the client.
    api.buildSession = async (ctx) => {//TODO
        try{
            //Pages
            //Tasks
            //Tools
            //State

            //Pick out accessible tasks.
            var tools = [];
            var roles = await app.userApi.getUserRoles(ctx);
            for(var t in app.tasks){
                var rs = app.tasks[t].starter_roles;
                for(let v of rs){
                    if(roles.includes(v)){
                        tools.push({id:t, task:t, title:'{task.'+app.tasks[t].task_name+'.title}'});
                        break;
                    }
                }
            }
            //----------------------

            var tasks = [];
            var s = (await app.cypher("MATCH (t:Task)-[:HANDLED_BY]->()-[*0..2]-(s:Session) WHERE s.id={id} RETURN t", {id:ctx.session.localSession})).records;

            for(let q of s){
                var task = JSON.parse(q.get('t').properties.data);
                delete task.data.private;
                task.type = _.cloneDeep(app.tasks[task.task_name]);
                task.description = '{|task.'+task.type.task_name+'.desc}';
                task.title = '{task.'+task.type.task_name+'.title.active}';
                for(var v of task.type.inputs) {
                    if(!v.field) continue;
                    v.desc = '{|input.'+v.field+'.desc}';
                    v.name = '{input.'+v.field+'.name}';

                    if(v.values){
                        for(var w of v.values) {
                            w = '{input.value.'+w+'}';
                        }
                    }
                }

                tasks.push(task);
            }

            var state = {
                tools,
                tasks,
                profile:{

                },
                books:[
                    {id:0, path:'my-test-book', title:'My test book', content:'{|my-test-book}'}
                ]
            }
            await app.stringApi.translate(ctx, state);
            for(var v of state.tasks){
               await app.stringApi.parseDeep(v.description, v.data); 
            }
        } catch (e) {
            console.dir(e);
        }
        return state;

    }

    app.sessionApi = api;
}
