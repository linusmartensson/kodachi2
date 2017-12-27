
module.exports = (app) => {

    app.listApi.create_list("purchases", "tickets", ['user'], {event_list:true}, 
    async (inst, ctx) => {

        //get tickets
        var tickets = await app.cypher("MATCH (:User {id:{id}})-[t:TICKET]-(:Event {id:{event}}) RETURN t", {event:inst.start_data.event_id, id:await app.userApi.userId(ctx)});

        tickets = tickets.records;

        var content = [];
        
        var ticketTypes = {sleep:[], ticket:[]};

        //for tickets
        for(var v in tickets){
            var ticket = tickets.records[v].get('t').properties;
            ticketTypes[ticket.type].push(ticket);
        }
        
        content = content.concat(await app.stringApi.userParse(ctx, "{|list.purchases.ticketText}"));
        var rows = [];
        for(var v in ticketTypes.ticket){
            var ticket = ticketTypes.ticket[v];
            var row = {
                id:rows.length, panels:[
                    {id:0, content:[{id:0, type:'text', text:ticket.id}]}
                ]
            };

            rows.push(row);
        }
        content.push({tiers:rows, id:content.length});
        
        content = content.concat(await app.stringApi.userParse(ctx, "{|list.purchases.sleepText}"));
        var rows = [];
        for(var v in ticketTypes.sleep){
            var ticket = ticketTypes.sleep[v];
            var row = {
                id:rows.length, panels:[
                    {id:0, content:[{id:0, type:'text', text:ticket.id}]}
                ]
            };

            rows.push(row);
        }
        content.push({tiers:rows, id:content.length});

        return {content:content, id:0};
    });
}
