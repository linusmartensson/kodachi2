
import asyncBusboy from 'async-busboy'

module.exports = (app) => {
    var api = {};

    api.form = async (ctx) => {
        const data = await asyncBusboy(ctx.req);
        
        for(var i=0;i<data.files.length;++i){
            data.fields[data.files[i].fieldname] = data.files[i];
        }
        return data.fields;
    }
    
    app.utils = api;
}
