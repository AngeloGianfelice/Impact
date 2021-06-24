//dependencies
const http=require('http');
const WebSocket=require('ws');
require("dotenv").config('.env');
const request = require('request');
const express=require('express');
const ejs=require('ejs');
const fs = require('fs');


//middleware
const app=express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const port = process.env.PORT;
const key= process.env.KEY;
app.set("view engine","ejs");
app.use(express.static("public"));





//gestione Google Oauth

let token='';
let rawdata = fs.readFileSync('secrets.json');
let sec = JSON.parse(rawdata);

const client_id = sec.web.client_id;
const client_secret = sec.web.client_secret;
const red_uri=sec.web.redirect_uris[0];
const token_uri=sec.web.token_uri;
const auth_uri=sec.web.auth_uri;
const scope='https://www.googleapis.com/auth/calendar';

//chiedo l'autorizzazione del resource owner
app.get('/login',(req,res)=>{
    res.redirect(auth_uri+"?scope="+scope+"&response_type=code&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri="+red_uri+"&client_id="+client_id);
});

//Ottengo l'access_token
app.get('/NASA',function(req, res){
    const code=req.query.code;
    const logged=req.query.logged;
    if(logged){
    var formData = {
        code: code,
        client_id: client_id,
        client_secret: client_secret,
        redirect_uri: red_uri,
        grant_type: 'authorization_code'
    }
    request.post({url:token_uri, form: formData}, function optionalCallback(err,httpresponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        var info = JSON.parse(body); 
        token = info.access_token;
        if(token){
            res.redirect('/NASATV');
        }else{
            res.send("ERRORE NELL'ACCESS TOKEN");
            res.end();
            return;
        }
        });
    }else{
        res.send("NON SEI LOGGATO");
        res.end();
    }
    
});

//accedo finalmente alle risorse
app.get('/NASATV' ,(req,res)=>{
    if(!token) {
        res.send("Non puoi accedere a questa pagina se non sei loggato");
        res.end();
        return;
    }
    const calendar=req.query.calendar;
    if(calendar==='list'){ //gestione lista calendari
        var options = {
            url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            headers: {
                'Authorization': 'Bearer '+token
            }
        };
        request.get(options, function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);
                const lista_eventi=get_event_list(info.items);
                res.render("NASA",{logged:true,lista:lista_eventi,added:false});
            }else {
            res.send("Errore nella request degli eventi: " + error);
            res.end();
            }
        });
    }else if(calendar==='event'){  //gestione inserimento nuovo evento
        request( "https://www.googleapis.com/calendar/v3/calendars/primary/events",{
                        method:"POST",
                        headers: {
                                    "Authorization": 'Bearer '+token
                                    },
                        
                        body:JSON.stringify({
                                "start":{
                                        "dateTime":req.query.data_inizio +":00+01:00",
                                        },
                                "end": {
                                        "dateTime": req.query.data_fine +":00+01:00",
                                },
                                "summary":req.query.summary,
                                "description":req.query.descrizione
                                })
                        }, (error,response)=>{
            if(!error && response.statusCode==200){
                console.log("evento aggiunto al calendario");
                res.render("NASA",{logged:true,lista:null,added:true})
            }
            else{
                res.send("Errore nell'inserimento evento: "+error);
                res.end();
            }
        }) 
    }else{
        res.render('NASA',{logged:true,lista:null,added:false});
    }
});


//gestione Websocket chatroom
const server = http.createServer(express);
const wss = new WebSocket.Server({ server });
// Broadcast to all.
wss.broadcast = function broadcast(data) {
wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
        client.send(data);
        }
    });
};

server.listen(8000,function(){
    console.log("websocket server is listening");
});
    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(data) {
        // Broadcast to everyone else.
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
                }
            });
        });
    });

//routing
app.get('/', function(req,res){
    res.render("index",{errore:false,risposta:null,added:false}); 
});

