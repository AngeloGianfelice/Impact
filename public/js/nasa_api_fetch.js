function stampa(risposta){
    let testo=document.getElementById("risposta");
        document.getElementById("loader").style.display="none";
        (testo).value+="contatore : " + risposta.contatore;
        (testo).value+="\nasteroidi : {\n"
        for(let parametri in risposta.asteroidi){
            (testo).value+= "\t"+parametri+": "+"{\n";
            (testo).value+= "\t\tNome : "+risposta.asteroidi[parametri].name+"\n";
            (testo).value+= "\t\tId : "+risposta.asteroidi[parametri].id+"\n";
            (testo).value+= "\t\tMagnitudine : "+risposta.asteroidi[parametri].magnitudine+"\n";
            (testo).value+= "\t\tDiametro_min : "+risposta.asteroidi[parametri].diametro_min+" km\n";
            (testo).value+= "\t\tDiametro_max : "+risposta.asteroidi[parametri].diametro_max+" km\n";
            (testo).value+= "\t\tPericoloso : "+risposta.asteroidi[parametri].pericoloso+"\n";
            (testo).value+= "\t\tData : "+risposta.asteroidi[parametri].data+"\n";
            (testo).value+= "\t\tVelocità : "+risposta.asteroidi[parametri].velocità+" km/h\n";
            (testo).value+= "\t\tDistanza : "+risposta.asteroidi[parametri].distanza+" km\n";
            (testo).value+="}\n"
            }
            (testo).value+="}";
        }

