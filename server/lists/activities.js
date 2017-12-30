

module.exports = (app) => {

    app.listApi.create_list("activites", "show_team", ['manager.', 'team_member.'], {event_list:true}, 
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
                        {id:2, content:[{id:0, type:'editbutton', text:"Email team", task:'email_team.'+inst.start_data.event_id, data:{team:team.id}}]}
                    ]
                }], id:content.length};

                content.push(teamdesc);


                //list team
                var r = {tiers:[], id:content.length};
                for(var w in members.records){
                    var member = members.records[w];

                    var t = member.get('t').properties;
                    var u = member.get('u').properties;

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


    app.listApi.create_list("activities", "show_activities", ['anonymous', 'user'], {event_list:true},
        async(inst, ctx) => {

            var teams = await app.cypher("MATCH (:Event {id:{event}})--(w:WorkGroup) RETURN w", {event:inst.start_data.event_id, type:""});
            var content=[];

            var lang = await app.userApi.getLanguage(ctx);

            //for teams
            for(var v in teams.records){

                var team = teams.records[v].get('w').properties;
                //              name
                //              schedule
                //open
                //uniform
                //image
                //size
                //id
                //budget
                //              desc
                //
                //
                //activity/competition:
                //format {field:'act_format', type:'dropdown', values:['competition', 'activity']},
                //length {field:'act_length', type:'dropdown', translate:true, values:['short', 'medium', 'long', 'half_day', 'day']},
                //participant count {field:'act_participants', type:'number'},
                //
                //vendor 
                //table count {field:'shop_tables', type:'number'}, //How large?
                //{field:'shop_type', type:'dropdown', values:['artist_alley','vendor']},
                var teamdesc = {tiers:[{
                    id:0, panels:[
                        {id:0, content:[{id:0, type:'caption', text:team.name}, {id:1, type:'image', image:team.image}]},
                    ]
                }/*,{ -- This will not be viable to have here until we get the scheduling integrated in the website.
                    id:1, panels:[
                        {id:0, content:[{id:0, type:'text', text:app.stringApi.get_string('list.show_activities.times', lang)}]},
                        {id:1, content:[{id:0, type:'text', text:team.schedule.map(function(s){return app.stringApi.get_string(s, lang)}).join(", ")}]}
                    ]
                }*/], id:content.length};
                var desc = app.stringApi.bookParser(team.desc, app.uuid());

                teamdesc.tiers = teamdesc.tiers.concat(desc[0].tiers);

                content.push(teamdesc);
                content = content.concat(desc.slice(1));
            }

            return {content, id:0};
        });
}
