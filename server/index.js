//cluster.isMaster is a watcher, whose only task is restarting children on filesystem changes.
//!cluster.isMaster will load all files from /cores in sorted order.
"use strict";
require("babel-register");

import cluster from "cluster";
import os from "os";

process.on("unhandledRejection", r => {
    console.dir(r);
    process.exit(1);
});

var tools = require("./tools/core");


var app = {};
var reload = () => {
	console.log("is master: "+cluster.isMaster);
	if(cluster.isMaster){
		var numCPUs = os.cpus().length;

		console.log("num CPUs: "+numCPUs);
		for(var i = 0; i<1; ++i){
			cluster.fork();
		}
		return;
	} else {
		if(app.koa) {process.exit();}
	}

	var start = async () => {
		console.log("Starting...");
		tools.loader("cores", app, ()=>{}).catch((e)=>{console.dir(e);});
	};

	start().catch((e) => {console.dir(e);});
};

console.log("Setting up watchers...");
tools.watch(__dirname, reload);

console.log("Starting cores!");
reload();
