const readline = require('readline-sync')
const csv = require('async-csv');
const fs = require('fs').promises;
const log4js = require('log4js');
const moment = require('moment');
const parseJson = require('parse-json');
const parseXML = require('xml2js').parseString;

const DateFormatCSV = "DD/MM/YYYY"
const DateFormatJSON = moment.ISO_8601

const logger = log4js.getLogger('main.js');
logger.level = 'debug';
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug' }
    }
});

const dateColumn = 0;
const fromColumn = 1;
const toColumn = 2;
const narrativeColumn = 3;
const amountColumn = 4;

function constructList(data) {
    const mainList = {};
    //create and populate list of people and their transactions
    data.forEach(element => {
        if (checkTransaction(element)) {
            if (!mainList.hasOwnProperty(element[fromColumn])) {
                mainList[element[fromColumn]] = new Person(element[fromColumn])
            }
            if (!mainList.hasOwnProperty(element[toColumn])) {
                mainList[element[toColumn]] = new Person(element[toColumn])
            }

            mainList[element[fromColumn]].addTransaction(element)
            mainList[element[toColumn]].addTransaction(element)
        }
    });
    return mainList
}

function makeTransactionList(data) {
    data.slice(1)
}
function checkTransaction(data) {
    if (isNaN(parseFloat(data[amountColumn]))) {
        logger.debug("invalid transaction: " + data.join(", "))
        console.log("invalid transaction: " + data.join(", ") + " - amount is not recognised, ignoring for total calculation")
        return false
    }
    if (!moment(data[dateColumn], DateFormatCSV).isValid() && !moment(data[dateColumn], DateFormatJSON).isValid()) {
        logger.debug("invalid transaction: " + data.join(", "))
        console.log("invalid transaction: " + data.join(", ") + " - Warning: invalid date, continuing")
        return true
    }
    return true
}

class Transaction {
    constructor(data) {
        this.date = data[dateColumn];
        this.from = data[fromColumn];
        this.to = data[toColumn]
        this.narrative = data[narrativeColumn];
        this.amount = data[amountColumn];
    }
}

class Person {
    constructor(name) {
        this.total = 0;
        this.transactions = [];
        this.name = name
    }

    displayTransactions() {
        console.log("Transactions for: " + this.name)
        console.log('Date, From, To, Narrative, Amount')
        this.transactions.forEach(element => {
            console.log(element.join(", "))
        });
    }

    displayTotal() {
        console.log(this.name + ': ' + (this.total).toFixed(2))
    }

    addTransaction(data) {
        this.transactions.push(data);
        if (this.name === data[fromColumn]) {

            this.total -= parseFloat(data[amountColumn])
        }
        if (this.name === data[toColumn]) {

            this.total += parseFloat(data[amountColumn])
        }

    }

}

async function readCSVFile(name) {

    const csvString = await fs.readFile(name, 'utf-8');
    const data = await csv.parse(csvString);
    return data.slice(1);
};

function convertToArray(data) {
    const newData = [];
    data.forEach( element => {
        newData.push(Object.values(element))
    });
    return newData
}
async function readJSONFile(name) {
    const jsonString = await fs.readFile(name, 'utf-8');
    const data = await parseJson(jsonString);
    return convertToArray(data)
}

async function readXMLFile(name) {
    const XMLString = await fs.readFile(name, 'utf-8');
    const data = await parseXML(XMLString, function(err, result) {
        console.log(result['TransactionList']['SupportTransaction'][0]);
    });
    
}
async function launchBank() {
    //const fileData = await readCSVFile('DodgyTransactions2015.csv')
    //const fileData = await readJSONFile('Transactions2013.json')
    const fileData = await readXMLFile('Transactions2012.xml')
    data = constructList(fileData)
    let exit = false
    console.log('Welcome to the SupportBank!')
    console.log('Please enter commands to get balance (List All) or list transactions (List [Account Name])')
    while (!exit) {
        let input = readline.prompt();
        //TRY USING SWITCH STATEMENT HERE
        if (input === 'List All') {
            console.log('Listing Balances for all accounts:')
            for (item in data) {
                data[item].displayTotal()
            }
        }
        else {
            if (data.hasOwnProperty(input.slice(5))) {
                data[input.slice(5)].displayTransactions()
            }
            else {
                console.log('Invalid command, please try again')
            }
        }
    }
}

launchBank();