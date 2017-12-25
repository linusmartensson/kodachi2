
module.exports = async (app) => {

    await app.cypher('CREATE CONSTRAINT ON (c:Content) ASSERT c.id IS UNIQUE');

    app.taskApi.create_task('content', 'create_page', 
        ['editor', 'admin'], [],
        app.taskApi.okcancel().concat(
            {field:'title', type:'text'}, 
            {field:'id', type:'simpletext'}, 
            {field:'event', type:'bool'},
            {field:'lang', type:'dropdown', translate:true, values:['sv', 'eng', 'all']},
            {field:'access', type:'select', prepare:async (v, ctx)=>{
                var r = await app.cypher('MATCH (r:Role) RETURN r');
                v.values = [];
                for(var q of r.records){
                    var w = q.get('r').properties;
                    v.values.push(w.type);
                }
            }},
            {field:'content', type:'editor'} 
        ),
        async (inst, ctx) => {
            if(inst.response.cancel || inst.response.id=="") return 'OK'; 

            if(inst.response.event == true){
                inst.response.event = (await app.userApi.getActiveEvent(ctx)).id;
            }
            if(inst.data.start_data.edit){
                await app.cypher("MATCH (c:Content {id:{id}}) DETACH DELETE c", {id:inst.data.start_data.id});
            }
            await app.cypher('CREATE (:Content {id:{id}, content:{content}, title:{title}, event:{event}, lang:{lang}})', inst.response);
            for(var v of inst.response.access){
                await app.cypher('MATCH (c:Content {id:{id}}), (r:Role {type:{type}}) CREATE (r)-[:HAS_ACCESS]->(c)', {type:v, id:inst.response.id});
            }
            return 'OK';
        });

}
