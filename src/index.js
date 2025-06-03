import fetch from 'node-fetch';
import {readFile} from 'fs/promises';

//json data
const heatPumpData = JSON.parse(await readFile('data/heat-pumps.json', 'utf-8'));
const houses = JSON.parse(await readFile('data/houses.json', 'utf-8'));
//weather location api
const API_KEY = 'f661f74e-20a7-4e9f-acfc-041cfb846505';
const WEATHER_API = 'https://063qqrtqth.execute-api.eu-west-2.amazonaws.com/v1/weather?location=';

async function processHouse(house) {
    //key properties from the house object for easier access
    const { submissionId, floorArea, heatingFactor, insulationFactor, designRegion} = house;
    //calculate the heatloss
    const heatLoss = floorArea * heatingFactor * insulationFactor;
    try {
        // Fetch weather data
        const res = await fetch(`${WEATHER_API}${encodeURIComponent(designRegion)}`,
        {headers: {'x-api-key': API_KEY}})

        if (res.status === 200) {
            const data = await res.json();
            //gets the degreeDays fromm the weather api
            const degreeDays = data.location.degreeDays;
            //calculates the power heat loss using total heat loss calculated and the returned heating degree days
            const powerHeatLoss = heatLoss / degreeDays;
            //finds the first heat pump from the list that meats the condition.
            const pump = heatPumpData.find(p => p.outputCapacity >= powerHeatLoss);
            if (!pump) {
                //if no pump is found to meet requirements throw error
                throw new Error("No suitable heat pump found");
            }else{
                // combines all elements into a single result and add the cost up starting from 0
                const subtotal = pump.costs.reduce((sum, c) => sum + c.cost, 0);
                // Create an array of formatted cost item strings "label, amount") for display
                const costs = pump.costs.map(pumpCost => `${pumpCost.label}, £${pumpCost.cost}`).join('\n\t\t');
                //calculates the total amount with vat
                const totalWithVAT = (0.05 * subtotal) + subtotal;
                return `
                --------------------------------------
                ${submissionId}
                --------------------------------------
                Estimated Heat Loss = ${heatLoss.toFixed(2) + "kWh"}
                Design Region = ${designRegion}
                Power Heat Loss = ${powerHeatLoss.toFixed(2)+ "kW"}
                Recommended Heat Pump = ${pump.label}
                Cost Breakdown
                ${costs}
                Total Cost, including VAT = £${totalWithVAT};
                `
                }
        }else if (res.status === 404){
            return `
            --------------------------------------
            ${submissionId}
            --------------------------------------
            Heating Loss: ${heatLoss.toFixed(2)}
            Warning: Could not find design region \n`;
        }else{
              // throws error message including the response status code
             throw new Error(`API error: ${res.status}`)
        }
    }catch (err) {
        // throws error message including the submission ID and error details
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
