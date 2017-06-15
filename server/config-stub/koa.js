import fs from 'fs'

module.exports = (app) => {
	app.koa.keys = ['GIMMEAKEY'];

	app.ssl = {
		key: fs.readFileSync(...),
		cert: fs.readFileSync(...),
		ca: fs.readFileSync(...)
	}
}
