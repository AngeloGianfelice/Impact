# Impact

Progetto per il corso 2020/21 di Reti di Calcolatori, tenuto dal prof. Andrea Vitaletti presso La Sapienza Università di Roma.

**REQUISITI**

1)Il servizio REST che implementate (lo chiameremo SERV) deve offrire a terze parti delle API documentate;

2)SERV si deve interfacciare con almeno due servizi REST di terze parti (e.g. google maps)

3)Almeno uno dei servizi REST esterni deve essere “commerciale” (es: twitter, google, facebook, pubnub, parse, firbase etc)

4)Almeno uno dei servizi REST esterni deve richiedere oauth (e.g. google calendar), Non è sufficiente usare oauth solo per verificare le credenziali è necessario accedere al servizio;

5)La soluzione deve prevedere l'uso di protocolli asincroni. Per esempio Websocket e/o AMQP (o simili es MQTT);

6)Il progetto deve essere su GIT (GITHUB, GITLAB ...) e documentato con un README che illustri almeno:
  -scopo del progetto;
  -architettura di riferimento e tecnologie usate (con un diagramma);
  -chiare indicazioni sul soddisfacimento dei requisiti;
  -istruzioni per l'installazione;
  -istruzioni per il test;

**TECNOLOGIE UTILIZZATE**

  - REST 1: NASA Asteroids NeoWs (Near Earth Object Web Service);
  - REST 2: NASA APOD  (Astronomy Picture of the Day);
  - REST 3: GOOGLE Calendar (Oauth);
  - PROTOCOLLI ASINCRONI : WebSocket;
  - Progetto Documentato su GitHub (README).

![image](https://user-images.githubusercontent.com/83078138/123313966-4cdfa500-d52a-11eb-8902-ca8b648b7ef6.png)

**IDEE PROGETTO**

Lo scopo del progetto è quello di fornire agli appassionati di astronomia uno spazio dove poter ricavare informazioni, dialogare con altri utenti e tenersi sempre aggiornato sull'attavità e sulle missioni spaziali della NASA. 

In particolare, Impact offre, tramite l'utilizzo delle api rest fornite dalla NASA (https://api.nasa.gov/), la possibilità di visualizzare le informazioni relative ai cosidetti Near Earth Objects (NEOs). Nello specifico l'api NeoWs fornita dalla NASA ritorna all'utente (stampando a schermo nell'apposita area) varie informazioni relative ai corpi celesti(nel 99% dei casi asteroidi) passanti vicino alla terra quali: 
- nome;
- id;
- magnitudine;
- diametro minimo e massimo(in km);
- eventuale pericolosità;
- data di approccia alla Terra;
- velocita(in km/h);
- distanza(in km).
Nella pagina AstroWiki vengono spiegate nel dettaglio le voci elencate sopra, mediante immagini, grafici e tabelle. esplicative.

Inoltre Impact consente agli utenti di visualizzare la cosiddeta "APOD", ovvere l'immagine astronomica del giorno. Quest'ultima viene ritornata dall'api APOD fornita della Nasa, insieme ad un titolo, ed una breve descrizione della suddetta immagine ; in alcuni casi al posto dell'immagine si può trovare un brevissimo video.

Tramite Login al proprio account Google è possibile accedere alla pagina NASATV; qui gli utenti possono guardare le trasmissioni live della NASA (in live H24 su Youtube) sulle ultime attività e missioni spaziali.
E' inoltre possibile confrontare le proprie opinioni e dialogare con altre utenti connessi alla live su tematiche riguardanti il mondo dell'astronomia(si spera XD), tramite una chat room realizzata utilizzando il protocollo asincrono WebSocket. 
Infine, nella parte inferiore della pagina è anche possibile, tramite l'Api Google Calendar(OAUTH) di visualizzare gli eventi futuri sul proprio calendario (che vengono stampati a schermo ) e inserire nuovi eventi tramite un form, qualora l'utente fosse particorlarmente interessato ad uno specifico programma che il canale della NASA trasmetterà in futuro.   

**ISTRUZIONI PER L'INSTALLAZIONE**

Per il corretto funzionamento dell’applicazione è necessario Docker installato sulla propria macchina. Per l’installazione clonare la repository GitHub al link https://github.com/AngeloGianfelice/Impact, aprire il terminale, navigare nel File System fino alla root del progetto e usare il comando   $ docker-compose up -d.

Attenzione!!: per il corretto funzionamento dell'applicazione è necessario avere sulla propria macchina il file secrets.json ed il file .env i quali però , contenendo dati sensibili, non stati resi pubblici.  

**ISTRUZIONI PER IL TEST**

Per testare il nostro progetto è sufficiente accedere al url localhost:8080 da un qualsiasi browser.
L'utente si ritroverà  così nella HomePage di Impact da cui si può:
- compilare un form inserirendo un lasso di tempo (massimo 7 giorni) per accedere alle informazioni sugli asteroidi vicini alla terra in quello specifico lasso di tempo, le quali verranno stampate dopo qualche secondo nell'apposita area a destra del form;
- visualizzare l'immagine astronomica del giorno cliccando sul bottone in basso(al click l'utente verrà automaticamente redirezionato nell'apposita pagina);
    Tramite la navigation bar in alto è possibile:
    - accedere alla pagina NASATV cliccando il bottone "NASA",o il bottone "Login" in alto a destra(al click l'utente verra riderezionato alla pagina di autenticazione Oauth dove dovrà inserire le proprie credenziali Google);
    - accedere alla pagina Astrowiki cliccando sull' omonimo  bottone;
    - accedere alla pagina About cliccando sull' omonimo  bottone.
Dalla pagina NasaTV si può invece:
- visualizzare e scrivere messaggi su una chat room (a destra della pagina);
- visualizzare i programmi in live trasmessi dalla NASA (a sinistra della pagina);
- visualizzare gli eventi futuri sul proprio Google Calendar , premendo l'apposito bottone in basso a sinistra; 
- aggiungere un nuovo evento al proprio calendario, compilando il form in basso a destra.

**CONTROLLI**

La pagina NASATV non è accessibile in nessuno modo, se non previa l'autenticazione con il proprio account Google tramite Oauth. Per garantire ciò le route della pagina NASATV sono state protette e in caso di accessi senza autenticazione verrà stampato a schermo un messaggio di errore. 
Nel form della Homepage non si può inserire un lasso di tempo superiore a 7 giorni come detto sopra; in caso di formato della data non corretto viene stampato a schermo un messaggio di errore.
Nel form della Pagina NASATV, una volta inserito correttamente un nuovo evento viene stampato a schermo un messaggio di successo. 

