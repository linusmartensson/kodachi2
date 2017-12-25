

module.exports = (app) => {

    app.listApi.create_list("activites", "list_team", ['manager.', 'team_member.'], {event_list:true}, 
    async (inst, ctx) => {
        //List all member names
        //Hover-text for applications
        //Email button

        //get team memberships
        var teams = await app.cypher("MATCH (:User {id:{id}})-[:TEAM_MEMBER]-(w:WorkGroup)--(:Event {id:{event}}) RETURN w", {event:inst.start_data.event_id, id:await app.userApi.userId(ctx)});
        var content = [];

        //for teams
        for(var v in teams.records){

            var team = teams.records[v].get('w').properties;
            var members = await app.cypher("MATCH (w:WorkGroup {id:{id}})-[t:TEAM_MEMBER]-(u:User) RETURN t,u", {id:team.id});

            var teamdesc = {tiers:[{
                id:0, panels:[
                    {id:0, content:[{id:0, type:'text', text:team.name}]},
                    {id:1, content:[{id:0, type:'text', text:members.records.length+"/"+team.size}]},
                    {id:2, content:[{id:0, type:'editbutton', text:"Email team", task:'email_team', data:{team:team.id}}]}
                ]
            }], id:content.length};

            content.push(teamdesc);


            //list team
            var r = {tiers:[], id:content.length};
            console.dir(members);
            for(var w in members.records){
                var member = members.records[w];

                var t = member.get('t').properties;
                var u = member.get('u').properties;
                console.dir(t);
                console.dir(u);

                r.tiers.push({
                    id:r.tiers.length,
                    panels:[
                        {id:0, content:[{id:0, type:'text', hover:t.description, text:u.givenName+" \""+u.nickname+"\" "+u.lastName}]},
                        {id:1, content:[{id:0, type:'text', hover:t.description, text:u.email}]},
                    ]
                });
            }
            content.push(r);
        }

        return {content:content, id:0};
    });
}
