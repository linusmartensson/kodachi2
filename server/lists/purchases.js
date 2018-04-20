
module.exports = (app) => {

    app.listApi.create_list(
        "purchases", "all_tickets", ["overseer.", "admin.", "admin", "ticket_vendor."], {event_list: true},
        async (inst, ctx) => {

        // get tickets
            let all_tickets = await app.cypher("MATCH (u:User)-[t:TICKET]-(:Event {id:{event}}) RETURN u,t", {event: inst.start_data.event_id});

            all_tickets = all_tickets.records;

            const users = {};
            for (const v in all_tickets) {
                const user = all_tickets[v].get("u").properties;
                if (!users[user.id]) {
                    users[user.id] = {user, tickets: []};
                }
                users[user.id].tickets.push(all_tickets[v].get("t").properties);
            }

            const content = [];
            for (const v in users) {
                const user = users[v].user;
                const tickets = users[v].tickets;
                const ticketTypes = {sleep: [], ticket: []};

                const rows = [];
                rows.push({id: rows.length, panels: [
                    {id: 0, content: [{id: 0, type: "text", text: `"${user.nickname}" ${user.lastName}`}]}
                ]});
                for (const w in tickets) {
                    const ticket = tickets[w];
                    const row = {
                        id: rows.length, panels: [
                            {id: 0, content: [{id: 0, type: "text", text: ticket.id}]},
                            {id: 1, content: [{id: 0, type: "text", text: ticket.type}]}
                        ]
                    };

                    rows.push(row);
                }
                content.push({tiers: rows, id: content.length});
            }
            return {content, id: 0};
        }
    );
    app.listApi.create_list(
        "purchases", "tickets", ["user"], {event_list: true},
        async (inst, ctx) => {

        // get tickets
            let tickets = await app.cypher("MATCH (:User {id:{id}})-[t:TICKET]-(:Event {id:{event}}) RETURN t", {event: inst.start_data.event_id, id: await app.userApi.userId(ctx)});

            tickets = tickets.records;

            let content = [];

            const ticketTypes = {sleep: [], ticket: []};

            // for tickets
            for (const v in tickets) {
                const ticket = tickets[v].get("t").properties;
                ticketTypes[ticket.type].push(ticket);
            }

            content = content.concat(await app.stringApi.userParse(ctx, "{|list.purchases.ticketText}"));
            let rows = [];
            for (const v in ticketTypes.ticket) {
                const ticket = ticketTypes.ticket[v];
                const row = {
                    id: rows.length, panels: [
                        {id: 0, content: [{id: 0, type: "text", text: ticket.id}]},
                            {id: 1, content: [{id: 0, type: "editbutton", text: "Överför konventsbiljett", task:`give_ticket.${inst.start_data.event_id}`, data:{ticket:ticket.id}}]}
                    ]
                };

                rows.push(row);
            }
            content.push({tiers: rows, id: content.length});

            content = content.concat(await app.stringApi.userParse(ctx, "{|list.purchases.sleepText}"));
            rows = [];
            for (const v in ticketTypes.sleep) {
                const ticket = ticketTypes.sleep[v];
                const row = {
                    id: rows.length, panels: [
                        {id: 0, content: [{id: 0, type: "text", text: ticket.id}]},
                            {id: 1, content: [{id: 0, type: "editbutton", text: "Överför sovsalsplats", task:`give_ticket.${inst.start_data.event_id}`, data:{ticket:ticket.id}}]}
                    ]
                };

                rows.push(row);
            }
            content.push({tiers: rows, id: content.length});

            return {content, id: 0};
        }
    );
};
