const Form= document.getElementById("myform");
            Form.addEventListener('submit',function(e){
            e.preventDefault();
            document.getElementById("risposta").value="";
            document.getElementById("loader").style.display="block";
            const formdata=new FormData(this);
            const parametri_ricerca =new URLSearchParams();
            for(const pair of formdata){
            parametri_ricerca.append(pair[0],pair[1]);
            }
            cattura_risposta().catch(function(err){
                console.log("Errore:"+err);
            }) 
            async function cattura_risposta(){
                const response= await fetch('/NEO',{
                    method: "POST",
                    body: parametri_ricerca
                    });
                const text=await response.text();
                var risposta=JSON.parse(text);
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
                (testo).value+="}"
            }
            });