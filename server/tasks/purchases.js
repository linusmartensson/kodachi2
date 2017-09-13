
const https = require('https');
import {URLSearchParams} from 'url' 

module.exports = async (app) => {

    function query(target, data){
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
                    resolve(Buffer.concat(body).toString());
                });
                res.on('error', (e) => {
                    reject(e);
                });
            });
            req.on('error', (e) => {
                reject(e);
            });
            req.end(data);
        });
    }
    
    async function queryToken(ctx, trackId, sum, message){
        var u = app.userApi.getUser(ctx);
        var data = {
            returnUrl:app.paysonkey.returnurl,
            cancelUrl:app.paysonkey.returnurl,
            ipnNotificationUrl:app.paysonkey.serverurl+"/ipn",
            memo:message,
            senderEmail:u.email,
            senderFirstName:u.firstName,
            senderLastName:u.lastName,
            trackingId:trackId,
            "receiverList.receiver(0).email":app.paysonkey.email,
            "receiverList.receiver(0).amount":sum
        }

        return new URLSearchParams(await query('/1.0/Pay/', new URLSearchParams(data).toString()));
    }
    async function request(ctx, token, target){

    }
    async function paymentDetails(ctx, token){

    }
    async function validate(ipn){
        return await query('/1.0/Validate/', ipn);
    }

    async function markPaid(token, user, numTickets, numSleep, points){
//TODO
    }


    //Payment entrypoints
    app.taskApi.create_task('purchases', 'buy_tickets',
            ['user'],[],
            app.taskApi.okcancel().concat({field:'tickets', desc:'ticket_count', type:'amount'}, {field:'sleep', desc:'sleep_count', type:'amount'}),
            async (inst, ctx) => {
                inst.data.numTickets = inst.response.tickets;
                inst.data.numSleep = inst.response.sleep;
                var uuid = app.uuid();
                var result = queryToken(ctx, uuid, inst.data.numTickets*300 + inst.data.numSleep*150, app.stringApi.get_string("buy_tickets_payson"));
                inst.data.token = result.get('TOKEN');
                inst.next_tasks.push({task:'goto_payson', uuid:uuid});
                return 'OK';
            }, async(inst, ctx) => {
                return 'OK';
            });
    app.taskApi.create_task('purchases', 'buy_points',
            ['user'],[],
            app.taskApi.okcancel().concat({field:'points', desc:'point_count', type:'dropdown', values:[100, 500, 1500, 3000]}),
            async (inst, ctx) => {
                inst.data.points = inst.response.points;
                var uuid = app.uuid();
                var result = queryToken(ctx, uuid, inst.data.points/10, app.stringApi.get_string("buy_points_payson"));
                inst.data.token = result.get('TOKEN');
                inst.next_tasks.push({task:'goto_payson', uuid:uuid});
                return 'OK';
            }, async(inst, ctx) => {
                return 'OK';
            });

    //Purchase handling - called by router.
    app.taskApi.step('goto_payson', 
            {external:app.paysonkey.ext, append:'token'},
            async (inst, ctx) => {
                var response = await validate(inst.response.ipn);
                if(response != 'VERIFIED') return 'RETRY';

                var ipn = new URLSearchParams(inst.response.ipn);

                if(ipn.get('status') != 'COMPLETED') return 'RETRY';

                markPaid(inst.data.token, inst.origin, inst.data.numTickets, inst.data.numSleep, inst.data.points);

                return 'OK';
            }, async(inst, ctx) => {
                return 'OK'; 
            });
}
