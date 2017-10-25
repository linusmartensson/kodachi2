import winston from 'winston'
var neo4j = require('neo4j-driver').v1;

module.exports = async (app) => {
	app.db = neo4j.driver('bolt://localhost', neo4j.auth.basic("neo4j", "neo4j"))
    app.dbSession = app.db.session();	
   
    app.cypher = async function(q, p){
       try{
       return await app.dbSession.run(q,p); 
       } catch(e) {
           console.log("Query failed:");
        console.dir(q);
        console.dir(p);
           throw e;
       }
    };
    winston.info("Neo4j driver loaded!");
}
