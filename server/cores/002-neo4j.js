import winston from 'winston'
var neo4j = require('neo4j-driver').v1;

module.exports = async (app) => {
	app.db = neo4j.driver('bolt://localhost', neo4j.auth.basic("neo4j", "neo4j"))
    app.dbSession = app.db.session();	
   
    app.cypher = function(q, p){
       return app.dbSession.run(q,p); 
    };
    winston.info("Neo4j driver loaded!");
}
