const readline = require('readline-sync')
const csv = require('async-csv');
const fs = require('fs').promises;
const log4js = require('log4js');
const moment = require('moment');
const parseJson = require('parse-json');
const parseXML = require('xml2js').parseString;

const DateFormatCSV = "DD/MM/YYYY"
const DateFormatJSON = moment.ISO_8601
//const StartDate = moment("31/12/1899", DateFormatCSV)

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

function constructList(transactionList) {
    const mainList = {};
    transactionList.forEach(item => {
        if (item.checkTransaction()) {
            if (!mainList.hasOwnProperty(item.from)) {
                mainList[item.from] = new Person(item.from)
            }
            if (!mainList.hasOwnProperty(item.to)) {
                mainList[item.to] = new Person(item.to)
            }

            mainList[item.from].addTransaction(item)
            mainList[item.to].addTransaction(item)
        }
    });
    return mainList;
}

function makeTransactionList(data) {
    const transactionList = [];
    data.forEach(item => {
        transactionList.push(new Transaction(item))
    });
    return transactionList;
}

class Transaction {
    constructor(data) {
        this.date = data[dateColumn];
        this.from = data[fromColumn];
        this.to = data[toColumn]
        this.narrative = data[narrativeColumn];
        this.amount = data[amountColumn];
    }
    returnString() {
        let ans = ""
        ans += this.date;
        ans += ", " + this.from;
        ans += ", " + this.to;
        ans += ", " + this.narrative;
        ans += ", " + this.amount;
        return ans
    }
    checkTransaction() {
        if (isNaN(parseFloat(this.amount))) {
            logger.debug("invalid transaction: " + this.returnString())
            console.log("invalid transaction: " + this.returnString() + " - amount is not recognised, ignoring for total calculation")
            return false
        }
        if (!moment(this.date, DateFormatCSV).isValid() && !moment(this.date, DateFormatJSON).isValid()) {
            logger.debug("invalid transaction: " + this.returnString())
            console.log("invalid transaction: " + this.returnString() + " - Warning: invalid date, continuing")
            return true
        }
        return true
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
        this.transactions.forEach(item => {
            console.log(item.returnString())
        });
    }

    displayTotal() {
        console.log(this.name + ': ' + (this.total).toFixed(2))
    }

    addTransaction(data) {
        this.transactions.push(data);
        if (this.name === data.from) {

            this.total -= parseFloat(data.amount)
        }
        if (this.name === data.to) {

            this.total += parseFloat(data.amount)
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
    data.forEach(element => {
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
    return new Promise((resolve, reject) => {
        parseXML(XMLString, function (err, result) {
            resolve(convertXMLData(result['TransactionList']['SupportTransaction']))
        });
    })
}

async function convertXMLData(data) {
    const arrayData = [];
    data.forEach(item => {
        const newItem = [];
        newItem.push(convertDate(item.$.Date))
        newItem.push(item.Parties[0].From[0])
        newItem.push(item.Parties[0].To[0])
        newItem.push(item.Description[0])
        newItem.push(item.Value[0])
        arrayData.push(newItem)
    });
    return arrayData
}

function convertDate(date) {
    return moment("31/12/1899", DateFormatCSV).add(date,'d').format(DateFormatCSV)
}

async function launchBank() {
    //const fileData = await readCSVFile('DodgyTransactions2015.csv')
    //const fileData = await readJSONFile('Transactions2013.json')
    const fileData = await readXMLFile('Transactions2012.xml')
    //console.log(fileData)
    transactionList = makeTransactionList(fileData)
    data = constructList(transactionList)
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
            else if (input === 'Quit') {
                exit = true;
            }
            else {
                console.log('Invalid command, please try again')
            }
        }
    }
}

launchBank();