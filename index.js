require("dotenv").config('.env');
var request = require('request');
const express=require('express');
const ejs=require('ejs');
const app=express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const port = process.env.PORT;
const key= process.env.KEY;
app.set("view engine","ejs");
app.use(express.static("public"));

//ROUTE
app.get('/', function(req,res){
    res.render("index"); 
});

app.get('/APOD',(req,res)=>{
    res.render("APOD");
});
 app.get('/NASA',(req,res)=>{
    res.render("NASA");
});

app.post('/NEO',function(req,res){
    const StartDate=req.body.StartDate;
    const EndDate=req.body.EndDate;
    request.get("https://api.nasa.gov/neo/rest/v1/feed?start_date="+ 
    StartDate + "&end_date="+ EndDate + "&api_key="+key,function(error,response){
        if(error){
            console.log("Errore nella risposta:",response.statusCode);
        }else{
            var risposta=JSON.parse(response.body);
            res.json(creaDati(risposta));
        }
        res.end();
        })
    })
app.post('/APOD',function(req,res){
    request.get("https://api.nasa.gov/planetary/apod?api_key="+key,(request,response)=>{
        var risposta=JSON.parse(response.body);
        res.json({
            descrizione:risposta.explanation,
            title:risposta.title,
            url:risposta.hdurl
        });
        res.end();
    });
})
app.listen(port,function(error){
    if(error){
        console.log("Errore nell'inizializzazione del server");
    }else{
    console.log("listening on port: ",port);
    }
})
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