//API'S ROUTES
app.post('/NEO',async function(req,res){
    const {StartDate,EndDate}=req.body;
    let errore=false;
    if((((Math.abs(new Date(EndDate)))-(Math.abs(new Date(StartDate))))/(1000*60*60*24)) > 7){
        res.render('index',{errore:true,risposta:null,added:false});
    }else{
        request.get("https://api.nasa.gov/neo/rest/v1/feed?start_date="+ 
        StartDate + "&end_date="+ EndDate + "&api_key="+key,function(error,response){
            if(error){
                console.log("Errore nella risposta:",response.statusCode);
            }else{
                var risposta=JSON.parse(response.body);
                res.render("index",{errore:errore,risposta:JSON.stringify(creaDati(risposta))});
            }    
        });
    };
});


app.get('/APOD',function(req,res){
    request.get("https://api.nasa.gov/planetary/apod?api_key="+key,(request,response)=>{
        var risposta=JSON.parse(response.body);
        let url;
        const descrizione=risposta.explanation;
        const title=risposta.title;
        let isImage;
        if(risposta.media_type==="video") {
            url=risposta.url;
            isImage=false;
        }else{
            url=risposta.hdurl;
            isImage=true;
        }
        res.render('APOD',{descrizione:descrizione,titolo:title,url:url,isImage:isImage});
    });
});

app.listen(port,function(error){
    if(error){
        console.log("Errore nell'inizializzazione del server");
    }else{
    console.log("listening on port: ",port);
    }
})


//funzioni ausiliarie
function creaDati(parametro){
    let asteroidi=[];
    let name,id,magnitudine,diametro_min,diametro_max,pericoloso,data,velocità,distanza;
    for(let giorno in parametro.near_earth_objects){
        for(let oggetto in (parametro.near_earth_objects)[giorno]){
            let asteroide=((parametro.near_earth_objects)[giorno])[oggetto];
            id=asteroide.id;
            name=asteroide.name;
            magnitudine=asteroide.absolute_magnitude_h;
            diametro_min=((asteroide.estimated_diameter).kilometers).estimated_diameter_min;
            diametro_max=((asteroide.estimated_diameter).kilometers).estimated_diameter_max;
            pericoloso=asteroide.is_potentially_hazardous_asteroid;
            data=((asteroide.close_approach_data)[0]).close_approach_date_full;
            velocità=(((asteroide.close_approach_data)[0]).relative_velocity).kilometers_per_hour;
            distanza=(((asteroide.close_approach_data)[0]).miss_distance).kilometers;
            asteroidi.push({name:name , id:id, magnitudine:magnitudine, 
                diametro_min:diametro_min,diametro_max:diametro_max,
                pericoloso:pericoloso, data:data,velocità:velocità,distanza:distanza
            });
        }
    }
    var result={
        contatore: parametro.element_count,
        asteroidi:asteroidi,
    }
    return result;
}
function get_event_list(info){
    let result=[];
    for(elem in info){
        if ( (info[elem]).status!='cancelled'){
            const data=new Date((info[elem]).end.dateTime || (info[elem]).end.date);
            const data0=new Date((info[elem]).start.dateTime || (info[elem]).start.date);
            if( data.getTime() >= Date.now()){
                const date = ('0' + data.getDate()).slice(-2);
                const month = ('0' + (data.getMonth() + 1)).slice(-2);
                const year = data.getFullYear();
                const hours1 = ('0' + data0.getHours()).slice(-2);
                const minutes1 = ('0' + data0.getMinutes()).slice(-2);
                const hours2 = ('0' + data.getHours()).slice(-2);
                const minutes2 = ('0' + data.getMinutes()).slice(-2);
                const time = `${date}/${month}/${year}, ${hours1}:${minutes1}-${hours2}:${minutes2}`;
                result.push({time:time,
                            titolo: (info[elem]).summary,
                            descrizione: info[elem].description
                            });
                }
            }   
        }
    return result;
}
