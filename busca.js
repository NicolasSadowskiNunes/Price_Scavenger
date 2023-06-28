const pup = require('puppeteer-extra'); // insere o puppeteer na aplicação
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

const urlMercadoLivre = "https://www.mercadolivre.com.br"; // url do que será de onde sera pesquisado
const urlAmazon = "https://www.amazon.com.br"

var c = 0;
const listaMercadoLivre = [];
const listaAmazon = [];

pup.use(StealthPlugin());

async function exeBuscaMercadoLivre(pesquisaPor) {
    
    listaMercadoLivre.splice(0); //zera a lista 
    listaAmazon.splice(0);

    const naveg = await pup.launch({ headless: true}); // inicia o navegador...
    
    const paginaMercadoLivre = await naveg.newPage(); // abre uma nova página no navegador
    const paginaAmazon = await naveg.newPage()
    
    //Caso fique dando erro 403, usar isso: await paginaMercadoLivre.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36");

    await paginaMercadoLivre.goto(urlMercadoLivre);
    await paginaAmazon.goto(urlAmazon);

    /* espera pelo "id" da barra de pesquisa, caso não tenha 
    o processo é muito rápido, finalizando a api antes */
    await paginaMercadoLivre.waitForSelector('#cb1-edit');
    await paginaAmazon.waitForSelector('#twotabsearchtextbox');

    try {
        await paginaMercadoLivre.type('#cb1-edit', pesquisaPor);
        await paginaAmazon.type('#twotabsearchtextbox', pesquisaPor);
    } catch (error) {
        
    }
    

    // isso é necessário pois, o puppeteer tem dificuldade de manipular diversas páginas
    await Promise.all([
        paginaMercadoLivre.waitForNavigation(),
        paginaMercadoLivre.click('.nav-search-btn'),
    ])

    await Promise.all([
        paginaAmazon.waitForNavigation(), 
        paginaAmazon.click('#nav-search-submit-button')
    ])

    const linksMercado = await paginaMercadoLivre.$$eval('.ui-search-item__group > a', el => el.map(link => link.href));
    const linksAmazon = await paginaAmazon.$$eval('.a-size-mini > a', el => el.map(link => link.href));

    console.log("--- MERCADO LIVRE ---");

    for (const link of linksMercado) {

        if (c === 3) break;

        console.log("pagina: ", c);

        await paginaMercadoLivre.goto(link);

        try {
            await paginaMercadoLivre.waitForSelector('.ui-pdp-title');

            const titulo = await paginaMercadoLivre.$eval('.ui-pdp-title', element => element.innerText);
            const preco = await paginaMercadoLivre.$eval('.andes-money-amount__fraction', element => element.innerText);

            const vendedor = await paginaMercadoLivre.evaluate(() => {

            const ele = document.querySelector('.ui-pdp-seller__link-trigger');
            if (!ele) return null;

            return ele.innerText

        })

            const img = await paginaMercadoLivre.$eval('.ui-pdp-thumbnail__picture > img', element => element.src);

            const obj = {};

            obj.titulo = titulo;
            obj.preco = preco;
            (vendedor ? obj.vendedor = vendedor : '');
            obj.link = link;
            obj.img = img;

            listaMercadoLivre.push(obj);

            c++;
        } catch (error) {
            console.error("Erro ao encontrar o seletor!", error);
            continue;
        }
        
        
    }

    c = 0;
    console.log("--- AMAZON ---");

    for(const link of linksAmazon){
        
        if (c === 3) break;

        console.log("pagina: ", c);

        await paginaAmazon.goto(link);

        try {
            await paginaAmazon.waitForSelector('#productTitle');

            const img = await paginaAmazon.$eval('#imgTagWrapperId > img', element => element.src);
    
            const titulo = await paginaAmazon.$eval('#productTitle', element => element.innerText);
            const preco = await paginaAmazon.$eval('.a-offscreen', element => element.innerText);
    
            const obj = {};
    
            obj.titulo = titulo;
            obj.preco = preco;
            obj.link = link;
            obj.img = img;
    
            listaAmazon.push(obj);
            c++;
        } catch (error) {
            console.error("Erro ao encontrar o seletor!", error);
            continue;
        }
       
    }

    await paginaAmazon.waitForTimeout(1000);
    await naveg.close();
    c = 0;

}

module.exports = {
    exeBuscaMercadoLivre,
    listaMercadoLivre,
    listaAmazon
};