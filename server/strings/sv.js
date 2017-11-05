module.exports = (app) => {
    var s = app.stringApi.add_string.bind(null, 'sv');

    s('task.login.title','Logga in');
    s('task.login.title.active','Fortsätt logga in!');
    s('task.login.desc', 'Fyll i ditt konto och lösenord här så loggar vi in dig på direkten! ^_^');

    s('task.register_account.title','Skapa ett konto!');
    s('task.register_account.title.active','Fortsätt skapa konto!');
    s('task.register_account_ssn.title.active','Fortsätt skapa konto!');
    s('task.manual_ssn_details.title.active','Fortsätt skapa konto!');
    s('task.check_ssn_details.title.active', 'Fortsätt skapa konto!');
    s('task.ssn_exists_forgot_details.title.active', 'Fortsätt skapa konto!');
    s('task.fill_user_details.title.active', 'Fortsätt skapa konto!');

    s('task.register_account.desc', '!Tjohej och välkommen!\n((Aww yeah!)\nVi vill att det ska vara superlätt att registrera sig på Kodachikai, och därför har vi gjort den här nya, lite coolare registreringen!\n_Första steget!\nInnan vi kan börja så måste vi veta om du är svensk medborgare! För att vi ska kunna driva Kodachikai och Kodachicon så söker vi bidrag på olika sätt, bland annat genom Sverok Skåne och Lunds kommun. För att kunna söka de bidragen så måste vi visa vem som är med på våra aktiviteter, och för att det ska bli rätt så behöver vi personnummer från alla som deltar!\n_\nÄr du svensk medborgare?');
    s('task.register_account_ssn.desc','!Woot!\nSå trevligt! :D\nVälkommen till Kodachikai!');
    s('task.manual_ssn_details.desc','!Då gör vi det manuellt istället!\nAlrajt! Vi kunde inte hämta dina uppgifter automagiskt, så det betyder att vi måste fylla i dem för hand, men det löser vi!\n');
    s('task.check_ssn_details.desc', '!Eyy!\nNu ska vi se om dina uppgifter blivit rätt! Håller du med om att ditt namn är {ssnResult.basic.firstName} {ssnResult.basic.lastName} och att din adress är {ssnResult.basic.street}, {ssnResult.basic.zipCode} {ssnResult.basic.city}?');
    s('task.fill_user_details.desc', 'Nu ska du bara fylla i dina inloggningsuppgifter, sen är du en del av oss! :D');
    s('task.ssn_exists_forgot_details.desc', '!Whoops!\nDet finns redan ett konto för detta personnumret! Testa att logga in istället!');

    s('task.logout.title', 'Logga ut');
    s('task.logout.desc', 'Är du säker på att du vill logga ut?');

    s('input.ok.name', 'Ok!');
    s('input.yes.name', 'Ja!');
    s('input.cancel.name', 'Avbryt');
    s('input.no.name', 'Nej :(');
    s('input.ssn.name', 'Ditt personnummer');
    s('input.ssn.desc', 'Först behöver vi ditt personnummer!\nDet använder vi i föreningen för att söka bidrag när du besöker våra event, men också för att hämta ut dina kontaktuppgifter!');
    s('input.email.name', "Din email!");
    s('input.email_verify.name', "Din email, igen!");
    s('input.password.name', "Ditt lösenord!");
    s('input.password_verify.name', "En gång till!");
    s('input.givenName.name', "Vad heter du?");
    s('input.lastName.name', "Vilket är ditt efternamn?");
    s('input.street.name', "Din Hemadress?");
    s('input.zipCode.name', "Ditt postnummer?");
    s('input.country.name', "Vilket land bor du i?");
    s('input.city.name', "Din hemstad?");


    s('role.user', "Konventare");
    s('role.visitor', "Kodachiturist");
    s('role.admin', "Sajtmagiker");
    s('role.editor', "Sajtfifflare");

    s('input.has_ssn.name', 'Har du ett Svenskt personnummer?');


    s('input.email_or_ssn.name', "Ditt personnummer eller din mailadress!");
    s('input.email_or_ssn.desc', '');


    s('my-test-book', '!Yo\nDet är dags att bygga saker\n#\nLet\'s see what happens\n_\nBurning down the house!');
    


}
