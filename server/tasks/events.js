
module.exports = async (app) => {

    app.taskApi.create_task('event', 'create_event',
        ['admin'],[],
        app.taskApi.okcancel().concat(
            {field:'event_name', type:'text'},
            {field:'tagline', type:'text'},
            {field:'event_description', type:'editor'},
            {field:'id', type:'simpletext'},
            {field:'starts', type:'date'},
            {field:'ends', type:'date'},   
            {field:'event_location', type:'text'},
            {field:'publish', type:'date'}
        ),
        async (inst, ctx) => {
            if(inst.response.cancel) return 'OK';

            await app.cypher('CREATE (:Event {name:{event_name}, tagline:{tagline}, description:{event_description}, id:{id}, starts:{starts}, ends:{ends}, location:{event_location}, publish:{publish}})', inst.response);

            return 'OK';
        }, (inst) => {
            return 'OK';
        });
    app.taskApi.create_task('event', 'add_event_manager', ['admin', 'admin.'], [], app.taskApi.okcancel().concat(
        {event_task:true},
        {field:'user', type:'select', prepare:async (v, ctx)=>{
            var u = await app.cypher('MATCH (u:User) RETURN u');
            v.values = [];
            for(var q of u.records){
                var w = q.get('u').properties;
                v.values.push(w.email);
            }
        }}, {field:'type', type:'dropdown', values:['admin', 'budget', 'schedule']}),
        async (inst, ctx) => {
            if(inst.response.cancel) return 'OK';

            var u = await app.userApi.findAccount({email:inst.response.user});
            if(!u) return 'RETRY';

            await app.roleApi.addRole(u.id, inst.response.type+'.'+inst.data.start_data.event_id, 10000);

            return 'OK';
        }, (inst) => {
            return 'OK';
        });
}
