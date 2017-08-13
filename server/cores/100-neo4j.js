import winston from 'winston'
var neo4j = require('neo4j');

module.exports = async (app) => {
	app.db = new neo4j.GraphDatabase('http://localhost:7474')
	winston.info("Neo4j driver loaded!");
}
