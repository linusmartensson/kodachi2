//cluster.isMaster is a watcher, whose only task is restarting children on filesystem changes.
//!cluster.isMaster will load all files from /cores in sorted order.
require('babel-register');

import cluster from 'cluster';
import winston from 'winston';
import os from 'os';

process.on('unhandledRejection', r => {
    console.dir(r);
    process.exit(1);
});

var tools = require('./tools/core')

winston.level = "info";

var app = {};
var reload = () => {
	winston.info("is master: "+cluster.isMaster);
	if(cluster.isMaster){
		var numCPUs = os.cpus().length;

		winston.info("num CPUs: "+numCPUs);
		for(var i = 0; i<1; ++i){
			cluster.fork();
		}
		return;
	} else {
		if(app.koa) process.exit();
	}

	var start = async (connection) => {
		winston.info("Starting...");
		tools.loader('cores', app, ()=>{}).catch((e)=>{winston.error(e)});
	};

	start().catch((e) => {winston.error(e)});
}

winston.info("Setting up watchers...");
tools.watch(__dirname, reload);

winston.info("Starting cores!");
reload();
