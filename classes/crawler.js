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
        // Tratar textos da estrutura HTML
        let t = $.root().text() // Acessa a raiz superior e captura todo conteúdo de texto
                .split('\n') // Retorna um Array com strings usando como separador o '\n'
                .map(v => v.trim()) // Retorna um Array removendo todas as tabulações
                .filter(v => v != '') // Retorna um Array cujos elementos não sejam uma string vazia 
                .filter(v => /[\w]/i.test(v)) // Retorna um Array cujos elementos possuam caracteres alfabéticos
        
        // * Extrair o nome do plano
        let nome = t.filter(v => v.includes('Plano') // Retorna um Array cujos elementos possuam a palavra 'Plano' ou 'plano'
                    || v.includes('plano'))
                .filter( v =>/[0-9]/.test(v)) // Retorna um Array cujos elementos possuam caracteres numéricos
                .join() // Junta todos os elementos de um Array dentro de uma string
            
        // * Extrair o preço do plano
        let preco = t.filter(v => v.includes('R$')) // Retorna um Array o elemento possuir a string 'R$'
                .map(v => v.slice(v.indexOf('R$'),9)) // Retorna um Array no intervalo especificado cujo elemento possua a String 'R$'
                .filter(v => v!='') // Retorna um Array removendo as string vazias 
                .join() // Junta todos os elementos de um Array dentro de em uma string
        
        // * Extrair a quantidade total de internet que o plano oferece
        let internet = this.parsePlanBenefits($)
                        .filter(v => /[0-9]*(Y|Z|E|P|T|G|M|K|)B/.test(v)) // Retorna um Array que captura a quantidade de internet em uma grandeza de bytes
                        .map(v => v.slice(
                                v.split('').findIndex(v => /[0-9]/.test(v)),
                                v.split('').findIndex(v => /(Y|Z|E|P|T|G|M|K|)B/.test(v))+1))
                        .join() // Junta todos os elementos de um Array dentro de uma string
        
        /* * Extrair a quantidade total de minutos
                 * lembre-se de extrair o texto com informações de minutos e identificar se encontra um texto com minutos ilimitados(utilizar -1 nesse caso) ou um número com a quantidade de minutos
        */
        let tempo = t.filter(v => v.includes('ilimitado')) // Verifica se a string 'ilimitado' foi encontrada e retorna em um Array com '-1', ou
                ? -1 : t.filter(v => /[0-9]/.teste(v)) // Retorna um Array cujos elementos possuam caracteres numéricos
                        .filter(v => v.includes('hora') // Verifica se a string 'hora' foi encontrada
                                || v.includes('minuto')) // ou se a string 'minuto' foi encontrada e retorna em um Array
        
        return {
            plan_name: nome,
            price: preco,
            internet: internet,
            minutes: tempo,
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
                .prev().text().trim() != '')
            .children()
            .map((i,e) => $(e).text())
            .get()
            .filter((v,i,a) => a.indexOf(v) == i)
    }
}