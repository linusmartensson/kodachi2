
module.exports = async (app) => {

    app.taskApi.create_task('event', 'create_event',
            ['admin'],[],
            app.taskApi.okcancel().concat(
                {field:'name', type:'text'},
                {field:'tagline', type:'text'},
                {field:'description', type:'editor'},
                {field:'id', type:'simpletext'},
                {field:'starts', type:'datetime'},
                {field:'ends', type:'datetime'},   
                {field:'location', type:'text'},
                {field:'publish', type:'datetime'}
            ),
            async (inst, ctx) => {
                if(inst.response.cancel) return 'OK';

                await app.cypher('CREATE (:Event {name:{name}, tagline:{tagline}, description:{description}, id:{id}, starts:{starts}, ends:{ends}, location:{location}, publish:{publish}})', inst.response);

                return 'OK';
            }, (inst) => {
                return 'OK';
            });
      
}
