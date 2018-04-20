import cluster from "cluster";
import fs from "fs";
import path from "path";

const loader = async (dir, app) => {
    const mw = [],
        npath = path.join(__dirname, "..", dir);

    console.log(`loading ${dir}`);
    fs.readdirSync(npath).forEach((file) => {
        if (!file.match(/\.js$/)) {
            return;
        }
        mw.push(`../${dir}/${file}`);
    });
    const v = mw.sort();
    for (const elem of v) {
        console.log(elem);
        await require(elem)(app);
    }
};

// Watch for file changes
let timeout = null;
function watch (file, reload) {
    console.log(`watcher on ${file}`);
    fs.readdirSync(file).forEach((f) => {
        if (f.match(/^\./)) {
            return;
        }
        if (f.match("node_modules")) {
            return;
        }
        if (fs.statSync(`${file}/${f}`).isDirectory()) {
            watch(`${file}/${f}`, reload);
        }
    });
    fs.watch(file, {
        persistent: cluster.isMaster,
        recursive: true
    }, (eventType, fileName) => {
        if (fileName.match(/^\./)) {
            return;
        }
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            reload();
        }, 250);
    });
}


module.exports.loader = loader;
module.exports.watch = watch;
