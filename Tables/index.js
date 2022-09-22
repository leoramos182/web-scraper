const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { MongoClient } = require("mongodb");
const jsdom = require("jsdom");
const JSDOM = jsdom.JSDOM;

const puppeteer = require("puppeteer");
const express = require("express");
const server = express();

const uri =
    "mongodb+srv://leoAndrade:2204@cluster0.q0us8pv.mongodb.net/?retryWrites=true&w=majority";




createDbFile();
saveHtmlPages();

async function createJsonFile(){
    let columns = [];
    let pageNumbers = 0;
    let lineNumbers = 0;
    const minPages = 1;
    const maxPages = 18;

    for(var aux = minPages ; aux < maxPages; ++aux){
        var url = `https://proxyservers.pro/proxy/list/order/updated/order_dir/desc/page/${aux}`
        
        await axios.get(url)
        .then( resp => {
            let dataHtml = resp.data;
            const $ = cheerio.load(dataHtml);
            //search for this tags in each line
            $('[class="table table-hover"]>tbody>tr').each( (i,el) => {
                const allElements = $(el).find('td');
                const ipAddress = $(allElements[1]).text().trimStart().trimEnd();
                //Can't catch data for port
                const port = $(allElements[2]).find('span').text().trimStart().trimEnd();
                const country = $(allElements[3]).text().trimStart().trimEnd();
                const protocol = $(allElements[6]).text().trimStart().trimEnd();
                const column = {ipAddress, port, country, protocol};

                columns.push(column);
                lineNumbers++;
            });
        })
        pageNumbers++;
    }
    
    //Creates a json file from columns array
    const columnsJson = JSON.stringify(columns);
    const archive = fs.writeFile("columns.json", columnsJson, (err,result) => {
        if(err) console.log('error', err)
    });
    console.log("Generated json file.")

    const scraperData = {pageNumbers, lineNumbers, columnsJson};

    return scraperData;
}

async function saveHtmlPages(){
    const minPages = 1;
    const maxPages = 18;
    
    for(var aux = minPages ; aux < maxPages; ++aux){
        var url = `https://proxyservers.pro/proxy/list/order/updated/order_dir/desc/page/${aux}`
        
        await axios.get(url)
        .then( resp => {
            const $ = cheerio.load(resp);
            //Select all html in the web page but without any styles
            const contentHtml = $('*').html()
            
            $('html>').each( (i,el) => {
                fs.writeFile(`page${aux}.html`, contentHtml, (err,result) => {
                    if(err) console.log('error', err)
            });
            });
        })
        console.log(`File ${aux} generated.`)
    }
    console.log("All files generated.");
}

async function createDbFile(){
    const startTime = new Date();
    const test = await createJsonFile();
    const finishTime = new Date();

    test.startedScraper = startTime;
    test.finishedScraper = finishTime;

    const resultDocument = new Array<Document>[];
    resultDocument.push(test);  
    
    const client = new MongoClient(uri);

    try{
        await client.connect();
    } finally {
        await client.close();
    }

    const db = client.db("Cluster0");
    const coll = db.collection("comets");

    const result = await coll.insertOne(resultDocument);
}



