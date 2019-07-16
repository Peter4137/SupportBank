const readline = require('readline-sync')
const csv = require('async-csv');
const fs = require('fs').promises;

const fromColumn = 1;
const toColumn = 2;

function constructList(data) {
    const mainList = {};
    //create and populate list of people and their transactions
    data.slice(1).forEach(element => {
        if (!mainList.hasOwnProperty(element[fromColumn])) {
            mainList[element[fromColumn]] = new Person(element[fromColumn])
        }
        if (!mainList.hasOwnProperty(element[toColumn])) {
            mainList[element[toColumn]] = new Person(element[toColumn])
        }
        mainList[element[fromColumn]].addTransaction(element)
        mainList[element[toColumn]].addTransaction(element)
    });

    return mainList
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
        //console.log("Balance for: "+this.name +"(GBP)")
        console.log(this.name + ': ' + (this.total).toFixed(2))
    }
    addTransaction(data) {
        this.transactions.push(data);
        if (this.name === data[fromColumn]) {
            this.total -= parseFloat(data[4])
        }
        if (this.name === data[toColumn]) {
            this.total += parseFloat(data[4])
        }
    }
}

async function readCSVFile(name) {

    const csvString = await fs.readFile(name, 'utf-8');
    const data = await csv.parse(csvString);
    return data;
};

async function launchBank() {
    const fileData = await readCSVFile('Transactions2014.csv')
    data = constructList(fileData)
    let exit = false
    console.log('Welcome to the SupportBank!')
    console.log('Please enter commands to get balance (List All) or list transactions (List [Account Name])')
    while (!exit) {
        let input = readline.prompt();
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