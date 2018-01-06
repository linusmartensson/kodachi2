
const https = require("https");
import {URLSearchParams} from "url";

module.exports = async (app) => {

    function query (target, data){
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

    async function queryToken (ctx, trackId, sum, message){
        const u = (await app.userApi.getUser(await app.userApi.userId(ctx)));
        console.dir(u);
        const data = {
            returnUrl: app.paysonkey.returnurl,
            cancelUrl: app.paysonkey.returnurl,
            ipnNotificationUrl: app.paysonkey.serverurl+"/task/respond_task/"+trackId,
            memo: message,
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
    async function validate (ipn){
        return await query("/1.0/Validate/", ipn);
    }

    async function markPaid (paysonFee, token, user, numTickets, numSleep, points, event){

        for(let v = 0; v < numSleep; ++v) {
            await app.cypher("MATCH (u:User {id:{user}}), (e:Event {id:{event}}) CREATE (u)-[:TICKET {type:{type}, used:false, id:{ticket}}]->(e)", {user, event, type: "ticket", ticket: app.uuid()});
        }
        for(let v = 0; v < numTickets; ++v) {
            await app.cypher("MATCH (u:User {id:{user}}), (e:Event {id:{event}}) CREATE (u)-[:TICKET {type:{type}, used:false, id:{ticket}}]->(e)", {user, event, type: "sleep", ticket: app.uuid()});
        }
        await app.budgetApi.addBudget(event, "ticket_income", 300*numTickets);
        await app.budgetApi.addBudget(event, "sleep_income", 150*numSleep);

        await app.roleApi.addAchievement(user, "i_saved_the_convention", numTickets*300+150*numSleep+points/10, event, 10000, 100);

        if(numTickets > 0){
            await app.roleApi.addRole(user, "visitor."+event, 2000);
            await app.roleApi.addAchievement(user, "i_bought_a_thing", 1, event, 1, 10);
        }
        if(numSleep > 0){
            await app.roleApi.addRole(user, "sleeper."+event, 1000);
            await app.roleApi.addAchievement(user, "my_nap_spot", 1, event, 1, 10);
        }
        if(numTickets > 0 && numSleep > 0){
            await app.roleApi.addRole(user, "visitor."+event, 2100);
            await app.roleApi.addAchievement(user, "i_bought_all_the_things", 1, event, 1, 10);
        }
        await app.roleApi.addRole(user, "user", 500);

        if(points > 0){
            await app.cypher("MATCH (u:User {id:{user}}) SET u.points = toInt(u.points) + {points}", {user, points});
            await app.budgetApi.addBudget(event, "point_income", points/10);
            await app.budgetApi.addBudget(event, "point_cost", points/10);
        }

        await app.budgetApi.addBudget(event, "banking_fees", -paysonFee);
    }


    //Payment entrypoints
    app.taskApi.create_task("purchases", "buy_tickets",
        ["user"],[],
        app.taskApi.okcancel().concat({field: "tickets", type: "amount"}, {field: "sleep", type: "amount"}),
        async (inst, ctx) => {
            if(inst.response.cancel) return "OK";
            inst.data.numTickets = inst.response.tickets;
            inst.data.numSleep = inst.response.sleep;
            inst.data.points = 0;
            inst.data.total = inst.data.numTickets*300 + inst.data.numSleep*150;
            inst.data.event = (await app.userApi.getActiveEvent(ctx)).id;
            const uuid = app.uuid();
            console.dir("querying");
            const result = await queryToken(ctx, uuid, inst.data.total, app.stringApi.get_string("payson.buy.tickets", await app.userApi.getLanguage(ctx)));
            inst.data.token = result.get("TOKEN");
            console.dir("got token");
            console.dir(inst.data.token);
            inst.next_tasks.push({task: "goto_payson", uuid: uuid});
            return "OK";
        }, async (inst, ctx) => "OK");
    app.taskApi.create_task("purchases", "buy_points",
        ["user"],[],
        app.taskApi.okcancel().concat({hide: true, field: "points", type: "dropdown", values: [100, 500, 1500, 3000]}),
        async (inst, ctx) => {
            if(inst.response.cancel) return "OK";
            inst.data.numTickets = 0;
            inst.data.numSleep = 0;
            inst.data.total = inst.data.points/10;
            inst.data.points = inst.response.points;
            inst.data.event = (await app.userApi.getActiveEvent(ctx)).id;
            const uuid = app.uuid();
            const result = await queryToken(ctx, uuid, inst.data.total, app.stringApi.get_string("payson.buy.points", await app.userApi.getLanguage(ctx)));
            inst.data.token = result.get("TOKEN");
            inst.next_tasks.push({task: "goto_payson", uuid: uuid});
            return "OK";
        }, async (inst, ctx) => "OK");

    //Purchase handling - called by router.
    app.taskApi.step("goto_payson",
        [{prepare: async (v,ctx,inst) => {
            v.redirect = app.paysonkey.ext + inst.data.token;
            console.dir(v.redirect);
        }, external: true}],
        async (inst, ctx) => {
            const response = await validate(ctx.request.rawBody);
            if(response != "VERIFIED") return "RETRY";

            const ipn = ctx.request.body;

            const s = ipn.status;

            switch(s){
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
        }, async (inst, ctx) => "OK");
    app.taskApi.create_task("purchase", "purchase_failed", [], [], [{field: "ok", type: "button"}],
        async (inst, ctx) => "OK", async (inst, ctx) => "OK");
    app.taskApi.create_task("purchase", "purchase_complete", [], [], [{field: "ok", type: "button"}],
        async (inst, ctx) => "OK", async (inst, ctx) => "OK");
};
