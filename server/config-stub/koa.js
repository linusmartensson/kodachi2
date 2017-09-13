import fs from 'fs'

module.exports = (app) => {
	app.koa.keys = ['GIMMEAKEY'];
    
    app.paysonkey = {};
    app.paysonkey.agent = '';
    app.paysonkey.hash = '';
    app.paysonkey.endpoint = 'api.payson.se';
    app.paysonkey.returnurl = 'https://kodachi.se';
    app.paysonkey.serverurl = 'https://dev.kodachi.se';
    app.paysonkey.email = 'test@lol.se';
    app.paysonkey.ext = 'https://www.payson.se/paysecure/?token='

	app.ssl = {
		key: fs.readFileSync(...),
		cert: fs.readFileSync(...),
		ca: fs.readFileSync(...)
	}
}
