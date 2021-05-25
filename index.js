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
const scope='https://www.googleapis.com/auth/calendar.events';

//chiedo l'autorizzazione del resource owner
app.get('/login',(req,res)=>{
    res.redirect("https://accounts.google.com/o/oauth2/v2/auth?scope="+scope+"&response_type=code&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri="+red_uri+"&client_id="+client_id);
});

app.get('/NASA', function(req, res){ //todo change route to redirect uri
  console.log("code taken");
  // res.send('the access token is: ' + req.query.code);

  var formData = {
    code: req.query.code,
    client_id: client_id,
    client_secret: client_secret,
    redirect_uri: red_uri,
    grant_type: 'authorization_code'
  }


  request.post({url:'https://www.googleapis.com/oauth2/v4/token', form: formData}, function optionalCallback(err, httpResponse, body) {
  if (err) {
    return console.error('upload failed:', err);
  }
  console.log('Upload successful!  Server responded with:', body);
  var info = JSON.parse(body);
  res.send("Got the token "+ info.access_token); //Ottengo l'access_token
  token = info.access_token;
    });
  var options = {
  //url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
  headers: {
    'Authorization': 'Bearer '+token
    }
  };
  request(options, function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    var info = JSON.parse(body);
    // do whatever you want with resource(info)
    
    }
  else {
    console.log(error);
  }
  });
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
    res.render("index",{errore:false,risposta:null}); 
});

app.get('/NASA',(req,res)=>{
    res.render("NASA");
});

//API'S ROUTES
app.post('/NEO',async function(req,res){
    const {StartDate,EndDate}=req.body;
    let errore=false;
    if((((Math.abs(new Date(EndDate)))-(Math.abs(new Date(StartDate))))/(1000*60*60*24)) > 7){
        res.render('index',{errore:true,risposta:null});
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
        if(risposta.media_type==="video") {
            url=risposta.url;
        }else{
            url=risposta.hdurl;
        } 
        res.render('APOD',{descrizione:descrizione,titolo:title,url:url,isImage:!(risposta.media_type==="video")});
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