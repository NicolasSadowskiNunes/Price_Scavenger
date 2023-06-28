const express = require('express');
const res = require('express/lib/response');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const {exeBuscaMercadoLivre, listaMercadoLivre, listaAmazon} = require('./busca');

const porta = 8000;

app.use(express.static(path.join(__dirname, 'public')));

app.listen(porta, () => {

    console.log(`O SERVIDOR ESTÁ ON EM http://localhost:${porta}/`);

});

app.use(bodyParser.urlencoded({extended: true}));

app.post('/envia-dados', (req, res) => {
    
    
    const pesquisaPor = req.body.search;
    if(!pesquisaPor){
        res.redirect('./')
    }
    else{
        exeBuscaMercadoLivre(pesquisaPor);
        console.log(pesquisaPor);
    }
    
})

app.get('/listaMerc', (req, res) => {

    res.send(listaMercadoLivre);

});

app.get('/listaAmz', (req, res) => {

    res.send(listaAmazon);

});