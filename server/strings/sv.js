module.exports = (app) => {
    const s = app.stringApi.add_string.bind(null, "sv");

    s("task.crew_checkin_verify.desc", "Checkar in {user.nickname}!\nÖnskat T-Shirt i {tshirt}.\nKommer onsdag: {{wednesday}}\nLovat att städa på söndag: {{sunday}}\nSover på plats: {{sleep}}");

    s("list.auto.row.badge_generator", "@(/img/kodachicon_new.png)\n!{u.nickname}\n#\nTorsdag - Frukost | Middag\nFredag - Frukost | Middag\nLördag - Frukost | Middag\nSöndag - Frukost\n_\nMia, allt: 0703 - 74 96 09\nSara, lite till: 0727 - 15 23 33\nVid nödfall, ring 112\n#\nÖppettider\nEndagsbesökare: 08.00-02.00\nInfo & Garderob: 08.00-22.00\nKiosken: 08.00-02.00\nFrukost 08.00-10.00");

    s("fri", "Fredag");
    s("input.access.desc", "Markera alla användargrupper som ska ha tillgång till detta");
    s("input.access.name", "Välj accessnivå");
    s("input.act_available_days.desc", "Nästa steg är att beskriva vilka dagar din aktivitet har möjlighet att pågå, eller kommer att vara på plats under eventet. Detta blir input till schemaläggningen.");
    s("input.act_available_days.name", "Vilka dagar kommer du att ha möjlighet att arrangera aktiviteten?");
    s("input.act_available_times.desc", "Nu markerar du de tillfällen då du har möjlighet att vara på plats och driva din aktivitet. Detta blir input till schemaläggningen.");
    s("input.act_available_times.name", "Vilka tider kommer du ha möjlighet att arrangera aktiviteten?");
    s("input.act_budget.desc", "Nu kommer då den kritiska frågan! För att vi ska kunna bestämma om vi har råd att arrangera just din aktivitet eller inte, så måste vi veta hur mycket pengar du behöver för att få dina planer att gå ihop! Här räknar du in allt utom personalkostnader! Inköp, reskostnader, gage och tävlingspriser och allt annat som du kan komma på (och som Kodachicon ska stå för!) slår du ihop och avrundar till närmaste tusenlapp!\nVissa behöver bara några människor på plats för att fungera och då skriver du 0, andra behöver hyra in en hel cirkustrupp, och då blir summan större!");
    s("input.act_budget.name", "Hur mycket pengar behövs?");
    s("input.act_description.desc", "Här beskriver du din aktivitet! Detta kommer att synas för både besökare och personal, och blir en del av underlaget för att vi ska kunna besluta om din aktivitet platsar på eventet eller inte!\nTänk dig att du ska få oss att tycka det skulle bli kul att delta eller besöka er så är du på rätt spår!");
    s("input.act_description.name", "Beskriv din aktivitet! Detta kommer att synas för besökare och i din ansökan!");
    s("input.act_format.desc", "Här väljer du om denna aktiviteten är en tävling, eller en annan typ av aktivitet. Om du är osäker på vad det är du arrangerar, så tänk såhär: Alla tävlingar utser en vinnare!");
    s("input.act_format.name", "Är detta en aktivitet eller en tävling?");
    s("input.act_image.desc", "!Nu behöver vi en bild!\nDenna bilden kommer att synas för besökare som vill se vad ni håller på med! Se till att den är COOL, det är jätteviktigt!\nBilden kommer att vara lika bred som denna rutan och max 300 pixlar hög, så skicka inte en för liten bild, och se gärna till att den är liggande, till exempel som en banner!");
    s("input.act_image.name", "Ladda upp en bild!");
    s("input.act_length.desc", "Sen är det då dags att bestämma sig för hur länge er aktivitet pågår. Vissa kör en hel dag, andra håller bara på en kvart!");
    s("input.act_length.name", "Hur lång är aktiviteten?");
    s("input.act_name.desc", "Det största och viktigaste steget när du skapar en aktivitet på våra evenemang är såklart att bestämma vad den ska heta! Välj något snappy och tufft!");
    s("input.act_name.name", "Vad heter din aktivitet?");
    s("input.act_needs_uniform.desc", "Ställ dig en viktig fråga! Behöver er aktivitet uniformer? För de flesta så kommer svaret att vara nej. Anordnar du exempelvis en föreläsning eller en tävling så tycker vi att det är bättre att du är klädd så att det passar vad du håller på med, men det finns såklart undantag!");
    s("input.act_needs_uniform.name", "Behöver ni kodachicon-tröjor?");
    s("input.act_participants.desc", "Bestäm dig för hur många som kommer att kunna delta i er aktivitet! För en tävling så avgör detta hur många som kan anmäla sig!");
    s("input.act_participants.name", "Hur många har möjlighet att delta?");
    s("input.act_size.desc", "Här fyller du i hur många som ska vara med och jobba med din aktivitet, inklusive dig själv såklart! Kortare och mindre aktiviteter har ofta färre i personal, storslagna tävlingar kan ibland vara lite fler, men det finns undantag åt båda hållen såklart!");
    s("input.act_size.name", "Hur många ska jobba i aktivieteten? (inklusive dig själv!)");
    s("input.app_description.desc", "Här berättar du för oss varför vi ska välja just dig till teamet!");
    s("input.app_description.name", "Din ansökan!");
    s("input.budget_type.desc", "", true);
    s("input.budget_type.name", "Namnge den nya budgetposten");
    s("input.can_cleanup_sunday.desc", "På söndagen är det jätteviktigt att alla är med och städar så att lokalerna blir återställda efter evenemanget! Kan du vara med och hjälpa till med städningen?");
    s("input.can_cleanup_sunday.name", "Kan du stanna till 1800 på söndag?");
    s("input.can_work_wednesday.desc", "I vissa team är det jätteviktigt att du är med och hjälper till att förbereda konventet redan på onsdag! Då ses vi 17:00 och börjar ställa iordning allt inför öppningen på torsdag!");
    s("input.can_work_wednesday.name", "Kan du vara med och ställa iordning på onsdag?");
    s("input.cancel.desc", "", true);
    s("input.cancel.name", "Avbryt");
    s("input.category.desc", "Ge ett namn på kategorin denna personen har vunnit i!");
    s("input.category.name", "Vilken kategori har du en vinnare i?");
    s("input.city.name", "Din hemstad?");
    s("input.competition.desc", "Först fyller du i vilken av dina tävlingar du rapporterar in resultat för, såklart. ^_^");
    s("input.competition.name", "Vilken tävling gäller det?");
    s("input.content.name", "Skriv din artikel! ^_^");
    s("input.country.name", "Vilket land bor du i?");
    s("input.email.desc", "På denna adressen kontaktar vi dig till och från när det händer saker här på hemsidan, för att skicka ut biljetter, och annat viktigt som har med dig och Kodachikai att göra!");
    s("input.email.name", "Din email!");
    s("input.email_or_ssn.name", "Ditt personnummer eller din mailadress!");
    s("input.email_text.name", "Författa ett awesome email");
    s("input.email_topic.name", "Ämne");
    s("input.email_verify.desc", "Skriv in den en gång extra så att det säkert blir rätt!");
    s("input.email_verify.name", "Din email, igen!");
    s("input.emergencyphone.name", "Telefonnummer till någon vi kan kontakta om det händer dig något (Bara siffror!)");
    s("input.ends.name", "När evenemanget slutar");
    s("input.event.name", "Är artikeln specifik för detta eventet?");
    s("input.event_description.name", "Ge evenemanget en tuff beskrivning!");
    s("input.event_location.name", "Var kommer evenemanget att pågå?");
    s("input.event_name.name", "Vad heter evenemanget?");
    s("input.givenName.name", "Vad heter du?");
    s("input.group.name", "Vilken budget ska kvittot in under?");
    s("input.has_ssn.name", "Har du ett Svenskt personnummer?");
    s("input.id.desc", "Ett ID är en kort och unik sträng utan specialtecken som utgör länken till sidan.");
    s("input.id.name", "Välj ett ID för objektet");
    s("input.image.name", "Ladda upp en tydlig och läslig bild på hela ditt kvitto!");
    s("input.lang.name", "Vilket språk är denna text på?");
    s("input.lastName.name", "Vilket är ditt efternamn?");
    s("input.limit.name", "Vad är kostnadsgränsen för denna budgetpost?");
    s("input.nickname.desc", "Ditt namn, smeknamn, eller något helt annat som du känner passar dig unikt bra när vi ska prata med dig! Detta namnet kommer vi använda överallt på sajten för att kommunicera med dig! Försök att inte göra det för långt!");
    s("input.nickname.name", "Vad vill du att vi ska kalla dig? ^_^");
    s("input.no.desc", "", true);
    s("input.no.name", "Nej :(");
    s("input.ok.desc", "", true);
    s("input.ok.name", "Ok!");
    s("input.unknown", "Okänt");
    s("input.password.desc", "Skriv in ditt helt egna jättecoola lösenord!");
    s("input.password.name", "Ditt lösenord!");
    s("input.password_verify.desc", "Skriv in ditt lösenord en gång till, så att det säkert blev rätt!");
    s("input.password_verify.name", "En gång till!");
    s("input.phone.name", "Ditt telefonnummer! ^_^");
    s("input.points.name", "Hur många poäng vill du köpa?");
    s("input.publish.name", "När ska evenemanget publiceras för besökare?");
    s("input.purchase.name", "Vad var köpet för?");
    s("input.shop_available_days.name", "Vilka dagar har butiken möjlighet att vara öppen?");
    s("input.shop_description.name", "Beskriv din butik!");
    s("input.shop_image.name", "Ladda upp en butiksbild!");
    s("input.shop_name.name", "Vad heter butiken?");
    s("input.shop_size.name", "Hur många kommer att jobba på plats? (inklusive dig själv!)");
    s("input.shop_tables.name", "Hur många bord behöver ni?");
    s("input.shop_type.name", "Planerar du stå i Artist Alley eller försäljningen?");
    s("input.shop_type.desc", "", true);
    s("input.sleep.name", "Hur många sovplatser vill du köpa?");
    s("input.sleep_at_event.name", "Planerar du sova på eventet?");
    s("input.sleep_ticket.name", "Planerar du sova på eventet?\nUtan sovplats blir priset 300kr.\nMed sovplats blir det 450kr.");

    s('input.sleep_ticket.desc', '', true);
    s('task.fast_account.desc', 'Här skapar du konto och säljer biljett till en person som har publikt svenskt personnummer! Detta är nästan alla svenska medborgare som är 16 eller äldre!\nNär du trycker OK nedan så sparas biljetten om alla fält är ifyllda korrekt! Se till att du tagit betalt!');
    s('task.fast_account.title', 'Skapa konto och köp biljett');
    s('task.fast_account.title.active', 'Fortsätt skapa & sälja');

    s('input.has_account.desc', '', true)
    s('input.has_account.name', 'Har konto')
    s('input.no_ssn.desc', '', true)
    s('input.no_ssn.name', 'Inget personnummer / under 16')
    s('input.no_account.desc', '', true)
    s('input.no_account.name', 'Har Personnummer & 16+')


    s('task.fast_buy.desc', 'Dags för en besökare att köpa biljett! Rätt knapp ger snabbare registrering!\n!Viktigt!\nTänk på att förklara för personen att denne blir medlem i föreningen Kodachikai när de köper biljett, och att de kan komma att få något email från föreningen (det går såklart att avregistrera sig!)')
    s('task.fast_buy.title', 'Sälj biljett')
    s('task.fast_buy.title.active', 'Sälja biljett', true)

    s('task.fast_pay.desc', 'Här säljer du en biljett till en person som redan har konto!\nNär du trycker OK nedan så sparas biljetten om alla fält är ifyllda korrekt! Se till att du tagit betalt!')
    s('task.fast_pay.title', 'Sälja biljett')

    s('task.fast_no_ssn.desc', 'Här skapar du konto och säljer biljett till en person som saknar konto, och inte har ett publikt svenskt personnummer.\nNär du trycker OK nedan så sparas biljetten om alla fält är ifyllda korrekt! Se till att du tagit betalt!')
    s('task.fast_no_ssn.title', 'Sälja biljett')



    s("input.ssn.desc", "Först behöver vi ditt personnummer!\nDet använder vi i föreningen för att söka bidrag när du besöker våra event, men också för att hämta ut dina kontaktuppgifter!");
    s("input.ssn.name", "Ditt personnummer");
    s("input.stafftest_q1.desc", "!Fråga ett!\nNär du pratar om någon du inte känner med någon på en av våra evenemang, vilket pronomen ska du använda?");
    s("input.stafftest_q1.name", "", true);
    s("input.stafftest_q2.desc", "!Fråga två!\nDu upptäcker att det brinner på konventet! Vad är det första du ska göra?");
    s("input.stafftest_q2.name", "", true);
    s("input.stafftest_q3.desc", "!Fråga tre!\nOm någonting har hänt på konventet, vem är det du ska berätta detta för så att det blir löst så effektivt som möjligt?");
    s("input.stafftest_q3.name", "", true);
    s("input.starts.name", "När evenemanget börjar");
    s("input.street.name", "Din Hemadress?");
    s("input.tagline.desc", "För kodachicon är \"Sveriges mysigaste konvent!\" standard ^_^");
    s("input.tagline.name", "En cool tagline för eventet!");
    s("input.team.desc", "Alla är lika tuffa! ^_^");
    s("input.team.name", "Vilket team vill du ansöka till?");
    s("input.team_budget.desc", "Nu kommer då den kritiska frågan! För att vi ska kunna bestämma om vi har råd att arrangera just ditt superteam eller inte, så måste vi veta hur mycket pengar du behöver för att få just dina planer att gå ihop! Här räknar du in allt utom personalkostnader! Inköp, reskostnader, gage och tävlingspriser och allt annat som du kan komma på (och som Kodachicon ska stå för!) slår du ihop och avrundar till närmaste tusenlapp!\nVissa team behöver bara personal för att fungera och då skriver du 0, andra team behöver hyra in en hel cirkustrupp, och då blir summan större!");
    s("input.team_budget.name", "Hur mycket pengar behövs?");
    s("input.team_description.desc", "Nästa steg är att ge ditt team en beskrivning. Denna beskrivningen är underlag för om vi kommer att acceptera teamet eller inte, och kommer att synas både för besökare och i samband med att folk ska ansöka till ditt team.\nUndvik att gå in på detalj i vad som krävs för att vara med i teamet, fokusera istället på vad ni håller på med och varför ni är bäst! ^_^");
    s("input.team_description.name", "Beskriv teamet!");
    s("input.team_image.desc", "!Nu behöver vi en bild!\nDenna bilden kommer att synas för besökare som vill se vad ni håller på med! Se till att den är COOL, det är jätteviktigt!\nBilden kommer att vara lika bred som denna rutan och max 300 pixlar hög, så skicka inte en för liten bild, och se gärna till att den är liggande!");
    s("input.team_image.name", "En tuff bild!");
    s("input.team_name.desc", "Ge ditt team ett namn! Gör det kort och snitsigt, alla kommer att se det!");
    s("input.team_name.name", "Vad ska teamet heta?");
    s("input.team_needs_uniform.desc", "Til sist då kommer frågan om ert team behöver Kodachicon-tröjor. Vissa team har en egen uniform eller känner av någon annan anledning inte att de ska ha på sig våra Kodachicon-tshirts, och för att budgeten ska gå ihop behöver vi också ta hänsyn till om ditt team behöver tröjor eller inte!");
    s("input.team_needs_uniform.name", "Behöver ni tröjor?");
    s("input.team_open.desc", "Det är inte alla team som jobbar alltid! Vissa är aktiva dagtid, andra på eftermiddagen. När planerar du för att ert team ska vara aktivt?");
    s("input.team_open.name", "När har ni öppet?");
    s("input.team_schedule.desc", "Vi fortsätter! Nu behöver vi ha koll på vilka dagar ditt team kommer att vara aktivt för att bestämma oss för hur mycket resurser vi ska prioritera.");
    s("input.team_schedule.name", "Vilka dagar jobbar teamet?");
    s("input.team_booked.name", "", true);
    s("input.team_booked.desc", "Om några av dina platser är förbokade, fyll i antalet förbokade platser nedan, så dyker dessa platserna inte upp på ansökningssidan. (Tänk på att du själv också tar upp en plats som inte är förbokad)");
    s("input.act_booked.name", "", true);
    s("input.act_booked.desc", "Om några av dina platser är förbokade, fyll i antalet förbokade platser nedan, så dyker dessa platserna inte upp på ansökningssidan. (Tänk på att du själv också tar upp en plats som inte är förbokad)");
    s("input.shop_booked.name", "", true);
    s("input.shop_booked.desc", "Om några av dina platser är förbokade, fyll i antalet förbokade platser nedan, så dyker dessa platserna inte upp på ansökningssidan. (Tänk på att du själv också tar upp en plats som inte är förbokad)");

    s("input.team_size.desc", "Vi behöver ha reda på hur många som kommer att vara med i ditt team, inklusive dig själv!\n#\nDetta påverkar vår budget, en extra team-medlem som närvarar alla fem dagar kostar mellan 650 och 1000kr!\n_\nFundera genom teamets behov, strama åt lite, och sätt en gräns du är nöjd med, så försöker vi lösa det!");
    s("input.team_size.name", "Hur många ska vara med i ditt team? (inklusive dig själv!)");
    s("input.tickets.name", "Hur många biljetter vill du köpa?");
    s("input.title.name", "En titel för artikeln!");
    s("input.tshirt.name", "Vilken tshirt-storlek behöver du?");
    s("input.type.desc", "", true);
    s("input.type.name", "Vilken typ av manager vill du lägga till?");
    s("input.user.name", "Vilka användare berörs av detta?");
    s("input.value.afternoon", "På eftermiddagen, 14-18");
    s("input.value.create_activity", "Arrangera en aktivitet");
    s("input.value.create_shop", "Driva en försäljningsyta");
    s("input.value.create_team", "Arrangera ett team");
    s("input.value.day", "Dagtid, 10-14");
    s("input.value.early", "Före öppning, 06-08");
    s("input.value.evening", "Framåt kvällen, 18-23");
    s("input.value.fri", "Fredag");
    s("input.value.morning", "Precis efter öppning, 08-10");
    s("input.value.night", "Nattetid, 23-03");
    s("input.value.sat", "Lördag");
    s("input.value.sun", "Söndag");
    s("input.value.thu", "Torsdag");
    s("input.value.until_sunrise", "Fram till soluppgången, 03-06");
    s("input.value.wed", "Onsdag");
    s("input.value.work", "Ansöka till Kodachicrew");
    s("input.work_type.name", "Jag skulle vilja...");
    s("input.yes.desc", "", true);
    s("input.yes.name", "Ja!");
    s("input.zipCode.name", "Ditt postnummer?");
    s("list.all_tickets.title", "Köpta biljetter");
    s("list.list_articles.title", "Artiklar");
    s("list.purchases.sleepText", "Detta är dina sovsalsplatser! Du behöver normalt sett bara en plats, så flytta över resten till dina kompisar. ^_^");
    s("list.purchases.ticketText", "Detta är dina evenemangsbiljetter! En biljett används upp när du checkar in. Glöm inte att flytta över alla extra biljetter till de som ska ha dem!");
    s("list.show_activities.times", "Öppetdagar");
    s("list.list_activities.title", "Aktiviteter!");
    s("list.list_shops.title", "Butiker!");
    s("list.list_teams.title", "Team!");
    s("list.admin_budget.title", "Visa kvitton");
    s("list.show_team.title", "Mitt team!");
    s("list.tasks.title", "TEST-lista TA BORT");
    s("list.tickets.title", "Dina biljetter!");
    s("payson.buy.points", "Dina Kodachicon-poäng!");
    s("payson.buy.tickets", "Dina biljetter till Kodachicon!");
    s("role.admin", "Sajtmagiker");
    s("role.base_vendor_admin", "Butiksbärsärkare");
    s("role.base_artist_alley_admin", "Konstnärsshaman");
    s("role.base_admin", "Eventspaladin");
    s("role.base_entrance", "Nyckelmästare");
    s("role.base_budget", "Budgetkrånglare");
    s("role.editor", "Sajtfifflare");
    s("role.base_team_member", "Kodachicreware");
    s("role.vendor", "Försäljare");
    s("role.artist", "Konstnär");
    s("role.activiteer", "Lekmästare");
    s("role.user", "Nyfiken");
    s("role.visitor", "Konventare");
    s("sat", "Lördag");
    s("stafftest.error.the_person", "Njäääe! Det är helst inte så vi ska benämna folk vi inte känner på konvent!");
    s("stafftest.error.save", "Inte riktigt! Det finns en sak som är absolut viktigare än allt annat om det brinner!");
    s("stafftest.error.the_boss", "Faktiskt inte! Det är bara en person du ska prata med om något strular på våra evenemang!");

    s("stafftest.answer_boss", "Min chef!");
    s("stafftest.answer_friends", "Mina vänner!");
    s("stafftest.answer_he", "Han");
    s("stafftest.answer_leave", "Lämna platsen");
    s("stafftest.answer_linus", "Mia!");
    s("stafftest.answer_phone", "Ringa 112 när jag är i säkerhet utomhus");
    s("stafftest.answer_put_out", "Släcka elden om det känns säkert!");
    s("stafftest.answer_save", "Hjälpa personer i akut fara, men utan att utsätta mig för risk!");
    s("stafftest.answer_she", "Hon");
    s("stafftest.answer_team", "Mitt team!");
    s("stafftest.answer_the_person", "Personen");
    s("stafftest.answer_them", "De/dem");
    s("stafftest.answer_warn", "Varna folk i omgivningen, sen lämna platsen");
    s("sun", "Söndag");
    s("task.accept_receipt.desc", "Ditt kvitto för {receipt.purchase} på totalt {receipt.total} kr har godkänts och kommer att betalas ut!");
    s("task.accept_receipt.title", "Godkänt kvitto!");
    s("task.add_event_manager.title", "Lägg till en event-admin");
    s("task.check_ssn_details.desc", "!Eyy!\nNu ska vi se om dina uppgifter blivit rätt! Stämmer det att namnet du är folkbokförd som är {ssnResult.basic.firstName} {ssnResult.basic.lastName} och att din adress är {ssnResult.basic.street}, {ssnResult.basic.zipCode} {ssnResult.basic.city}?");
    s("task.check_ssn_details.title.active", "Fortsätt skapa konto!");
    s("task.create_activity.title", "Skapa en aktivitet!");
    s("task.create_event.title", "Skapa ett konvent");
    s("task.create_shop.title", "Skapa din butik!");
    s("task.create_team.title", "Skapa ditt team!");
    s("task.deny_application.title", "Din ansökan har nekats. :c");
    s("task.deny_receipt.title", "Din kvittoutbetalning har nekats.");
    s("task.error.emptyFields", "Du har glömt att fylla i några av fälten! Fixa det och testa igen!");
    s("task.fill_user_details.desc", "Nu ska du bara fylla i dina inloggningsuppgifter, sen är du en del av oss! :D");
    s("task.fill_user_details.title.active", "Fortsätt skapa konto!");
    s("task.forgot_account_details.title.active", "Glömda kontouppgifter?");
    s("task.join_staff.desc", "!Välkommen!\nDet finns många olika sätt att bli en del av Kodachicon! Förhoppningsvis ska du kunna hitta något som passar dig extraspecielltmycket bra!\n|\nVissa är intresserade av att sälja saker på en av våra försäljningsytor, som till exempel i vår jättetuffa Artist Alley!\n#\nAndra är mer intresserade av att vara med och bygga upp eventet i sig och bli en helt egen magisk del av Kodachicon!\n#\nSen finns det hjältar också som driver sina egna aktiviteter, såsom föreläsningar, workshops eller tävlingar!\n_\nVad skulle just du vilja göra på Kodachicon?");
    s("task.join_staff.title", "Påbörja en ansökan!");
    s("task.join_staff.title.active", "Din pågående ansökan");
    s("task.login.desc", "Fyll i din email (eller ditt personnummer) och ditt lösenord här så loggar vi in dig på direkten! ^_^");
    s("task.login.title.active", "Fortsätt logga in!");
    s("task.logout.desc", "#Logga ut\nÄr du säker på att du vill logga ut?");
    s("task.manual_ssn_details.desc", "\nAlrajt! Vi kunde inte hämta dina uppgifter automagiskt, så det betyder att vi måste fylla i dem för hand, men det löser vi!\nNär du blir medlem i Kodachikai samlar vi in dehär uppgifterna för att kunna söka bidrag för våra evenemang och föreningsaktiviteter, så att det är rätt ifyllt är jätteviktigt för oss! För att allt ska bli bra så hoppas vi att ni är jättenoga!");
    s("task.manual_ssn_details.title.active", "Fortsätt skapa konto!");
    s("task.new_competitor.desc", "Wohoo! Det är en ny tävlande med i {competition.name}!");
    s("task.new_competitor.title", "Ny tävlande!");
    s("task.register_account.desc", "!Tjohej och välkommen!\nVi vill att det ska vara superlätt att registrera sig på Kodachikai, och därför har vi gjort den här nya, lite coolare registreringen!\n_Första steget!\nInnan vi kan börja så måste vi veta om du är svensk medborgare! För att vi ska kunna driva Kodachikai och Kodachicon så söker vi bidrag på olika sätt, bland annat genom Sverok Skåne och Lunds kommun. För att kunna söka de bidragen så måste vi visa vem som är med på våra aktiviteter, och för att det ska bli rätt så behöver vi personnummer från alla som deltar!\n_\nÄr du svensk medborgare?");
    s("task.register_account.title", "Skapa ett konto!");
    s("task.register_account.title.active", "Fortsätt skapa konto!");
    s("task.register_account_ssn.desc", "!Woot!\nSå trevligt! :D\nVälkommen till Kodachikai!");
    s("task.register_account_ssn.title.active", "Fortsätt skapa konto!");
    s("task.review_team.title.active", "Reviewa teamförslag");
    s("task.review_team_application.title.active", "Reviewa gruppansökan");
    s("task.ssn_exists_forgot_details.desc", "!Whoops!\nDet finns redan ett konto för detta personnumret! Testa att logga in istället!");
    s("task.ssn_exists_forgot_details.title.active", "Fortsätt skapa konto!");
    s("task.staff_test.desc", "!Innan du börjar!\nTjohej och välkommen in i värmen! I Kodachikai är vi jättenoga med att allt ska vara trevligt och mysigt för alla som är med på våra aktiviteter. Därför har vi ett liiiiitet test som alla som vill arbeta på något av våra evenemang måste lösa innan de får delta!");
    s("task.staff_test.title", "Jobba med Kodachicon!");
    s("task.upload_receipt.title", "Ladda upp kvitto");
    s("thu", "Torsdag");
    s("wed", "Onsdag");
    s("input.lastName.desc", "", true);
    s("input.account_no.name", "Ditt kontonummer");
    s("input.clearing_no.name", "Ditt clearingnummer");
    s("input.account_no.desc", "Här fyller du i ditt kontonummer för betalningen");
    s("task.accept_application.desc", "Så coolt! Din ansökan om {application.name} har godkänts! Nu har du en helt egen grej på eventet! I menyn till vänster har du eventuellt lite kvar att fylla i innan du är klar, men nu är vi på gång! Grattis!");
    s("task.accept_application.title", "Din ansökan godkändes!");
    s("task.add_budgetgroup.desc", "Här lägger du in nya budgetgrupper som kan användas för att betala kvitton på eventet");
    s("task.add_budgetgroup.title", "Lägg till budgetpost");
    s("task.add_event_manager.desc", "Lägg in nya eventarrangörer. Dessa får en massa extra powers på eventet, och kommer att kunna se mycket av vad som händer för alla arrangörer inom sitt specifika område.");
    s("task.assign_location.desc", "Detta är en påminnelse! Du har ett ansvar att tilldela en plats till {application.name}! Tryck *inte* på OK förrän detta är färdigt, då försvinner påminnelsen permanent!");
    s("task.schedule_activity.desc", "Detta är en påminnelse! Du har ett ansvar att tilldela plats och schema till {application.name}! Tryck *inte* på OK förrän detta är färdigt, då försvinner påminnelsen permanent!");
    s("task.change_password.title", "Fortsätt byta lösenord");
    s("task.change_password.desc", "Här byter du lösenord. ^_^\nSe till att det är superhemligt och att du minns det!");
    s("task.assign_location.title", "Tilldela plats till team!");
    s("task.fill_user_details.title", "Fortsätt skapa konto");
    s("task.forgot_account_details.title", "Glömt kontouppgifter?");
    s("task.goto_payson.title", "Fortsätt betalning");
    s("task.join_work.title", "Fortsätt med din ansökan");
    s("task.login.title", "Logga in");
    s("task.logout.title", "Logga ut");
    s("task.join_competition.title", "Gå med i en tävling!");
    s("task.buy_points.title", "Köp poäng");
    s("task.buy_tickets.title", "Köp biljetter");
    s("task.check_ssn_details.title", "Fortsätt skapa konto");
    s("task.create_page.title", "Skapa en sida");
    s("task.create_page.title.active", "Fortsätt skapa en sida");
    s("task.email_team.title", "Maila ditt team!");
    s("input.clearing_no.desc", "Och här fyller du i clearingnummer!");
    s("task.buy_points.desc", "Här kan du köpa poäng! Poäng är just nu helt oanvändbara, men kommer i framtiden att kunna användas för att köpa saker på våra evenemang!");
    s("task.buy_tickets.desc", "Här! Den viktigaste sidan på hela kodachi.se! Här köper du biljetter och blir en del av gemenskapen! Välkommen!");
    s("task.error.filterFailure", "Du har fyllt i ett av fälten konstigt! :o");
    s("task.pay_receipt.title", "Betala ut kvitto");
    s("task.create_activity.desc", "Nu gäller det! Sätt ihop världens bästa ansökan och bli en del av gemenskapen!");
    s("task.create_team.desc", "Nu gäller det! Sätt ihop världens bästa ansökan, skapa ett helt eget team, och gör något ingen gjort förr!");
    s("task.create_shop.desc", "Nu gäller det! Här sätter du ihop världens bästa presentation, så att alla blir superpigga på att besöka din häftiga butik!");
    s("task.create_event.desc", "Det är här admins skapar helt nya event. ^_^");
    s("task.manual_ssn_details.title", "Fortsätt skapa konto!");
    s("task.purchase_complete.desc", "Gratulerar! Ditt köp lyckades! :D");
    s("task.purchase_complete.title", "Ditt inköp lyckades!");
    s("task.purchase_failed.desc", "Tjo! Något hände på vägen och ditt köp kunde inte gå genom! Om det inte var meningen, så prova en gång till!");
    s("task.purchase_failed.title", "Ditt köp misslyckades :c");
    s("input.city.desc", "", true);
    s("input.content.desc", "", true);
    s("input.email_or_ssn.desc", "", true);
    s("input.email_text.desc", "", true);
    s("input.email_topic.desc", "", true);
    s("input.emergencyphone.desc", "Ibland sker det olyckor, och då räcker det inte alltid med bara ditt eget telefonnummer för att vi ska kunna hjälpa till. Därför ber vi dig att skriva in ett extra nummer här till en familjemedlem eller annan närstående som vi kan kontakta om det skulle behövas. Tänk på att detta fältet bara får innehålla siffror och plus!");
    s("input.ends.desc", "", true);
    s("input.event.desc", "Bestäm dig för om denna texten är specifik för eventet, eller ska visas för alla!");
    s("input.event_description.desc", "Se till att beskrivningen är utförlig och kan användas som en första presentation när en ny besökare halkar in på kodachi.se");
    s("input.event_location.desc", "Här fyller du i platsen för evenemanget! Använd ett platsnamn, standard är \"Polhemskolan, Lund\" för Kodachicon ^_^");
    s("input.event_name.desc", "", true);
    s("input.givenName.desc", "Här behöver vi ditt namn, precis som det är registrerat i folkbokföringen om du är svensk medborgare! För vissa som registrerar sig är detta jobbigt, och då ska du veta att detta används bara till bidragssökningar och det är ditt nickname vi använder för att prata med dig. ^_^");
    s("input.group.desc", "Detta är den budgetpost som du tycker passar bäst in på ditt kvitto, välj noga!");
    s("input.image.desc", "", true);
    s("input.lang.desc", "Här väljer du vilka språk denna sida ska synas för. Det är inte alltid allt innehåll är lika vettigt för alla språk.");
    s("input.limit.desc", "Kostnadsgränsen är brytpunkten för hur mycket vi vill lägga på denna budgetposten. Det är inte en hård gräns, men en riktlinje för när något arbete går över budget.");
    s("input.phone.desc", "", true);
    s("input.points.desc", "10 poäng motsvarar ungefär en krona, och den minsta mängden du kan köpa är 100 poäng. Det tillkommer även några kronor ovanpå beloppet i bankavgifter.", true);
    s("input.publish.desc", "Med vår framförhållning ska du förmodligen sätta nästa datum här ungefär ett halvår bakåt i tiden. :D", true);
    s("input.purchase.desc", "Här har du chans att motivera varför du gjort köpet, och att berätta för oss vilka delar av kvittot som ska betalas av oss (om inte alla!)");
    s("input.sleep_at_event.desc", "Viktigt här! Om du inte kryssar i denna rutan så får du inte sova på konventet! Detta är för att vi av brandskäl måste hålla reda på vem som sover på evenemanget.");
    s("input.sleep.desc", "Här fyller du i hur många sovplatser du vill ha till evenemanget. Att sova på konvent är helmysigt, och vi har en massa funktionärer på plats som kan hjälpa till om du saknar något, men tänk på att du måste själv ta med sovsäckar, kuddar, liggunderlag och mjukisdjur, det har vi inte åt dig!");
    s("input.tickets.desc", "Första beslutet är hur många biljetter du vill köpa! Det är såklart roligare om ni är flera som åker på en gång, och om du köper flera biljetter så kan du alltid flytta över dem till en kompis!");
    s("input.total.name", "Vad är totalsumman som vi ska betala på kvittot?");
    s("input.total.desc", "Här nedan fyller du i vad du vill få utbetalt för kvittot. Var noga!");
    s("input.which_activity.name", "Vilken tävling vill du gå med i?");
    s("input.starts.desc", "", true);
    s("input.street.desc", "", true);
    s("input.title.desc", "", true);
    s("input.tshirt.desc", "Här fyller du i vilken Tshirt-storlek du behöver! Om du är anmäld till flera grupper kommer du ha fyllt i detta tidigare, och då är det den största storleken vi räknar med att du vill använda. Om du är i ett team som inte ska ha tröjor eller har annan specialuniform (till exempel en butik, eller ett scenevenemang!) så gör detta ingen skillnad.");
    s("input.user.desc", "", true);
    s("input.which_activity.desc", "", true);
    s("input.work_type.desc", "", true);
    s("input.zipCode.desc", "", true);
    s("input.shop_tables.desc", "När du sätter upp en större butik så behöver du ibland mer utrymme! För att vi ska kunna planera lite så önskar vi att du här fyller i hur mycket plats ni behöver specificerat i bordsyta, där ett bord är ungefär 2 meter långt.");
    s("input.shop_size.desc", "Nästa steg är att fylla i hur många som ska jobba i din butik under Kodachicon, inklusive dig själv. När din ansökan godkänts ska de som kommer att medverka på evenemanget anmäla sig under \"Påbörja en ansökan\"");
    s("input.shop_description.desc", "Nedan beskriver du din butik. Detta kommer att vara underlag för din ansökan, och sen även publiceras för användare här på hemsidan, så skriv en tuff beskrivning som får oss att vilja besöka just din butik!");
    s("input.shop_image.desc", "!Nu behöver vi en bild!\nDenna bilden kommer att synas för besökare som vill se vad ni håller på med!\nBilden kommer att vara lika bred som denna rutan och max 300 pixlar hög, så skicka inte en för liten bild, och se gärna till att den är liggande!");
    s("input.shop_name.desc", "Det första vi behöver är ditt butiksnamn, så att vi och alla besökare får reda på vem som kommer att sälja under evenemanget!");
    s("task.register_account_ssn.title", "Fortsätt skapa konto!");
    s("task.report_competition_result.title", "Rapportera tävlingsresultat");
    s("task.review_activity.title", "Utvärdera aktivitet");
    s("task.review_artist_alley.title", "Utvärdera artist alley");
    s("task.review_receipt.title", "Utvärdera kvitto");
    s("task.review_team.title", "Utvärdera team");
    s("task.review_team_application.title", "Utvärdera team-ansökan!");
    s("task.review_vendor.title", "Utvärdera försäljare");
    s("task.schedule_activity.title", "Schemalägg aktivitet!");
    s("task.self_application.title", "Fyll i dina teamuppgifter");
    s("task.self_application.desc", "Tjohej!\nDetta är nästan precis exakt samma text som alla som ansöker till ditt team kommer att få se! Här fyller du i alla uppgifter som vi behöver för att kunna se till att allt blir rätt när du kommer till evenemanget!");
    s("task.ssn_exists_forgot_details.title", "Glömt kontouppgifter?");
    s("task.create_page.desc", "Wooooh! Är det dags att skapa innehåll på hemsidan! Vi tror på dig, det kommer att bli fett!");
    s("task.deny_application.desc", "Hej! Tyvärr nekades din ansökan för {application.name}. Uppdatera din ansökan, skriv om saker och prova igen om du tycker att det blivit fel!");
    s("task.upload_receipt.desc", "Välkommen till vår häftiga kvittouppladdningstjänst! Här laddar du upp alla dina kvitton på utlägg under evenemanget, så slipper vi allihop tråkigt pappersarbete!");
    s("task.deny_receipt.desc", "Hej! Tyvärr nekades betalningen av ditt kvittoutlägg.\nOm du tycker att detta är felaktigt så ber vi dig kontakta ekonomi@kodachi.se och beskriva ditt problem.");
    s("task.email_team.desc", "Här mailar du ditt team! Det du skriver här kommer att skickas iväg som ett mail till alla i teamet, så använd det bara om du har något viktigt att säga! ^_^");
    s("task.forgot_account_details.desc", "Jaså, du har tappat bort ditt konto? Det löser vi!");
    s("task.goto_payson.desc", "", true);
    s("task.join_competition.desc", "Jaså! Du är pigg på att tävla? Bara fyll i vilken tävling du vill anmäla dig till så kontaktar vi dig om vi behöver mer information, annars är det bara att dyka upp!");
    s("task.join_work.desc", "Jaså? Det är dags att jobba på event? Härligt! Välj vilket team du vill söka till och fyll i världens bästa ansökan, så kör vi!");
    s("task.pay_receipt.desc", "Detta är en påminnelse! Tryck *inte* OK förrän följande kvitto är utbetalt!\nKontonr:{receipt.account_no}\nClearingnr:{receipt.clearing_no}\nSumma:{receipt.total}\nMottagare:{user.nickname} {user.lastName}");
    s("input.country.desc", "", true);
    s("input.shop_available_days.desc", "", true);
    s("task.report_competition_result.desc", "Här rapporterar du in hur en tävling gick. Gör en rapport för varje vinnare som har fått pris!");
    s("input.value.short", "Kort (15-30min)");
    s("input.value.medium", "Mellan (30-60min)");
    s("input.value.long", "Lång (1-3timmar)");
    s("input.value.half_day", "Halvdag (3-6timmar)");
    s("input.value.full_day", "Heldag (Längre!)");
    s("true", "Ja");
    s("false", "Nej");

    s("task.review_activity.desc", "Tjohej! Det har kommit in en ansökan från `{user.nickname}` {user.lastName} ({user.email}, {user.phone}) som du behöver ta ställning till!\nAktivitet: {application.name}\nTyp:{application.type}\nBudget:{application.budget}\nTeamstorlek:{application.size}\nMaxdeltagare:{application.participants}\nUniform:{{application.uniform}}\n#{application.name}\n@({application.image})\n_\n{|application.desc}\n|\nDetta är de behov som aktiviteten har:\n{|application.requirements}");
    s("task.review_team.desc", "Tjohej! Det har kommit in en ansökan från {user.nickname} som du behöver ta ställning till!\nTeamnamn: {application.name}\nTyp:{application.type}\nBudget:{application.budget}\nTeamstorlek:{application.size}\nUniform:{{application.uniform}}\n#{application.name}\n@({application.image})\n_\n{|application.desc}\n");


    s("task.review_artist_alley.desc", "Tjohej! Det har kommit in en ansökan från `{user.nickname}` {user.lastName} ({user.email}, {user.phone}) som du behöver ta ställning till!\nArtistAlley: {application.name}\nTyp:{application.type.id}\nTeamstorlek:{application.size}\nTillgänglighet:{application.schedule}\nBord:{application.tables}\n#{application.name}\n@({application.image})\n_\n{|application.desc}\n");
    s("task.review_vendor.desc", "Tjohej! Det har kommit in en ansökan från `{user.nickname}` {user.lastName} ({user.email}, {user.phone}) som du behöver ta ställning till!\Försäljare: {application.name}\nTyp:{application.type.id}\nTeamstorlek:{application.size}\nTillgänglighet:{application.schedule}\nBord:{application.tables}\n#{application.name}\n@({application.image})\n_\n{|application.desc}\n");
    s("task.review_team_application.desc", "Tjohej! Det har kommit in en ansökan från `{user.nickname}` {user.lastName} ({user.email}, {user.phone}) som du behöver ta ställning till!\nGrupp: {application.team.label}\nStädar söndag: {{application.can_cleanup_sunday}}\nTillgänglig onsdag: {{application.can_work_wednesday}}\nSover på eventet: {{application.sleep_at_event}}\n{|application.app_description}\n");

    s("task.review_receipt.desc", "Tjohej! Det har kommit in ett kvitto du behöver ta ställning till! \n@({receipt.image})\nSumma:{receipt.total}\nMottagare:{user.nickname}\nBudgetpost:{receipt.group}\nInköp:{receipt.purchase}");



    s("input.team_app_description.name", "Ansökningsbeskrivning");
    s("input.team_app_description.desc", "Här kan du beskriva för någon som ansöker till ditt team hur teamet fungerar och vad du vill att de som jobbar i teamet ska vara beredda på! Denna texten kommer också synas på din teamsida!");
    s("input.act_app_description.name", "Ansökningsbeskrivning");
    s("input.act_app_description.desc", "Här kan du beskriva för någon som ansöker till ditt team hur teamet fungerar och vad du vill att de som jobbar i teamet ska vara beredda på! Denna texten kommer också synas på din teamsida!");
    s("input.act_requirements.desc", "Här fyller du i vad din aktivitet behöver för utrustning och hjälp av oss för att kunna fungera!");
    s("input.act_requirements.name", "Kravbeskrivning");
    s('list.all_members.title', 'Alla medlemmar');

s('task.edit_profile.desc', '')
s('task.edit_profile.title', 'Redigera profil')
s('task.edit_profile.title.active', 'Redigera profil')
s('task.add_team_member.desc', '')
s('task.add_team_member.title', 'Lägg till teammedlem')
s('task.add_team_member.title.active', 'Lägg till teammedlem')
s('task.update_team_image.desc', '')
s('task.update_team_image.title', 'Uppdatera teambild')
s('task.update_team_image.title.active', 'Uppdatera teambild')
s('input.desc.desc', '')
s('input.desc.name', 'Beskrivning')
s('input.app_desc.desc', 'Detta är texten som visas för de som ansöker till teamet, och på teamsidan')
s('input.app_desc.name', 'Ansökningsbeskrivning')
s('input.requirements.desc', 'Detta är kraven som aktiviteten behöver hjälp med för att fungera')
s('input.requirements.name', 'Kravställning')
s('input.budget.desc', '')
s('input.budget.name', 'Budget')
s('input.uniform.desc', '')
s('input.uniform.name', 'Uniform')
s('input.name.desc', '')
s('input.name.name', 'Namn')
s('input.desc.desc', '')
s('input.desc.name', 'Beskrivning')
s('input.size.desc', '')
s('input.size.name', 'Storlek')
s('input.booked.desc', '')
s('input.booked.name', 'Förbokade')
s('input.target.desc', '')
s('input.target.name', 'Mål')
s('task.crew_checkin_select.desc', '')
s('task.crew_checkin.desc', '')
s('task.crew_checkin_select.title', 'Crewincheckning')
s('task.crew_checkin_select.title.active', 'Crewincheckning')
s('task.crew_checkin.title', 'Crewincheckning')
s('task.crew_checkin.title.active', 'Crewincheckning')
s('task.crew_checkin_verify.title', 'Crewincheckning')
s('task.crew_checkin_verify.title.active', 'Crewincheckning')

s('input.target.desc', '')
s('input.target.name', 'Mål')

s('task.checkin_select.desc', 'Incheckning!')
s('task.checkin_select.title', 'Checka in')
s('task.checkin_select.title.active', 'Checka in')


    s('list.badge_generator.title', 'Badgegenerator')
    s('list.email_all_staff.title', 'Maila crew')


    s("input.role.desc", "");
    s("input.role.name", "Rollnamn");
    s("input.forgotpassword.name", "Maila inloggningslänk");
    s("input.forgotpassword.desc", "Skickar ett email med en inloggningslänk till ditt konto och loggar in dig här när du trycker på den. ^_^");
    s("task.add_super_role.desc", "Här lägger du till en administratör");
    s("task.add_super_role.title", "Lägg till admin");
    s("task.remove_team_member.desc", "Är du säker på att du vill ta bort personen från ditt team?");
    s("task.remove_team_member.title", "Ta bort team-medlem");
    s("task.promote_manager.desc", "Är du säker på att du vill lägga till personen som gruppledare?");
    s("task.promote_manager.title", "Bekräfta gruppledare");
    s("task.demote_manager.desc", "Är du säker på att du vill ta bort personen som gruppledare?");
    s("task.demote_manager.title", "Bekräfta ta bort gruppledare");
    s("task.no_teams_available.desc", "Det finns inte några tillgängliga team att ansöka till just nu!");
    s("task.no_teams_available.title", "Inga tillgängliga team");
    s("list.all_users.title", "Lista alla användare");
    s("tasks.account.noSuchUser", "Nejdu! Den användaren finns inte!");
    s("tasks.purchases.giftToMe", "Du kan ju inte ge en biljett till dig själv! ^_^");
    s("tasks.account.loginFailed", "Nix! Testa ett annat lösenord!");
    
    s('achievement.i_bought_a_thing', 'Jag har köpt en biljett! ^_^');
    s('achievement.my_nap_spot', 'Min helt egna konventssovplats!');
    s('input.recipient_name.desc', '', true);
    s('input.recipient_name.name', 'Vem ska få biljetten?');
    s('task.give_ticket.desc', '', true);
    s('task.give_ticket.title.active', '', true);
    s('task.give_ticket.title', 'Överför biljett');


    s('email.app_accepted.subject', "Din ansökan har uppdaterats");
    s('email.app_accepted.text', "Tjohej! Titta in på kodachi.se, din ansökan till ett team har uppdaterats.");
    s('email.app_denied.subject', "Din ansökan har uppdaterats");
    s('email.app_denied.text', "Tjohej! Titta in på kodachi.se, din ansökan till ett team har uppdaterats.");
    s('input.value.sv', "Svenska");
    s('tasks.account.nickNameTaken', "Smeknamnet är upptaget! :o");
    s('tasks.account.emailTaken', "Emailadressen används redan! :o");
    s('input.value.eng', "Engelska");
    s('input.value.all', "Alla språk");
    s('role.base_manager', "Gruppledare");
    s('role.base_receipt_submitter', "Kvittomucklare");
    s("role.done_staff_test", "Crewkandidat");
    s("role.base_competition_manager", "Tävlingsarrangör");
    s("role.base_visitor", "Konventare!");
    s("role.base_sleeper", "Sovsäcksexpert");
    s("profile.roles", "Dina levels");
    s("profile.achievements", "Dina Achievements!")
    s("achievement.great_competition_manager", "Rapporterat in tävlingsresultat");
    s("achievement.done_staff_test", "Gjort ett antagningsprov");
    
    s('achievement.i_made_the_best_application', 'Jag har gjort den BÄSTA ansökningen!')
    s('achievement.i_wanna_work', 'Jag vill jobba!')
    s('achievement.i_wanna_work_everywhere', 'Jag vill jobba ÖVERALLT!')
    s('achievement.joined_a_team', 'Med i ett team! :D')
    s('achievement.my_very_own_team', 'Mitt heeeelt egna team!')
    s('achievement.welcome_home', 'Välkommen hem!')
    s('role.team_leader', 'Lagledare')
    s('achievement.write_stuff', 'Jag är duktig på att skriva')

    s('achievement.write_so_much_stuff', 'Jag är ÄNNU duktigare på att skriva!')
    s('achievement.let_them_buy_cake', 'Jag säljer på Kodachicon!')
    s('role.base_activity_admin', 'Aktivitetsfisk')
    s('role.base_crew_admin', 'Crewdruid')
    s('role.base_ka', "Crewmästare");

    s('list.auto.header.admin_teams', "");
    s('list.auto.header.list_team_leaders', "!Tjohej!\nHär kan du se alla teamledare!");
    s('list.list_team_leaders.title', "Lista teamledare");
    
    s('list.auto.header.admin_compos', "!Tävlingslistor ^_^\n Detta är alla deltagare i tävlingar! ^.^\nNotera att tävlingar utan deltagare inte visas!");
    s('list.auto.group.admin_compos', "!{w.name}\n{q}/{w.participants} Deltagare");
    s('list.auto.row.admin_compos', "`{u.nickname}` \n{u.phone}\n{u.email}");
    s('list.admin_compos.title', 'Administrera tävlingar')

    s('task.switch_account.desc', 'Byt till ett annat konto. Du måste ladda om sidan efter att du tryckt OK!')

    s('task.checkin_verify.desc', 'Checkar in {user.nickname}\nemail: {user.email}\npersonnummer (om något): {user.ssn}\ntelefonnummer: {user.phone}\nSovplats? {{hasSleep}} \nBiljett? {{hasTicket}}\nTänk på att alla biljetter på kontot kommer att checkas in, det finns {ticketCount} biljetter på kontot!\n!Viktigt!\nOm det är för många biljetter måste besökaren först flytta över resterande biljetter till kompisar, annars kommer de att förbrukas - för jag var lite lat när jag kodade! :o')

    s("tasks.checkin.onlyHasSleep", "Denna personen har bara sovplatsbiljett!");
    s("tasks.checkin.alreadyCheckedIn", "Personen är redan incheckad! :o");
    s("tasks.checkin.noTickets", "Personen har inga biljetter!");

    s('task.checkin_verify.title', '', true)
    s('task.checkin_verify.title.active', 'Fortsätt incheckningen')

    s('input.checkin_account.desc', 'Vem checkar in?')
    s('input.checkin_account.name', 'Användarkonto')

    s('task.checkin.desc', 'Dags att checka in! En besökare checkar in med sitt personnummer eller sin email. Tänk på att emailen är skiftlägeskänslig!');
    s('task.checkin.title', 'Checka in besökare!')
    s('task.checkin.title.active', 'Fortsätt incheckningen')

    s('list.auto.header.all_members', "Land;Förnamn;Efternamn;Postnummer;Stad;Personnummer;Telefonnummer;Adresss;Email")
    s('list.auto.row.all_members', "{u.country};{u.givenName};{u.lastName};{u.zipCode};{u.city};{u.ssn};{u.phone};{u.street};{u.email}")

    s('list.auto.header.my_competition', "!Tävlingslistor ^_^\n Detta är alla deltagare i tävlingar du administrerar! ^.^\nKontakta dem via email eller telefon för att skicka ut information inför tävlingen! Notera att tävlingar utan deltagare inte visas!");
    s('list.auto.group.my_competition', "!{w.name}\n{q}/{w.participants} Deltagare");
    s('list.auto.row.my_competition', "`{u.nickname}` \n{u.phone}\n{u.email}");
    s('list.my_competition.title', 'Dina tävlingsarrangemang')
    
    s('list.auto.header.my_team', "!Tjohej!\nHär kan du se ditt (eller dina!) team! ^_^");
    s('list.auto.group.my_team', "!{w.name}\nuniform: {{w.uniform}}, medlemmar: {q}/{w.size}, Du leder teamet: {{is_leader}}\n[Maila teamet,email_team.{{{event}}},team:{{{w.id}}},enabled:{leader}]\n[Lägg till medlem,add_team_member.{{{event}}},team:{w.id},enabled:{is_leader}]\n[Uppdatera teamprofil,update_team_desc.{{{event}}},team:{w.id},update_name:{w.name},update_desc:{w.desc},update_app_desc:{w.app_desc},enabled:{is_leader}]\n[Uppdatera teambild,update_team_image.{{{event}}},team:{w.id},enabled:{is_leader}]\n{|w.app_desc}");
    s('list.auto.row.my_team', "\"{u.nickname}\" {u.lastName} / {u.email} / {u.phone} / Gick med: {m.join_time}\nStorlek: {m.tshirt}, Bygger på Onsdag: {{m.wednesday}}, Städar på Söndag: {{m.sunday}}, Sover på plats: {{m.sleep}}, Teamledare: {{leader}}\n{|m.description}\n[Ta bort medlem,remove_team_member.{{{event}}},team:{{{w.id}}},user:{{{u.id}}},enabled:{is_leader},disabled:{leader}]\n[Gör till teamledare,promote_manager.{{{event}}},team:{{{w.id}}},user:{{{u.id}}},enabled:{is_leader},disabled:{leader}]\n[Ta bort teamledare,demote_manager.{{{event}}},team:{{{w.id}}},user:{{{u.id}}},enabled:{deletable_leader}]");

    s('task.switch_account.title', 'Byta konto')

    s('input.update_image.name', "Byt bild");
    s('input.update_image.desc', "Bilden kommer att vara lika bred som sidan och max 300 pixlar hög.");
    s('competition', "Tävlingar");
    s('team', "Team");
    s("activity", "Aktiviteter");
    s("vendor", "Försäljare");
    s("artist_alley", "Konstnärer");
    
    s('list.auto.header.list_activities', "Oooh! Nyfiken på vad som händer på Kodachicon? Det ser du här!");
    s('list.auto.group.list_activities', "!{{w.type}}");
    s('list.auto.row.list_activities', "!{w.name}\n@({w.image})\n_\n{|w.desc}");
    
    s('list.auto.header.list_shops', "Shoppingdags! Här är alla butiker som hänger på Kodachicon iår!");
    s('list.auto.group.list_shops', "!{{w.type}}");
    s('list.auto.row.list_shops', "!{w.name}\n@({w.image})\n_\n{|w.desc}");
    
    s('list.auto.header.list_teams', "Här ser du alla coola team som gör Kodachicon möjligt!");
    s('list.auto.group.list_teams', "!{{w.type}}");
    s('list.auto.row.list_teams', "!{w.name}\n@({w.image})\n_\n{|w.desc}");

    s('list.tshirts.title', 'Tshirtbeställningar')
    s('list.auto.header.tshirts', "!Tshirtbeställningar");
    s('list.auto.row.tshirts', "\"{u.nickname}\" {u.lastName} - storlek: {m.tshirt}");

    s('list.auto.group.admin_teams', "!{w.name}\n_Detaljer\nuniform: {{w.uniform}} - {q} / {w.size} medlemmar\n#Kravställning\n{|w.requirements}\n#Teambeskrivning\n{|w.app_desc}");
    s('list.auto.row.admin_teams', "\"{u.nickname}\" {u.lastName} / {u.email} / {u.phone}\nstorlek: {m.tshirt}, Bygger på Onsdag: {{m.wednesday}}, Städar på Söndag: {{m.sunday}}, Sover på plats: {{m.sleep}}, Gruppledare: {{leader}}");
    s('list.auto.row.email_all_staff', "{u.email}");
    
    s('list.auto.group.admin_budget', "");
    s('list.auto.row.admin_budget', "#{r.purchase}\nTotalt: {r.total} kr\nBetalat/Betalas till: {u.nickname},{u.email},{u.phone}\n#\n@({r.image})");

    s('list.auto.row.list_team_leaders', "!{w.name}\nGrupptyp: {w.type}\n\"{u.nickname}\" {u.lastName} / {u.email} / {u.phone}");

    s('list.admin_teams.title', 'Administrera team')
    s('list.my_team.title', 'Mitt team')

    s("input.resize_team.name", "Vilket team ska ändra storlek?")
    s("input.new_size.name", "Ny storlek");
    s("task.resize_team.title", "Ändra teamstorlek");


    s("input.update_name.name", "Gruppnamn");
    s("input.update_name.desc", "Här fyller du i ditt gruppnamn!");
    s("input.update_desc.name", "Gruppbeskrivning");
    s("input.update_desc.desc", "Här kan du uppdatera din gruppbeskrivning. Tänk på att den ska vara riktad främst mot besökare på evenemanget!");
    s("input.update_app_desc.name", "Team/Ansökningsbeskrivning");
    s("input.update_app_desc.desc", "Här uppdaterar du din interna teambeskrivning. Den syns på ansökningssidan och högst upp på ditt teams privata sida.");
    s('task.update_team_desc.desc', 'Här har du möjlighet att uppdatera ditt teams beskrivning ^_^')
    s('task.update_team_desc.title', 'Uppdatera team')
    

    
    s('tasks.account.differentEmails', 'Dina emailadresser måste vara likadana!');
    s('tasks.account.verifyPassword', 'Ett av lösenorden har nog blivit fel, skriv om dem för säkerhets skull!');
    s('task.error.noSuchTask', 'Det har blivit något fel! Ladda om sidan och prova igen.');
    s('task.error.createPage', 'Kunde inte skapa sidan! Det finns säkert redan en sida med samma ID!');

    s('shop.aa.name', "Artist Alley")
    s('shop.aa.desc', "Artist Alley är för dig som tillverkar dina egna saker och som driver en hobbyverksamhet eller liknande för att sälja dina egentillverkade varor.");
    s('shop.vendor.name', "Försäljning")
    s('shop.vendor.desc', "Försäljningen är för dig som har ett företag och säljer inköpta varor, eller kräver mycket plats och känner att beskrivningen på artist alley inte passar in på dig.");


};

