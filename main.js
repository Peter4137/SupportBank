const readline = require("readline-sync");
const log4js = require("log4js");
const Person = require("./Person.js").Person;
const Transaction = require("./Transaction.js").Transaction;
const Parser = require("./Parser.js").Parser;
const Writer = require("./Writer.js").Writer;

const logger = log4js.getLogger("main.js");
logger.level = "debug";
log4js.configure({
    appenders: {
        file: { type: "fileSync", filename: "logs/debug.log" }
    },
    categories: {
        default: { appenders: ["file"], level: "debug" }
    }
});

function constructList(transactionList) {
    const mainList = {};
    transactionList.forEach(item => {
        if (item.checkTransaction()) {
            if (!mainList[item.from]) {
                mainList[item.from] = new Person(item.from);
            }
            if (!mainList[item.to]) {
                mainList[item.to] = new Person(item.to);
            }

            mainList[item.from].addTransaction(item);
            mainList[item.to].addTransaction(item);
        }
    });
    return mainList;
}

function makeTransactionList(data) {
    const transactionList = [];
    data.forEach(item => {
        transactionList.push(new Transaction(item));
    });
    return transactionList;
}

async function launchBank() {
    //construct transaction and people list
    let parser = new Parser();
    const files = ["Transactions2012.xml", "Transactions2013.json", "Transactions2014.csv", "DodgyTransactions2015.csv"];
    const fileData = await parser.parse(files);
    const transactionList = makeTransactionList(fileData);
    const data = constructList(transactionList);
    const writer = new Writer();

    //allow user to interact with information
    let exit = false;
    console.log("Welcome to the SupportBank!");
    console.log("Please enter commands to get balance (List All) or list transactions (List [Account Name])");
    while (!exit) {
        let input = readline.prompt();
        switch (input) {
        case "List All":
            console.log("Listing Balances for all accounts:");
            for (let item in data) {
                data[item].displayTotal();
            }
            break;
        case "Quit":
            exit = true;
            break;
        case "Export File":
            writer.writeToFile("Output.txt", writer.formatOutput(transactionList));
            break;
        default:
            if (data[input.slice(5)]) {
                data[input.slice(5)].displayTransactions();
            }
            else {
                console.log("Invalid command, please try again");
            }
        }
    }
}

launchBank();