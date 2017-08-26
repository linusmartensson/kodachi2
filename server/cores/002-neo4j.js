import winston from 'winston'
var neo4j = require('neo4j');

module.exports = async (app) => {
	app.db = new neo4j.GraphDatabase('http://localhost:7474')
	
    app.cypher = function(q, p){
        return new Promise((resolve, reject) => {
            app.db.cypher({query:q, params:p}, (err, result)=>{
                if(err){
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    };
    winston.info("Neo4j driver loaded!");
}
