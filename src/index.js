import fetch from 'node-fetch';
import {readFile} from 'fs/promises';

//json data
const heatPumpData = JSON.parse(await readFile('data/heat-pumps.json', 'utf-8'));
const houses = JSON.parse(await readFile('data/houses.json', 'utf-8'));
//weather location api
const API_KEY = 'f661f74e-20a7-4e9f-acfc-041cfb846505';
const WEATHER_API = 'https://063qqrtqth.execute-api.eu-west-2.amazonaws.com/v1/weather?location=';

async function processHouse(house) {
    return house
}

async function main() {
    for (const house of houses) {
        const output = await processHouse(house);
        console.log(output);
    }
}

main();
