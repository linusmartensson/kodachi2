

module.exports = async (app) => {
    const api = {};

    api.addGroup = async (event, type, limit) => {
        await app.cypher("MATCH (e:Event {id:{event}}) CREATE (:BudgetGroup {type:{type}, limit:{limit}, total:0})-[:FOR_EVENT]->(e)", {event, type, limit});
    };

    api.addBudget = async (event, type, value) => {
        await app.cypher("MATCH (e:Event {id:{event}})<-[:FOR_EVENT]-(b:BudgetGroup {type:{type}}) SET b.total = toInt(b.total) + toInt({value})", {event, type, value});
    };


    app.budgetApi = api;
};
