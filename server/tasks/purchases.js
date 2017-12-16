
const https = require('https');
import {URLSearchParams} from 'url' 

module.exports = async (app) => {

    function query(target, data){
        console.dir(target);
        console.dir(data);
        return new Promise((resolve, reject) => {
            const options = {
                hostname: app.paysonkey.endpoint,
                port: 443,
                path: target,
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": Buffer.byteLength(data),
                    "PAYSON-SECURITY-USERID": app.paysonkey.agent,
                    "PAYSON-SECURITY-PASSWORD": app.paysonkey.hash
                }
            };
            const req = https.request(options, (res) => {
                console.log('statusCode:', res.statusCode);
                console.log('headers:', res.headers);

                var body = [];
                res.on('data', (d) => {
                    body.push(d);
                });
                res.on('end', () => {
                    var v = Buffer.concat(body).toString();
                    console.dir(v);
                    resolve(v);
                });
                res.on('error', (e) => {
                    reject(e);
                });
            });
            req.on('error', (e) => {
                reject(e);
            });
            req.write(data);
            req.end();
        });
    }
    
    async function queryToken(ctx, trackId, sum, message){
        var u = (await app.userApi.getUser(await app.userApi.userId(ctx)));
        console.dir(u);
        var data = {
            returnUrl:app.paysonkey.returnurl,
            cancelUrl:app.paysonkey.returnurl,
            ipnNotificationUrl:app.paysonkey.serverurl+"/task/respond_task/"+trackId,
            memo:message,
            senderEmail:u.email,
            senderFirstName:u.givenName,
            senderLastName:u.lastName,
            trackingId:trackId,
            "receiverList.receiver(0).email":app.paysonkey.email,
            "receiverList.receiver(0).amount":sum
        }
        console.dir(data);

        return new URLSearchParams(await query('/1.0/Pay/', new URLSearchParams(data).toString()));
    }
    async function validate(ipn){
        return await query('/1.0/Validate/', ipn);
    }

    async function markPaid(paysonFee, token, user, numTickets, numSleep, points, event){

        for(var v = 0; v < numSleep; ++v) {
            await app.cypher('MATCH (u:User {id:{user}}), (e:Event {id:{event}}) CREATE (u)-[:TICKET {type:{type}, id:{ticket}}]->(e)', {user, event, type:'ticket', ticket:app.uuid()});
        }
        for(var v = 0; v < numTickets; ++v) {
            await app.cypher('MATCH (u:User {id:{user}}), (e:Event {id:{event}}) CREATE (u)-[:TICKET {type:{type}, id:{ticket}}]->(e)', {user, event, type:'sleep', ticket:app.uuid()});
        }
        await app.budgetApi.addBudget(event, "ticket_income", 300*numTickets);
        await app.budgetApi.addBudget(event, "sleep_income", 150*numSleep);

        if(numTickets > 0){
            await app.roleApi.addRole(user, 'visitor.'+event, 2000);
        }
        if(numSleep > 0){
            await app.roleApi.addRole(user, 'sleeper.'+event, 1000);
        }

        if(points > 0){
            await app.cypher('MATCH (u:User {id:{user}}) SET u.points = toInt(u.points) + {points}', {user, points});
            await app.budgetApi.addBudget(event, "point_income", points*10);
            await app.budgetApi.addBudget(event, "point_cost", points*10);
        }

        await app.budgetApi.addBudget(event, "banking_fees", -paysonFee);
    }


    //Payment entrypoints
    app.taskApi.create_task('purchases', 'buy_tickets',
            ['user'],[],
            app.taskApi.okcancel().concat({field:'tickets', type:'amount'}, {field:'sleep', type:'amount'}),
            async (inst, ctx) => {
                if(inst.response.cancel) return 'OK';
                inst.data.numTickets = inst.response.tickets;
                inst.data.numSleep = inst.response.sleep;
                inst.data.points = 0;
                inst.data.total = inst.data.numTickets*300 + inst.data.numSleep*150;
                inst.data.event = (await app.userApi.getActiveEvent(ctx)).id;
                var uuid = app.uuid();
                console.dir("querying");
                var result = await queryToken(ctx, uuid, inst.data.total, app.stringApi.get_string("payson.buy.tickets", await app.userApi.getLanguage(ctx)));
                inst.data.token = result.get('TOKEN');
                console.dir("got token");
                console.dir(inst.data.token);
                inst.next_tasks.push({task:'goto_payson', uuid:uuid});
                return 'OK';
            }, async(inst, ctx) => {
                return 'OK';
            });
    app.taskApi.create_task('purchases', 'buy_points',
            ['user'],[],
            app.taskApi.okcancel().concat({field:'points', type:'dropdown', values:[100, 500, 1500, 3000]}),
            async (inst, ctx) => {
                if(inst.response.cancel) return 'OK';
                inst.data.numTickets = 0;
                inst.data.numSleep = 0;
                inst.data.total = inst.data.points/10;
                inst.data.points = inst.response.points;
                inst.data.event = (await app.userApi.getActiveEvent(ctx)).id;
                var uuid = app.uuid();
                var result = await queryToken(ctx, uuid, inst.data.total, app.stringApi.get_string("payson.buy.points", await app.userApi.getLanguage(ctx)));
                inst.data.token = result.get('TOKEN');
                inst.next_tasks.push({task:'goto_payson', uuid:uuid});
                return 'OK';
            }, async(inst, ctx) => {
                return 'OK';
            });

    //Purchase handling - called by router.
    app.taskApi.step('goto_payson', 
            [{prepare: async(v,ctx,inst) => {
                v.redirect = app.paysonkey.ext + inst.data.token;
                console.dir(v.redirect);
            }, external:true}],
            async (inst, ctx) => {
                var response = await validate(ctx.request.rawBody);
                if(response != 'VERIFIED') return 'RETRY';

                var ipn = ctx.request.body;

                var s = ipn.status;

                switch(s){
                    case 'COMPLETED':
                        await markPaid(ipn.receiverFee, inst.data.token, inst.origin, inst.data.numTickets, inst.data.numSleep, inst.data.points, inst.data.event);
                        inst.next_tasks.push('purchase_complete');
                        return 'OK';
                    case 'CREATED': 
                    case 'PENDING':
                    case 'PROCESSING':
                        return 'RETRY';
                    case 'REVERSALERROR':
                    case 'ERROR':
                    case 'CREDITED':
                    case 'ABORTED':
                    default:
                        inst.next_tasks.push('purchase_failed');
                        return 'OK';

                }
            }, async(inst, ctx) => {
                return 'OK'; 
            });
    app.taskApi.create_task("purchase", "purchase_failed", [], [], [{field:'ok', type:'button'}],
       async (inst, ctx) => {
            return 'OK';
       }, async(inst, ctx) => {
            return 'OK';
       });
    app.taskApi.create_task("purchase", "purchase_complete", [], [], [{field:'ok', type:'button'}],
       async (inst, ctx) => {
            return 'OK';
       }, async(inst, ctx) => {
            return 'OK';
       });
}
