const readline = require('readline-sync')
const csv = require('async-csv');
const fs = require('fs').promises;

function constructList(data) {
    const mainList = {};
    //create list of 'empty' people classes for every user
    data.slice(1).forEach(element => {
        mainList[element[1]] = new Person(element[1])
        mainList[element[2]] = new Person(element[2])
    });
    //apply transactions to all users
    data.slice(1).forEach(element => {
        mainList[element[1]].addTransaction(element)
        mainList[element[2]].addTransaction(element)
    });
    return mainList
}

const nameColumn = 0;
const fromColumn = 1;

class Person {
    constructor(name) {
        this.total = 0;
        this.transactions = [];
        this.name = name
    }
    displayTransactions() {
        console.log("Transactions for: " + this.name)
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
        if (this.name === data[1]) {
            this.total -= parseInt(data[4])
        }
        if (this.name === data[2]) {
            this.total += parseInt(data[4])
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
            if (data.has(input.slice(5)) {
                data[input.slice(5)].displayTransactions()
            }
            else {
                console.log('Invalid command, please try again')
            }
        }
    }
}

launchBank();