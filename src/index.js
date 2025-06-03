import fetch from 'node-fetch';
import {readFile} from 'fs/promises';

//json data
const heatPumpData = JSON.parse(await readFile('data/heat-pumps.json', 'utf-8'));
const houses = JSON.parse(await readFile('data/houses.json', 'utf-8'));
//weather location api
const API_KEY = 'f661f74e-20a7-4e9f-acfc-041cfb846505';
const WEATHER_API = 'https://063qqrtqth.execute-api.eu-west-2.amazonaws.com/v1/weather?location=';

async function processHouse(house) {
    const { submissionId, floorArea, heatingFactor, insulationFactor, designRegion} = house;
    const heatLoss = floorArea * heatingFactor * insulationFactor;
    try {
        const res = await fetch(`${WEATHER_API}${encodeURIComponent(designRegion)}`,
        {headers: {'x-api-key': API_KEY}})

        if (res.status === 200) {
            const data = await res.json();
            return `
            --------------------------------------
            ${submissionId}
            --------------------------------------
            Estimated Heat Loss = ${heatLoss.toFixed(2)}
            Design Region = 
            Power Heat Loss = 
            Recommended Heat Pump = 
            Cost Breakdown
            <label>, <cost>
            Total Cost, including VAT = £;
            `
        }else if (res.status === 404){
            return `
            --------------------------------------
            ${submissionId}
            --------------------------------------
            Heating Loss: ${heatLoss.toFixed(2)}
            Warning: Could not find design region \n`;
        }else{
             throw new Error(`API error: ${res.statusText}`)
        }
    }catch (err) {
        return `Error processing submission ${submissionId}: ${err.message}`;
    }
}

async function main() {
    for (const house of houses) {
        const output = await processHouse(house);
        console.log(output);
    }
}

main();
