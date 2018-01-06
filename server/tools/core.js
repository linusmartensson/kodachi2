import cluster from "cluster";
import fs from "fs";
import path from "path";
import winston from "winston";

const loader = async (dir, app) => {
    const mw = [],
        npath = path.join(__dirname, "..", dir);

    winston.info("loading "+dir);
    fs.readdirSync(npath).forEach(function (file) {
        if(!file.match(/\.js$/)) return;
        mw.push("../"+dir+"/" + file);
    });
    const v = mw.sort();
    for(const elem of v){
        winston.info(elem);
        await require(elem)(app);
    }
};

//Watch for file changes
let timeout = null;
function watch (file, reload) {
    winston.info("watcher on "+file);
    fs.readdirSync(file).forEach(function (f) {
        if(f.match(/^\./)) return;
        if(f.match("node_modules")) return;
        if(fs.statSync(file + "/" + f).isDirectory()){
            watch(file + "/" + f, reload);
        }
    });
    fs.watch(file, {
        persistent: cluster.isMaster,
        recursive: true
    }, (eventType, fileName) => {
        if(fileName.match(/^\./)) return;
        if(timeout != null) clearTimeout(timeout);
        timeout = setTimeout(() => {reload();}, 250);
    });
}


module.exports.loader = loader;
module.exports.watch = watch;
