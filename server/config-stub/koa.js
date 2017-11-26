import fs from 'fs'

module.exports = (app) => {
	app.koa.keys = ['GIMMEAKEY'];

    app.origins = [
        
        //dev targets
        'http://localhost:3000',
        'https://localhost:3000',
        'https://localhost:3001',

        //prod targets
        'http://kodachi.se',
        'https://kodachi.se',
        'https://api.kodachi.se',
        'http://dev.kodachi.se',
        'https://dev.kodachi.se'
            
    ]

    app.emailTransport = mail.createTransport({
        host: '',
        port: '',
        pool: true,
        secure: true,
        auth: {
            user: '',
            pass: ''
        }
    });


    app.awskey = {
        accessKeyId: "",
        secretAccessKey: "",
        region: ''
    };
    
    app.paysonkey = {};
    app.paysonkey.agent = '';
    app.paysonkey.hash = '';
    app.paysonkey.endpoint = 'api.payson.se';
    app.paysonkey.returnurl = 'https://kodachi.se';
    app.paysonkey.serverurl = 'https://dev.kodachi.se';
    app.paysonkey.email = 'test@lol.se';
    app.paysonkey.ext = 'https://www.payson.se/paysecure/?token='

    app.ratsitkey = {
        endpoint:'',
        auth:''
    }

	app.ssl = {
		key: fs.readFileSync(...),
		cert: fs.readFileSync(...),
		ca: fs.readFileSync(...)
	}
}
