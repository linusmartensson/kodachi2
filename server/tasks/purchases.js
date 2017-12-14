
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
        var u = (await app.userApi.getUser(await app.userApi.userId(ctx))).get('u').properties;
        console.dir(u);
        var data = {
            returnUrl:app.paysonkey.returnurl,
            cancelUrl:app.paysonkey.returnurl,
            ipnNotificationUrl:app.paysonkey.serverurl+"/respond_task/"+trackId,
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

    async function markPaid(token, user, numTickets, numSleep, points){
        var toBudget = 0; //...

        console.dir(token);
        console.dir(user);
        console.dir(numTickets);
        console.dir(numSleep);
        console.dir(points);

    }


    //Payment entrypoints
    app.taskApi.create_task('purchases', 'buy_tickets',
            ['user'],[],
            app.taskApi.okcancel().concat({field:'tickets', type:'amount'}, {field:'sleep', type:'amount'}),
            async (inst, ctx) => {
                if(inst.response.cancel) return 'OK';
                inst.data.numTickets = inst.response.tickets;
                inst.data.numSleep = inst.response.sleep;
                var uuid = app.uuid();
                console.dir("querying");
                var result = await queryToken(ctx, uuid, inst.data.numTickets*300 + inst.data.numSleep*150, app.stringApi.get_string("payson.buy.tickets", await app.userApi.getLanguage(ctx)));
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
                inst.data.points = inst.response.points;
                var uuid = app.uuid();
                var result = await queryToken(ctx, uuid, inst.data.points/10, app.stringApi.get_string("payson.buy.points", await app.userApi.getLanguage(ctx)));
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
            }}],
            async (inst, ctx) => {
                console.dir(inst.response);
                var response = await validate(inst.response.ipn);
                console.dir(response);
                if(response != 'VERIFIED') return 'RETRY';

                var ipn = new URLSearchParams(inst.response.ipn);

                if(ipn.get('status') != 'COMPLETED') return 'RETRY';

                markPaid(inst.data.token, inst.origin, inst.data.numTickets, inst.data.numSleep, inst.data.points);

                inst.next_tasks.push('purchase_complete');

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
