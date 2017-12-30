"use strict";

const fs = require('fs'),
      path = require('path'),
      cheerio = require('cheerio')

module.exports = class Crawler {
    constructor() {
        const html = this.retrieveHtml(),
              $ = this.parseHtmlToCheerio(html),    
              parsedPlan = this.parsePlan($)
        
        return parsedPlan
    }

    /**
     * Get html contents from assets directory
     * 
     * @return html source content
     */
    retrieveHtml() {
        return fs.readFileSync('./assets/plano.html', 'utf-8')
    }

    /**
     * Get source html and parse to cheerio,
     * to manipulate the html using jquery functions
     * 
     * @param {*} html
     * @return html parsed to cheerio
     */
    parseHtmlToCheerio(html) {
        return cheerio.load(html)
    }

    /**
     * Parse the html, and return plan parsed
     * 
     * @param {*} $
     * @return json formatted plan
     */
    parsePlan($) {
        const planInformationParsed = this.parsePlanInformation($),
              planBenefitsParsed = this.parsePlanBenefits($)
        
        console.log(planBenefitsParsed)

        return {...planInformationParsed, benefits: planBenefitsParsed}
    }

    /**
     * Loop the list and parse the data using regex
     * 
     * @param {*} $ 
     * @return formatted JSON
     */
    parsePlanInformation($) {
        // Tratar textos da estrutura HTML
        var textos = this.capturarNodosDeTexto($)        
        
        // * Extrair a quantidade total de internet que o plano oferece
        /* * Extrair a quantidade total de minutos
                 * lembre-se de extrair o texto com informações de minutos e identificar se encontra um texto com minutos ilimitados(utilizar -1 nesse caso) ou um número com a quantidade de minutos
        */        
        // * Extrair o preço do plano
                
        return {
           plan_name: '',
           internet: '',
           minutes: '',
        }
    }

    /**
     * Loop benefits list and parse data using regex
     * 
     * @param {*} $ 
     * @return array with all benefits
     */
    parsePlanBenefits($) {
        // Tratar textos relativos a benefícios do plano
        // * Extrair uma lista de outros benefícios como "SMS ilimitados", "Roaming", "Celular Reserva", 
        return $('ul')
            .filter((i,e) => $(e)
                .prev().text()
                .includes('Benef'))
            .children()
            .map((i,e) => $(e).text())
            .get()
            .filter((v,i,a) => a.indexOf(v) == i)
    }
    
    /**
     * Obtém os textos de todos os nodos obtidos pelo Cheerio. 
     * @param $ Instância do Cheerio.
     * @return Listagem de nodos de texto obtidos.
     */   
    capturarNodosDeTexto($, ref='*') {
        return $ (ref).contents().toArray()// Obtem os filhos, contém os objetos do tipo texto
        .reduce((x,v) => x.concat(v), []) // Concatena cada sublista obtida       
        .filter(v => v['type'] === 'text' && v['data'].trim() != '') // Filtra objetos do tipo 'text' e que possui texto relevante
        .map(v => v['data'].trim()) // Remove as impurezas dos textos (\t\n)
    }
}