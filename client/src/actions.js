
exports.SERVER_UPDATE = 'SERVER_UPDATE'
exports.SERVER_STATE = 'SERVER_STATE';


exports.serverUpdate = (diff) => {
    return {
        type:exports.SERVER_UPDATE,
        diff:diff
    };
}
exports.serverState = (state) => {
    return {
        type:exports.SERVER_STATE,
        state:state
    };
}
