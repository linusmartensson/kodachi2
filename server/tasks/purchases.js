
const https = require("https");
import {URLSearchParams} from "url";

module.exports = async (app) => {

    function query (target, data) {
        console.dir(target);
        console.dir(data);
        return new Promise((resolve, reject) => {
            const options = {
                hostname: app.paysonkey.endpoint,
                port: 443,
                path: target,
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": Buffer.byteLength(data),
                    "PAYSON-SECURITY-USERID": app.paysonkey.agent,
                    "PAYSON-SECURITY-PASSWORD": app.paysonkey.hash
                }
            };
            const req = https.request(options, (res) => {
                console.log("statusCode:", res.statusCode);
                console.log("headers:", res.headers);

                const body = [];
                res.on("data", (d) => {
                    body.push(d);
                });
                res.on("end", () => {
                    const v = Buffer.concat(body).toString();
                    console.dir(v);
                    resolve(v);
                });
                res.on("error", (e) => {
                    reject(e);
                });
            });
            req.on("error", (e) => {
                reject(e);
            });
            req.write(data);
            req.end();
        });
    }

    function querySsn (target) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: app.ratsitkey.endpoint,
                port: 443,
                path: `/api/v1/personinformation?SSN=${target}`,
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Authorization": app.ratsitkey.auth,
                    "Package": "personadress"
                }
            };
            console.dir(options);
            const req = https.request(options, (res) => {
                console.log("statusCode:", res.statusCode);
                console.log("headers:", res.headers);

                const body = [];
                res.on("data", (d) => {
                    body.push(d);
                });
                res.on("end", () => {
                    resolve(Buffer.concat(body).toString());
                });
                res.on("error", (e) => {
                    reject(e);
                });
            });
            req.on("error", (e) => {
                reject(e);
            });
            req.end();
        });
    }

    async function validateSsn (ssn) {
        return await querySsn(ssn);
    }


    async function queryToken (ctx, trackId, sum, message) {
        const u = (await app.userApi.getUser(await app.userApi.userId(ctx)));
        console.dir(u);
        const data = {
            returnUrl: app.paysonkey.returnurl,
            cancelUrl: app.paysonkey.returnurl,
            ipnNotificationUrl: `${app.paysonkey.serverurl}/task/respond_task/${trackId}`,
            memo: message,
            guaranteeOffered:"NO",
            senderEmail: u.email,
            senderFirstName: u.givenName,
            senderLastName: u.lastName,
            trackingId: trackId,
            "receiverList.receiver(0).email": app.paysonkey.email,
            "receiverList.receiver(0).amount": sum
        };
        console.dir(data);

        return new URLSearchParams(await query("/1.0/Pay/", new URLSearchParams(data).toString()));
    }
    async function validate (ipn) {
        return await query("/1.0/Validate/", ipn);
    }

    async function markPaid (paysonFee, token, user, numTickets, numSleep, points, event) {

        for (let v = 0; v < numSleep; ++v) {
            await app.cypher("MATCH (u:User {id:{user}}), (e:Event {id:{event}}) CREATE (u)-[:TICKET {type:{type}, used:false, id:{ticket}}]->(e)", {user, event, type: "sleep", ticket: app.uuid()});
        }
        for (let v = 0; v < numTickets; ++v) {
            await app.cypher("MATCH (u:User {id:{user}}), (e:Event {id:{event}}) CREATE (u)-[:TICKET {type:{type}, used:false, id:{ticket}}]->(e)", {user, event, type: "ticket", ticket: app.uuid()});
        }
        await app.budgetApi.addBudget(event, "ticket_income", 300 * numTickets);
        await app.budgetApi.addBudget(event, "sleep_income", 150 * numSleep);

        await app.roleApi.addAchievement(user, "i_saved_the_convention", numTickets * 300 + 150 * numSleep + points / 10, event, 10000, 100);

        if (numTickets > 0) {
            await app.roleApi.addRole(user, `visitor.${event}`, 2000);
            await app.roleApi.addAchievement(user, "i_bought_a_thing", 1, event, 1, 10);
        }
        if (numSleep > 0) {
            await app.roleApi.addRole(user, `sleeper.${event}`, 1000);
            await app.roleApi.addAchievement(user, "my_nap_spot", 1, event, 1, 10);
        }
        if (numTickets > 0 && numSleep > 0) {
            await app.roleApi.addRole(user, `visitor.${event}`, 2100);
            await app.roleApi.addAchievement(user, "i_bought_all_the_things", 1, event, 1, 10);
        }
        await app.roleApi.addRole(user, "user", 500);

        if (points > 0) {
            await app.cypher("MATCH (u:User {id:{user}}) SET u.points = toInt(u.points) + toInt({points})", {user, points});
            await app.budgetApi.addBudget(event, "point_income", points / 10);
            await app.budgetApi.addBudget(event, "point_cost", points / 10);
        }

        await app.budgetApi.addBudget(event, "banking_fees", -paysonFee);
    }


    // Payment entrypoints
    app.taskApi.create_task(
        "purchases", "buy_tickets",
        ["user"], [],
        app.taskApi.okcancel().concat({event_task: true, autocancel: true, field: "tickets", type: "amount"}, {field: "sleep", type: "amount"}),
        async (inst, ctx) => {
            if (inst.response.cancel) {
                return "OK";
            }
            inst.data.numTickets = inst.response.tickets;
            inst.data.numSleep = inst.response.sleep;
            inst.data.points = 0;
            inst.data.total = inst.data.numTickets * 300 + inst.data.numSleep * 150;
            inst.data.event = (await app.userApi.getActiveEvent(ctx)).id;
            const uuid = app.uuid();
            console.dir("querying");
            const result = await queryToken(ctx, uuid, inst.data.total, app.stringApi.get_string("payson.buy.tickets", await app.userApi.getLanguage(ctx)));
            inst.data.token = result.get("TOKEN");
            console.dir("got token");
            console.dir(inst.data.token);
            inst.next_tasks.push({task: "goto_payson", uuid});
            return "OK";
        }, async (inst, ctx) => "OK"
    );
    app.taskApi.create_task(
        "purchases", "buy_points",
        ["user"], [],
        app.taskApi.okcancel().concat({hide: true, event_task: true, autocancel: true, field: "points", type: "dropdown", values: [100, 500, 1500, 3000]}),
        async (inst, ctx) => {
            if (inst.response.cancel) {
                return "OK";
            }
            inst.data.numTickets = 0;
            inst.data.numSleep = 0;
            inst.data.total = inst.data.points / 10;
            inst.data.points = inst.response.points;
            inst.data.event = (await app.userApi.getActiveEvent(ctx)).id;
            const uuid = app.uuid();
            const result = await queryToken(ctx, uuid, inst.data.total, app.stringApi.get_string("payson.buy.points", await app.userApi.getLanguage(ctx)));
            inst.data.token = result.get("TOKEN");
            inst.next_tasks.push({task: "goto_payson", uuid});
            return "OK";
        }, async (inst, ctx) => "OK"
    );

    // Purchase handling - called by router.
    app.taskApi.step(
        "goto_payson",
        [{prepare: async (v, ctx, inst) => {
            v.redirect = app.paysonkey.ext + inst.data.token;
            console.dir(v.redirect);
        }, external: true}],
        async (inst, ctx) => {
            const response = await validate(ctx.request.rawBody);
            if (response !== "VERIFIED") {
                return "RETRY";
            }

            const ipn = ctx.request.body;

            const s = ipn.status;

            switch (s) {
            case "COMPLETED":
                await markPaid(ipn.receiverFee, inst.data.token, inst.origin, inst.data.numTickets, inst.data.numSleep, inst.data.points, inst.data.event);
                inst.next_tasks.push("purchase_complete");
                return "OK";
            case "CREATED":
            case "PENDING":
            case "PROCESSING":
                return "RETRY";
            case "REVERSALERROR":
            case "ERROR":
            case "CREDITED":
            case "ABORTED":
            default:
                inst.next_tasks.push("purchase_failed");
                return "OK";

            }
        }, async (inst, ctx) => "OK"
    );
    app.taskApi.create_task(
        "purchase", "purchase_failed", [], [], [{field: "ok", type: "button"}],
        async (inst, ctx) => "OK", async (inst, ctx) => "OK"
    );
    app.taskApi.create_task(
        "purchase", "purchase_complete", [], [], [{field: "ok", type: "button"}],
        async (inst, ctx) => "OK", async (inst, ctx) => "OK"
    );

    app.taskApi.create_task(
        "purchase", "checkin_select", [], [], app.taskApi.okcancel().concat({event_task:true},
        {field: "target", type: "dropdown", prepare: async (v, ctx, task) => {
                console.dir(task);
                console.dir(task.data);
                if(!task.data.accs) return;
                const w = task.data.accs;
                v.values = [];
                for (const r of w) {
                    v.values.push({label: r.u.email + " - " + r.u.ssn + " - " + r.u.phone, id: r.u.id});
                }
            }}),
        async (inst, ctx) => {
            let res = "";
            for(var v of inst.data.accs){
                if(v.u.id == inst.response.target.id) res = inst.data.user = v.u;
            }
            
            let tickets = app.mapCypher(await app.cypher("MATCH (:User {id:{id}})-[t:TICKET]-(:Event {id:{event}}) RETURN t", {event: inst.data.start_data.event_id, id: res.id}), ["t"]);
            inst.data.tickets = tickets;
            inst.data.ticketCount = tickets.length;
            inst.data.hasSleep = inst.data.hasTicket = inst.data.hasUsedSleep = inst.data.hasUsedTicket = false;
            for(let t of tickets){
                let q = t['t'];
                if(q.type == 'sleep' && q.used == true) inst.data.hasUsedSleep = true;
                if(q.type == 'ticket' && q.used == true) inst.data.hasUsedTicket = true;
                if(q.type == 'sleep' && q.used == false) inst.data.hasSleep = true;
                if(q.type == 'ticket' && q.used == false) inst.data.hasTicket = true;
            }
            if(inst.data.hasTicket == false) {
                if(inst.data.hasSleep) {
                    if(!inst.data.hasUsedTicket){
                        inst.error = "{tasks.checkin.onlyHasSleep}";
                        return 'RETRY';
                    } // else allow checkin with just sleep ticket.
                } else if(inst.data.hasUsedSleep || inst.data.hasUsedTicket){
                    inst.error = "{tasks.checkin.alreadyCheckedIn}";
                    return 'RETRY';
                } else {
                    inst.error = "{tasks.checkin.noTickets}"
                    return 'RETRY';
                }
            }
            inst.next_tasks.push("checkin_verify");
            return 'OK';

        })


    app.taskApi.create_task(
        "purchase", "checkin_verify", [], [], app.taskApi.okcancel().concat({event_task:true}),
        async (inst,ctx) => {

            let tasks = [];
            for(let t of inst.data.tickets){
                tasks.push(app.cypher("MATCH (:User {id:{id}})-[t:TICKET]-(:Event {id:{event}}) SET t.used=true", {event: inst.data.start_data.event_id, id: inst.data.user.id}));
            }
            return 'OK';
        });

    //Initiate an on-site register+pay event
    app.taskApi.create_task(
        "purchase", "fast_buy", ["entrance.", "admin.", "crew_admin.", "team_admin."], [], [].concat({event_task:true},
            {field:"cancel", type:'button'},
            {field:"has_account", type:'button'},   //user just wants to pay and go
            {field:"no_ssn", type:'button'},        //Needs an account, but not swedish
            {field:"no_account", type:'button'}),   //Needs an account
        async (inst, ctx) => {
            if(inst.response.has_account) {
                inst.next_tasks.push("fast_pay");
            } else if(inst.response.no_account) {
                inst.next_tasks.push("fast_account");
            } else if(inst.response.no_ssn) {
                inst.next_tasks.push("fast_no_ssn");
            }
            return "OK";
        });

    let initCheckin = async (inst, res) => {
        inst.data.user = res;
        let tickets = app.mapCypher(await app.cypher("MATCH (:User {id:{id}})-[t:TICKET]-(:Event {id:{event}}) RETURN t", {event: inst.data.start_data.event_id, id: res.id}), ["t"]);
        inst.data.tickets = tickets;
        inst.data.ticketCount = tickets.length;
        inst.data.hasSleep = inst.data.hasTicket = inst.data.hasUsedSleep = inst.data.hasUsedTicket = false;
        for(let t of tickets){
            let q = t['t'];
            if(q.type == 'sleep' && q.used == true) inst.data.hasUsedSleep = true;
            if(q.type == 'ticket' && q.used == true) inst.data.hasUsedTicket = true;
            if(q.type == 'sleep' && q.used == false) inst.data.hasSleep = true;
            if(q.type == 'ticket' && q.used == false) inst.data.hasTicket = true;
        }
        inst.next_tasks.push("checkin_verify");
        return 'OK';
    }
    let fastAccount = async (inst) => {
        if(inst.response.ssn){
            inst.data.ssnResult = JSON.parse(await validateSsn(inst.response.ssn));

            if (inst.data.ssnResult && inst.data.ssnResult.responseCode && inst.data.ssnResult.responseCode === "Ok" || inst.data.ssnResult.responseCode === "NotFound") {
                const res = await app.userApi.findAccount({ssn: inst.response.ssn, email: inst.response.email});
                if (res) {//User filled in all details, but already has account. prepopulate fields, goto fast_pay.
                    inst.data.ssn = inst.response.ssn || inst.response.email;
                    inst.data.sleep_ticket = inst.response.sleep_ticket;
                    inst.next_tasks.push("fast_pay");
                    return 'OK';
                } else if (!inst.data.ssnResult.basic) {//User filled in all details, but lacks public ssn. Prepop & goto fast_no_ssn
                    inst.data.country = "Sverige";
                    inst.data.email = inst.response.email;
                    inst.data.phone = inst.response.phone;
                    inst.data.emergencyphone = inst.response.emergencyphone;
                    inst.data.nickname = inst.response.nickname;
                    inst.data.sleep_ticket = inst.response.sleep_ticket;
                    inst.data.ssn = inst.response.ssn; //Save it anyways, why not?
                    inst.next_tasks.push("fast_no_ssn");
                    return 'OK';
                } else {    //User checks out. Register account, buy ticket & goto verify_checkin
                    inst.data.ssn = inst.response.ssn;
                    inst.data.givenName = inst.data.ssnResult.basic.givenName;
                    inst.data.lastName = inst.data.ssnResult.basic.lastName;
                    inst.data.street = inst.data.ssnResult.basic.street;
                    inst.data.zipCode = inst.data.ssnResult.basic.zipCode;
                    inst.data.city = inst.data.ssnResult.basic.city;
                    inst.data.email = inst.response.email;
                    inst.data.phone = inst.response.phone;
                    inst.data.emergencyphone = inst.response.emergencyphone;
                    inst.data.nickname = inst.response.nickname;
                    inst.data.sleep_ticket = inst.response.sleep_ticket;
                    inst.data.country = "Sverige";
                    inst.data.password = app.uuid();

                    if ((await app.userApi.findAccount({email: inst.response.email})) !== false) {
                        inst.error = "{tasks.account.emailTaken}";
                        return "RETRY";
                    }
                    if ((await app.userApi.findAccount({nickname: inst.response.nickname})) !== false) {
                        inst.error = "{tasks.account.nickNameTaken}";
                        return "RETRY";
                    }

                    let res = await app.userApi.createUser(false, inst.data);
                    
                    await markPaid(0, "", res.id, 1, inst.response.sleep_ticket?1:0, 0, inst.data.start_data.event_id);

                    return await initCheckin(inst, res);
                }
            } else {
                //Couldn't autoload ssn, register using alt. pipe
                inst.data.country = "Sverige";
                inst.data.email = inst.response.email;
                inst.data.phone = inst.response.phone;
                inst.data.emergencyphone = inst.response.emergencyphone;
                inst.data.nickname = inst.response.nickname;
                inst.data.sleep_ticket = inst.response.sleep_ticket;
                inst.data.ssn = inst.response.ssn; //Save it anyways, why not?
                inst.next_tasks.push("fast_no_ssn");
                return 'OK';
            }
        } else {
 
            inst.data.ssn = inst.data.ssn?inst.data.ssn:"";
            inst.data.givenName = inst.response.givenName;
            inst.data.lastName = inst.response.lastName;
            inst.data.street = inst.response.street;
            inst.data.zipCode = inst.response.zipCode;
            inst.data.city = inst.response.city;
            inst.data.country = inst.response.country;
            inst.data.email = inst.response.email;
            inst.data.phone = inst.response.phone;
            inst.data.emergencyphone = inst.response.emergencyphone;
            inst.data.nickname = inst.response.nickname;
            inst.data.sleep_ticket = inst.response.sleep_ticket;
            inst.data.password = app.uuid();

            if ((await app.userApi.findAccount({email: inst.response.email})) !== false) {
                inst.error = "{tasks.account.emailTaken}";
                return "RETRY";
            }
            if ((await app.userApi.findAccount({nickname: inst.response.nickname})) !== false) {
                inst.error = "{tasks.account.nickNameTaken}";
                return "RETRY";
            }

            let res = await app.userApi.createUser(false, inst.data);
                
            await markPaid(0, "", res.id, 1, inst.response.sleep_ticket?1:0, 0, inst.data.start_data.event_id);

            return await initCheckin(inst, res);
        }
        
    }

    app.taskApi.create_task(
        "purchase", "fast_pay", [], [], app.taskApi.okcancel().concat({event_task:true},
            {field:'checkin_account', type:'text'},
            {field:'sleep_ticket', type:'bool'}),
        async (inst, ctx) => {
            const res = await app.userApi.findAccount({any: inst.response.checkin_account});
            if(!res){
                inst.error = "{tasks.account.noSuchUser}";
                return 'RETRY';
            } else {
                await markPaid(0, "", res.id, 1, inst.response.sleep_ticket?1:0, 0, inst.data.start_data.event_id);
            }
            return await initCheckin(inst, res); 
        });

    app.taskApi.create_task(
        "purchase", "fast_no_ssn", [], [], app.taskApi.okcancel().concat({event_task:true},
            {field:'email', type:'email'},
            {field:'phone', type:'phone'},
            {field:'emergencyphone', type:'phone'},
            {field:'nickname', type:'simpletext'},
            {field: "givenName", type: "text"},
            {field: "lastName", type: "text"},
            {field: "street", type: "text"},
            {field: "zipCode", type: "text"},
            {field: "city", type: "text"},
            {field: "country", type: "text"},
            {field:'sleep_ticket', type:'bool'}),
        async (inst, ctx) => {
            return fastAccount(inst); 
        });


    app.taskApi.create_task(
        "purchase", "fast_account", [], [], app.taskApi.okcancel().concat({event_task:true},
            {field:'ssn', type:'ssn'},
            {field:'email', type:'email'},
            {field:'phone', type:'phone'},
            {field:'emergencyphone', type:'phone'},
            {field:'nickname', type:'simpletext'},
            {field:'sleep_ticket', type:'bool'}),
        async (inst, ctx) => {
            return fastAccount(inst);
        });


    app.taskApi.create_task(
        "purchase", "checkin", ["entrance.", "admin", "admin.", "crew_admin.", "team_admin."], [], app.taskApi.okcancel().concat({event_task:true},
            {field:"checkin_account", type:"text"}),
        async (inst, ctx) => {
            
            const res = await app.userApi.findAccount({any: inst.response.checkin_account});
            const mres = await app.userApi.findAccounts(inst.response.checkin_account);
            if(!res && !mres){
                inst.error = "{tasks.account.noSuchUser}";
                return 'RETRY';
            } else if(mres) {
                inst.data.accs = mres;
                inst.next_tasks.push("checkin_select");
                return 'OK';
            } else {

                inst.data.user = res;
                let tickets = app.mapCypher(await app.cypher("MATCH (:User {id:{id}})-[t:TICKET]-(:Event {id:{event}}) RETURN t", {event: inst.data.start_data.event_id, id: res.id}), ["t"]);
                inst.data.tickets = tickets;
                inst.data.ticketCount = tickets.length;
                inst.data.hasSleep = inst.data.hasTicket = inst.data.hasUsedSleep = inst.data.hasUsedTicket = false;
                for(let t of tickets){
                    let q = t['t'];
                    if(q.type == 'sleep' && q.used == true) inst.data.hasUsedSleep = true;
                    if(q.type == 'ticket' && q.used == true) inst.data.hasUsedTicket = true;
                    if(q.type == 'sleep' && q.used == false) inst.data.hasSleep = true;
                    if(q.type == 'ticket' && q.used == false) inst.data.hasTicket = true;
                }
                if(inst.data.hasTicket == false) {
                    if(inst.data.hasSleep) {
                        if(!inst.data.hasUsedTicket){
                            inst.error = "{tasks.checkin.onlyHasSleep}";
                            return 'RETRY';
                        } // else allow checkin with just sleep ticket.
                    } else if(inst.data.hasUsedSleep || inst.data.hasUsedTicket){
                        inst.error = "{tasks.checkin.alreadyCheckedIn}";
                        return 'RETRY';
                    } else {
                        inst.error = "{tasks.checkin.noTickets}"
                        return 'RETRY';
                    }
                }
                inst.next_tasks.push("checkin_verify");
                return 'OK';
            }
        });

    app.taskApi.create_task(
        "purchase", "give_ticket", ["user"], [], app.taskApi.okcancel().concat({field:"recipient_name", type:"text", event_task:true, hide:true}),
        async (inst, ctx) => {
            let ticket = inst.data.start_data.ticket;
            let user = inst.origin;
            let recipient = inst.response.recipient_name;
            console.dir(inst.data);
            let target = app.mapCypher(await app.cypher("MATCH (u:User {id:{user}})-[t:TICKET {id:{ticket}, used:false}]-(e:Event {id:{event}}) RETURN t", {user, ticket, event:inst.data.start_data.event_id}), ["t"]);

            if(target.length < 1) return "FAIL";
            recipient = (await app.userApi.findAccount({ssn:recipient, email:recipient, nickname:recipient})).id;

            if(!recipient){
                inst.error = "{tasks.account.noSuchUser}";
                return "RETRY";
            }
            if(recipient === user){
                inst.error = "{tasks.purchases.giftToMe}";
                return "RETRY";
            }
            let type = target[0].t.type;

            await app.cypher("MATCH (r:User {id:{recipient}}), (u:User {id:{user}})-[t:TICKET {id:{ticket}}]-(e:Event {id:{event}}) CREATE (r)-[:TICKET {type:t.type, used:false, id:{newid}}]->(e) DELETE t", {recipient, user, ticket, event:inst.data.start_data.event_id, newid:app.uuid()});
            
            if (type === 'ticket') {
                await app.roleApi.addRole(recipient, `visitor.${inst.data.start_data.event_id}`, 2000);
                await app.roleApi.addAchievement(recipient, "i_bought_a_thing", 1, inst.data.start_data.event_id, 1, 10);
            }
            if (type === 'sleep') {
                await app.roleApi.addRole(recipient, `sleeper.${inst.data.start_data.event_id}`, 1000);
                await app.roleApi.addAchievement(recipient, "my_nap_spot", 1, inst.data.start_data.event_id, 1, 10);
            }

            let tickets = app.mapCypher(await app.cypher("MATCH (u:User {id:{user}})-[t:TICKET]-(e:Event {id:{event}}) RETURN t", {user, event:inst.data.start_data.event_id}), ["t"]);

            let hasSleep = false, hasTicket = false;

            for(var v in tickets){
                if(tickets[v].t.type == "sleep") hasSleep = true;
                if(tickets[v].t.type == "ticket") hasTicket = true;
            }
            if(type === 'sleep' && !hasSleep) await app.roleApi.removeRole(user, `sleeper.${inst.data.start_data.event_id}`, 1000);
            if(type === 'ticket' && !hasTicket) await app.roleApi.removeRole(user, `visitor.${inst.data.start_data.event_id}`, 2000);
            
            return 'OK';
        }
    );
};
