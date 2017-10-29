
module.exports = app => {


    app.taskApi.create_task('content', 'create_page', 
        ['editor', 'admin'], [],
        app.taskApi.okcancel().concat(
            {field:'content', type:'editor'}, 
            {field:'title', type:'text'}, 
            {field:'id', type:'simpletext'}, 
            {field:'access', type:'select', prepare:async (v, ctx)=>{
                var r = await app.cypher('MATCH (r:Role) RETURN r');
                v.values = [];
                for(var v of r.records){
                    var w = v.get('r').properties;
                    v.values.push(w.type);
                }
            }}),
        async (inst) => {
            if(inst.response.cancel) return 'OK'; 

            await app.cypher('CREATE (:Content {id:{id}, content:{content}, title:{title}})', inst.response);
            for(var v of inst.response.access){
                await app.cypher('MATCH (c:Content {id:{id}}), (r:Role {type:{type}}) CREATE (r)-[:HAS_ACCESS]->(c)', {type:v, id:inst.response.id});
            }
        });

}
