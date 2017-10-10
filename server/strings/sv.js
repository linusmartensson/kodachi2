module.exports = (app) => {
    var s = app.stringApi.add_string.bind(null, 'sv');

    s('task.login.title','Logga in');
    s('task.login.title.active','Fortsätt logga in!');
    s('task.login.desc', 'Fyll i ditt konto och lösenord här så loggar vi in dig på direkten! ^_^');

    s('task.register_account.title','Skapa ett konto!');
    s('task.register_account.title.active','Fortsätt skapa konto!');
    s('task.register_account.desc', '!Tjohej och välkommen!\n((Aww yeah!)\nVi vill att det ska vara superlätt att registrera sig på Kodachikai, och därför har vi gjort den här nya, lite coolare registreringen!');

    s('input.ok.name', 'Ok!');
    s('input.cancel.name', 'Avbryt');
    s('input.ssn.name', '');
    s('input.ssn.desc', 'Först behöver vi ditt personnummer!\nDet använder vi i föreningen för att söka bidrag när du besöker våra event, men också för att hämta ut dina kontaktuppgifter!');

    s('input.email_or_ssn.desc', '');


    s('my-test-book', '!Yo\nDet är dags att bygga saker\n#\nLet\'s see what happens\n|\nBurning down the house!');
    


}
