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

    s('task.create_page.title', 'Skapa en sida');
    s('task.create_event.title', 'Skapa ett konvent');
    s('task.add_event_manager.title', 'Lägg till en event-admin');
    s('task.buy_tickets.title', 'Köp biljetter');
    s('task.buy_points.title', 'Köp poäng');

    s('task.staff_test.title', 'Jobba med Kodachicon!');
    s('task.join_staff.title', 'Påbörja en ny ansökan!');
    s('task.join_staff.title.active', 'Din pågående ansökan');
    s('task.join_staff.desc', '!Välkommen!\nDet finns många olika sätt att bli en del av Kodachicon! Förhoppningsvis ska du kunna hitta något som passar dig extraspecielltmycket bra!\n|\nVissa är intresserade av att sälja saker på en av våra försäljningsytor, som till exempel i vår jättetuffa Artist Alley!\n#\nAndra är mer intresserade av att vara med och bygga upp eventet i sig och bli en helt egen magisk del av Kodachicon!\n#\nSen finns det hjältar också som driver sina egna aktiviteter, såsom föreläsningar, workshops eller tävlingar!\n_\nVad skulle just du vilja göra på Kodachicon?');
    s('input.work_type.name', "Jag skulle vilja...");
    s('input.work_type.desc', "");
    s('input.value.create_team', "Skapa ett helt eget team på Kodachicon!");
    s('input.value.create_activity', "Arrangera en häftig aktivitet eller tävling!");
    s('input.value.create_shop', "Sälja saker!");
    s('input.value.work', "Jobba någonstans!");

    s('input.app_description.name', 'Din ansökan!');
    s('input.app_description.desc', 'Här berättar du för oss varför vi ska välja just dig till teamet!');
    s('input.can_cleanup_sunday.name', 'Kan du stanna till 1800 på söndag?');
    s('input.can_cleanup_sunday.desc', 'På söndagen är det jätteviktigt att alla är med och städar så att lokalerna blir återställda efter evenemanget! Kan du vara med och hjälpa till med städningen?');
    s('input.can_work_wednesday.name', 'Kan du vara med och ställa iordning på onsdag?');
    s('input.can_work_wednesday.desc', 'I vissa team är det jätteviktigt att du är med och hjälper till att förbereda konventet redan på onsdag! Då ses vi 17:00 och börjar ställa iordning allt inför öppningen på torsdag!');
    s('input.sleep_at_event.name', 'Planerar du sova på eventet?');
    s('input.sleep_at_event.desc', '');
    s('input.team.name', 'Vilket team vill du ansöka till?');
    s('input.team.desc', 'Alla är lika tuffa! ^_^');
    s('input.tshirt.name', 'Vilken tshirt-storlek behöver du?');
    s('input.tshirt.desc', '');
    s('input.event_description.name', 'Ge evenemanget en tuff beskrivning!');
    s('input.event_description.desc', '');
    s('input.event_name.name', 'Vad heter evenemanget?');
    s('input.event_name.desc', '');
    s('input.event_location.name', 'Var kommer evenemanget att pågå?');
    s('input.event_location.desc', '');
    s('input.ok.name', 'Ok!');
    s('input.ok.desc', '');
    s('input.yes.name', 'Ja!');
    s('input.yes.desc', '');
    s('input.cancel.name', 'Avbryt');
    s('input.cancel.desc', '');
    s('input.no.name', 'Nej :(');
    s('input.no.desc', '');
    s('input.id.name', 'Välj ett ID för objektet');
    s('input.id.desc', 'Ett ID är en kort och unik sträng utan specialtecken som utgör länken till sidan.');
    s('input.lang.name', 'Vilket språk är denna text på?');
    s('input.lang.desc', '');
    s('input.tagline.name', 'En cool tagline för eventet!');
    s('input.tagline.desc', 'För kodachicon är "Sveriges mysigaste konvent!" standard ^_^');

    s('input.title.name', 'En titel för artikeln!');
    s('input.title.desc', '');
    s('input.publish.name', 'När ska evenemanget publiceras för besökare?');
    s('input.publish.desc', '');
    s('input.ends.name', 'När evenemanget slutar');
    s('input.ends.desc', '');
    s('input.starts.name', 'När evenemanget börjar');
    s('input.starts.desc', '');
    s('input.access.name', 'Välj accessnivå');
    s('input.access.desc', 'Markera alla användargrupper som ska ha tillgång till detta');
    s('input.user.name', 'Vilka användare berörs av detta?');
    s('input.user.desc', '');
    s('input.ssn.name', 'Ditt personnummer');
    s('input.ssn.desc', 'Först behöver vi ditt personnummer!\nDet använder vi i föreningen för att söka bidrag när du besöker våra event, men också för att hämta ut dina kontaktuppgifter!');
    s('input.email.name', "Din email!");
    s('input.email_verify.name', "Din email, igen!");
    s('input.email.desc', "På denna adressen kontaktar vi dig till och från när det händer saker här på hemsidan, för att skicka ut biljetter, och annat viktigt som har med dig och Kodachikai att göra!");
    s('input.email_verify.desc', "Skriv in den en gång extra så att det säkert blir rätt!");
    s('input.password.name', "Ditt lösenord!");
    s('input.password.desc', "Skriv in ditt helt egna jättecoola lösenord");
    s('input.password_verify.name', "En gång till!");
    s('input.password_verify.desc', "Skriv in ditt lösenord en gång till, så att det säkert blev rätt!");
    s('input.givenName.name', "Vad heter du?");
    s('input.givenName.desc', "");
    s('input.nickname.name', "Vad vill du att vi ska kalla dig? ^_^");
    s('input.nickname.desc', "Ditt namn, smeknamn, en cool titel, eller något helt annat som du känner passar dig bäst när vi ska prata med dig!");
    s('input.lastName.name', "Vilket är ditt efternamn?");
    s('input.lastName.desc', "");
    s('input.street.name', "Din Hemadress?");
    s('input.zipCode.name', "Ditt postnummer?");
    s('input.country.name', "Vilket land bor du i?");
    s('input.city.name', "Din hemstad?");
    s('input.street.desc', "");
    s('input.zipCode.desc', "");
    s('input.country.desc', "");
    s('input.city.desc', "");


    s('role.user', "Konventare");
    s('role.visitor', "Kodachiturist");
    s('role.staff', "Arbetsmyra");
    s('role.admin', "Sajtmagiker");
    s('role.editor', "Sajtfifflare");
    s('role.base_budget', "Budgetkrånglare");
    s('role.base_admin', "Eventmagiker");

    s('input.has_ssn.name', 'Har du ett Svenskt personnummer?');


    s('payson.buy.tickets', 'Dina biljetter till Kodachicon!');
    s('payson.buy.points', 'Dina Kodachicon-poäng!');


    s('input.email_or_ssn.name', "Ditt personnummer eller din mailadress!");
    s('input.email_or_ssn.desc', '');


    s('task.staff_test.desc', "!Innan du börjar!\nTjohej och välkommen in i värmen! I Kodachikai är vi jättenoga med att allt ska vara trevligt och mysigt för alla som är med på våra aktiviteter. Därför har vi ett liiiiitet test som alla som vill arbeta på något av våra evenemang måste lösa innan de får delta!");
    s('input.stafftest_q1.name', "");
    s('input.stafftest_q1.desc', "!Fråga ett!\nNär du pratar om någon du inte känner med någon på en av våra evenemang, vilket pronomen ska du använda?");
    s('input.stafftest_q2.name', "");
    s('input.stafftest_q2.desc', "!Fråga två!\nDu upptäcker att det brinner på konventet! Vad är det första du ska göra?");
    s('input.stafftest_q3.name', "");
    s('input.stafftest_q3.desc', "!Fråga tre!\nOm någonting har hänt på konventet, vem är det du ska berätta detta för så att det blir löst så effektivt som möjligt?");
    
    s('stafftest.answer_them', 'De/dem');
    s('stafftest.answer_he', 'Han');
    s('stafftest.answer_she', 'Hon');
    s('stafftest.answer_the_person', 'Personen');

    s('stafftest.answer_save', 'Hjälpa personer i akut fara');
    s('stafftest.answer_warn', 'Varna folk i omgivningen');
    s('stafftest.answer_phone', 'Ringa 112');
    s('stafftest.answer_leave', 'Lämna platsen');
    s('stafftest.answer_put_out', 'Släcka elden!');

    s('stafftest.answer_friends', 'Mina vänner!');
    s('stafftest.answer_boss', 'Min chef!');
    s('stafftest.answer_linus', 'Linus!');
    s('stafftest.answer_team', 'Mitt team!');


    s('list.list_team.title', 'Mitt team!');
    s('list.tasks.title', 'TEST-lista TA BORT');
    s('list.list_articles.title', "Artiklar");

}
