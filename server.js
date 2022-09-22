const puppeteer = require("puppeteer");
const express = require("express");
const server = express();
const mongoClient = require("mongodb");

const port = "3000";
const uri =
    "mongodb+srv://leoAndrade:2204@cluster0.q0us8pv.mongodb.net/?retryWrites=true&w=majority";

server.get("/", async (request, response) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(
    "https://proxyservers.pro/proxy/list/order/updated/order_dir/desc"
    );
  //await page.screenshot({path: 'example.png'});
});
//await browser.close();

server.listen(port, () => {
    console.log(`
        Servidor subiu com sucesso!\n
        Acesse em http://localhost:${port}
    `);
});

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

//tried mongo db cloud connection
async function main() {
    const client = new mongoClient.MongoClient(uri);
    await client.connect();
    await listDatabases(client);

    try {
        await client.connect();
        await listDatabases(client);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
main().catch(console.error);
