
module.exports = async (app) => {

    app.taskApi.create_task('template_action',
            [],[],
            app.taskApi.okcancel(),
            async (inst) => {
                return 'OK';
            }, (inst) => {
                return 'OK';   
            });
}
