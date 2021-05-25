function mostra_APOD(descrizione,titolo,url,isImage){
    document.getElementById('descrizione').textContent=descrizione;
    document.getElementById('APODT').textContent=titolo;
    if(isImage==="false"){
        document.getElementById('vid').src=url;
    }else{  
       document.getElementById('im').src=url; 
    }   
}
