//await app.cypher('CREATE (:Content {id:{id}, content:{content}, title:{title}, event:{event}, lang:{lang}})', inst.response);



module.exports = (app) => {

    app.listApi.create_list("activites", "list_articles", ["editor", "admin"], {}, 
    async (inst, ctx) => {

        //get pages
        var pages = await app.cypher("MATCH (w:Content) RETURN w");
        var content = [];

        //for teams
        for(var v in pages.records){


            var page = pages.records[v].get("w").properties;
            page.name = page.title;
            page.access = [];

            var access = await app.cypher("MATCH (w:Content {id:{id}})<-[:HAS_ACCESS]-(r:Role) RETURN r", {id:page.id});
            for(var w in access.records){
                page.access.push(access.records[w].get("r").properties.type);
            }
            page.edit = true;

            var r = {tiers:[{
                id:0, panels:[
                    {id:0, content:[{id:0, type:"text", text:page.title}]},
                    {id:2, content:[{id:0, type:"editbutton", text:"Edit page", task:"create_page", data:page}]}
                ]
            }], id:content.length};

            content.push(r);
        }

        return {content:content, id:0};
    });
}
