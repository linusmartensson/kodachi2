import noCache from "koa-no-cache";
module.exports = (app) => {
   
   app.koa.use(noCache({
       paths:["/service-worker.js"],
       types: ["manifest"] 
   })); 
};
