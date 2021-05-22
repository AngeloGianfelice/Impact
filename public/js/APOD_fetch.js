cattura_APOD().catch(error=>{
    console.log(error);
});
async function cattura_APOD(){
const risposta_APOD =await fetch("/APOD",{
    method: 'post',
    body: 'application/json'
});
const text=await risposta_APOD.text();
const APOD=JSON.parse(text);
document.getElementById('loader').style.display="none";
document.getElementById('descrizione').textContent=APOD.descrizione;
document.getElementById('im').src=APOD.url;
document.getElementById('APODT').textContent=APOD.title;
}
