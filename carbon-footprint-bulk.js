const fs = require('fs');
const csv = require('csv-parser');
const { co2 } = require("@tgwf/co2");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const co2Emission = new co2();
const greenHost = true; // Shopify uses green hosting

// Initialize an empty array to store the CSV data
const results = [];

// Read CSV file
fs.createReadStream('/home/harleen/co2js-node/shopify-theme-size.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    // At this point, the results array is fully populated
    console.log(results); // This line is just to show the results

    // Example of further using the array
    processArray(results); // Directly pass results without reassigning

    // Create CSV file
    createCsvFile(results);
  });

function processArray(array) {
  console.log("Processing array...");
  array.forEach(item => {
    // Ensure item.Size is correctly parsed as a number
    const bytesSent = parseFloat(item.Size); // Use parseFloat if decimal points are possible, otherwise use parseInt
    const estimatedCO2 = co2Emission.perByte(bytesSent, greenHost);
    console.log(
      `The theme ${item.Address} had a carbon footprint of ${estimatedCO2.toFixed(3)} grams of CO2.`
    );
  });
}

function createCsvFile(data) {
  const filePath = '/home/harleen/co2js-node/theme-co2-output.csv';

  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: 'Address', title: 'Address' },
      { id: 'EstimateCO2', title: 'Estimate CO2' }
    ]
  });

  const records = data.map(item => ({
    Address: item.Address,
    EstimateCO2: co2Emission.perByte(parseFloat(item.Size), greenHost).toFixed(3)
  }));

  // Write the data to the CSV file
  csvWriter.writeRecords(records)
    .then(() => {
      console.log(`CSV file "${filePath}" created successfully.`);
    })
    .catch((err) => {
      console.error('Error creating the CSV file:', err);
    });
}
