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

        return {...planInformationParsed, benefits: planBenefitsParsed}
    }

    /**
     * Loop the list and parse the data using regex
     * 
     * @param {*} $ 
     * @return formatted JSON
     */
    parsePlanInformation($) {
        
        // * Extrair a quantidade total de internet que o plano oferece
        /* * Extrair a quantidade total de minutos
                 * lembre-se de extrair o texto com informações de minutos e identificar se encontra um texto com minutos ilimitados(utilizar -1 nesse caso) ou um número com a quantidade de minutos
        */        
        // * Extrair o preço do plano
        // * Extrair uma lista de outros benefícios como "SMS ilimitados", "Roaming", "Celular Reserva", etc        
        
        return {
           plan_name: '',
           internet: '',
           minutes: ''
        }
    }

    /**
     * Loop benefits list and parse data using regex
     * 
     * @param {*} $ 
     * @return array with all benefits
     */
    parsePlanBenefits($) {
        // Tratar textos a partir do nível mais alto
        var textos = this.captarNodosDeTexto($),

        // Tratar os textos relativos a benefícios do plano
        beneficios = textos;

        return beneficios;
    }
    
    /**
     * Obtém todos os nodos de texto de uma estrutura Cheerio
     * e seus respectivos filhos. É recomendado passar o objeto
     * de nível mais alto de uma página ($.root()) para que a 
     * extração tenha maior alcance. 
     */    
    captarNodosDeTexto($) {
        let r = []
        $('*').each((i,e) => {
            r.push(e['children']
                // filtra apenas objetos cujo tipo seja 'text'
                .filter((v,i) => v['type'] === 'text')
            )
        })
        
        
        console.log('Teste: ', r)
        return r;
    }
}