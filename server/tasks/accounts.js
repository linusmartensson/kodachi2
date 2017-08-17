
module.exports = async (app) => {

    function isCorrectSsn(){

    }

    async function validateSsn(var ssn){
        return false;
    }

    async function createAccount(inst){
    }

    app.taskApi.create_task('logout'
            ['user'],[],
            app.taskApi.okcancel(),
            async (inst) => {
                if(inst.response.ok) app.userApi.logout(ctx);
                return 'OK';
            });
    app.taskApi.create_task('login'
            ['anonymous'],[],
            app.taskApi.okcancel().concat({field:'email_or_ssn', desc:'login', type:'text'}, {field:'password', desc:'password', type:'password'}),
            async (inst) => {

                if(inst.response.ok){
                    var user = app.userApi.findAccount({ssn:inst.response.email_or_ssn}) || app.userApi.findAccount({email:inst.response.email_or_ssn});
                    if(user) {
                        if(app.userApi.tryLogin(ctx, user, inst.response.password)){
                            return 'OK';
                        } else return 'RETRY';
                    } else {
                        return 'OK';
                    }
                }
            });
    app.taskApi.create_task('register_account', 
            ['anonymous'],[], 
            [{field:'ssn', desc:'ssn_field', type:'ssn'}, {field:'has_ssn', desc:'has_ssn_field', default:'checked', type:'checkbox', enables:'ssn'}], 
            async (inst) => {

                if(!inst.response.has_ssn){
                    inst.next_tasks.push('manual_ssn_details');
                    inst.data.nossn = true;
                    return 'OK';
                }

                if(!isCorrectSsn(inst.response.ssn)){
                    inst.errmsg = 'invalid_ssn';
                    return 'RETRY';
                }


                inst.data.ssnResult = await validateSsn(inst.response.ssn);

                if(inst.data.ssnResult) {
                    if(app.userApi.findAccount({ssn:inst.data.ssnResult.ssn}))
                        inst.next_tasks.push('ssn_exists_forgot_details');
                    else
                        inst.next_tasks.push('check_ssn_details');
                } else
                    inst.next_tasks.push('manual_ssn_details');
                return 'OK';
            }, (inst) => {
                if(!createAccount(ctx, inst)) return 'RETRY';
                return 'OK'; 
            }
    );
    app.taskApi.create_task('check_ssn_details',
            [],[],
            app.taskApi.yesno(),
            async (inst) => {
                if(ok) 
                    inst.next_tasks.push('fill_user_details');
                else
                    inst.next_tasks.push('manual_ssn_details');

                return 'OK';
            });
    app.taskApi.create_task('manual_ssn_details'    //e.g. for people whose preferred gender, name, etc, don't match their ssn details, or for people with bad ssn.
            [],[],
            [],
            async (inst) => {
                return 'OK'; 
            });
    app.taskApi.create_task('ssn_exists_forgot_details' //info page before forgot_account
            [],[],
            [],
            async (inst) => {
                return 'OK'; 
            });
    app.taskApi.create_task('fill_user_details'     //for email, avatar, nickname & password
            [],[],
            [],
            async (inst) => {
                return 'OK'; 
            });
    app.taskApi.create_task('forgot_account_details'
            [],[],
            [],
            async (inst) => {
                return 'OK'; 
            });

}
