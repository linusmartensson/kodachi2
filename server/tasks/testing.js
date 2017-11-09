import https from 'https'
module.exports = (app) => {


    async function f (){
        return new Promise(r => setTimeout(r, 3000));
    }

    app.taskApi.create_task('testing','slow',
            ["anonymous", "user"],[],
            app.taskApi.okcancel(),
            async (inst, ctx) => {
                inst.next_tasks.push('slow2');
                await f();
                return 'OK';
            }, (inst) => {
                return 'OK';
            });
    app.taskApi.create_task('testing', 'slow2',
            [],[],
            app.taskApi.yesno(),
            async (inst, ctx) => {
                return 'OK';
            }, (inst) => {
                return 'OK';
            }
    ); 
}
