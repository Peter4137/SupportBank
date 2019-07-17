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

//enum
const dateColumn = 0;
const fromColumn = 1;
const toColumn = 2;
const narrativeColumn = 3;
const amountColumn = 4;

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

// class Transaction {
//     constructor(data) {
//         this.date = data[dateColumn];
//         this.from = data[fromColumn];
//         this.to = data[toColumn];
//         this.narrative = data[narrativeColumn];
//         this.amount = data[amountColumn];
//     }
//     returnString() {
//         return `${this.date}, ${this.from}, ${this.to}, ${this.narrative}, ${this.amount}`;
//     }
//     checkTransaction() {
//         if (isNaN(parseFloat(this.amount))) {
//             logger.debug("invalid transaction: " + this.returnString());
//             console.log("invalid transaction: " + this.returnString() + " - amount is not recognised, ignoring for total calculation");
//             return false;
//         }
//         if (!moment(this.date, DateFormatCSV).isValid()) {
//             logger.debug("invalid transaction: " + this.returnString());
//             console.log("invalid transaction: " + this.returnString() + " - Warning: invalid date, continuing");
//             return true;
//         }
//         return true;
//     }
// }

// class Person {
//     constructor(name) {
//         this.total = 0;
//         this.transactions = [];
//         this.name = name;
//     }

//     displayTransactions() {
//         console.log("Transactions for: " + this.name);
//         console.log("Date, From, To, Narrative, Amount");
//         this.transactions.forEach(item => {
//             console.log(item.returnString());
//         });
//     }

//     displayTotal() {
//         console.log(this.name + ": " + (this.total).toFixed(2));
//     }

//     addTransaction(data) {
//         this.transactions.push(data);
//         if (this.name === data.from) {

//             this.total -= parseFloat(data.amount);
//         }
//         if (this.name === data.to) {

//             this.total += parseFloat(data.amount);
//         }
//     }
// }

// class Parser {
//     async parse(files) {
//         let fileData = [];
//         for (let i = 0; i < files.length; i++) {
//             let fileType = this.getFileType(files[i]);
//             switch (fileType) {
//             case "CSV":
//                 fileData = fileData.concat(await this.readCSVFile(files[i]));
//                 break;
//             case "JSON":
//                 fileData = fileData.concat(await this.readJSONFile(files[i]));
//                 break;
//             case "XML":
//                 fileData = fileData.concat(await this.readXMLFile(files[i]));
//                 break;
//             default:
//                 logger.debug("File: " + files[i] + " was not of a recognised type");
//                 console.log("File: " + files[i] + " was not of a recognised type");
//                 break;
//             }
//         }

//         return fileData;
//     }

//     getFileType(name) {
//         if (name.search(".csv") != -1) {
//             return "CSV";
//         } else if (name.search(".json") != -1) {
//             return "JSON";
//         } else if (name.search(".xml") != -1) {
//             return "XML";
//         } else {
//             return "UNKNOWN";
//         }
//     }

//     async readCSVFile(name) {

//         const csvString = await fs.promises.readFile(name, "utf-8");
//         const data = await csv.parse(csvString);
//         return data.slice(1);
//     }

//     convertToArray(data) {
//         const newData = [];
//         data.forEach(element => {
//             element["Date"] = moment(element["Date"], DateFormatJSON).format(DateFormatCSV);
//             newData.push(Object.values(element));
//         });
//         return newData;
//     }

//     async readJSONFile(name) {
//         const jsonString = await fs.promises.readFile(name, "utf-8");
//         const data = await parseJson(jsonString);
//         return this.convertToArray(data);
//     }

//     async readXMLFile(name) {
//         const XMLString = await fs.promises.readFile(name, "utf-8");
//         const self = this;
//         return new Promise((resolve) => {
//             parseXML(XMLString, function (err, result) {
//                 resolve(self.convertXMLData(result["TransactionList"]["SupportTransaction"]));           // CHECK SCOPE OF this.convertXMLData (not seeing rest of class??)
//             });
//         });
//     }

//     convertXMLData = async (data) => {
//         const arrayData = [];
//         data.forEach(item => {
//             const newItem = [];
//             newItem.push(this.convertDate(item.$.Date));
//             newItem.push(item.Parties[0].From[0]);
//             newItem.push(item.Parties[0].To[0]);
//             newItem.push(item.Description[0]);
//             newItem.push(item.Value[0]);
//             arrayData.push(newItem);
//         });
//         return arrayData;
//     }

//     convertDate(date) {
//         return moment("31/12/1899", DateFormatCSV).add(date, "d").format(DateFormatCSV);
//     }
// }

// class Writer {
//     writeToFile(filename, data) {
//         fs.writeFileSync(filename, data);
//     }

//     formatOutput(data) {
//         var output = "";
//         data.forEach(item => {
//             output += item.returnString() + "\n";
//         });
//         return output;
//     }
// }

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