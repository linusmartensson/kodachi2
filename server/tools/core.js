import path from "path";
import fs from "fs";
import winston from "winston";
import cluster from "cluster";

var loader = async (dir, app)=> {
	var mw = [];
	var npath = path.join(__dirname, "..", dir);
	winston.info("loading "+dir);
	fs.readdirSync(npath).forEach(function(file) {
		if(!file.match("\.js$")) return;
		mw.push("../"+dir+"/" + file);
	})
	var v = mw.sort();
    for(var elem of v){
		winston.info(elem);
		await require(elem)(app);
	}
}

//Watch for file changes
var timeout = null;
function watch(file, reload) {
	winston.info("watcher on "+file);
	fs.readdirSync(file).forEach(function (f) {
		if(f.match(/^\./)) return;
		if(f.match("node_modules")) return;
		if(fs.statSync(file + "/" + f).isDirectory()){
			watch(file + "/" + f, reload);
		}
	});
	var watcher = fs.watch(file, {
		persistent: cluster.isMaster,
		recursive: true
	}, (eventType, fileName) => {
        if(fileName.match(/^\./)) return;
		if(timeout != null) clearTimeout(timeout);
		timeout = setTimeout(()=>{reload();}, 250);
	});
}



module.exports.loader = loader;
module.exports.watch = watch;
