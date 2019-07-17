const moment = require("moment");
const log4js = require("log4js");
const DateFormatCSV = "DD/MM/YYYY";

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

class Transaction {
    constructor(data) {
        this.date = data[dateColumn];
        this.from = data[fromColumn];
        this.to = data[toColumn];
        this.narrative = data[narrativeColumn];
        this.amount = data[amountColumn];
    }
    returnString() {
        return `${this.date}, ${this.from}, ${this.to}, ${this.narrative}, ${this.amount}`;
    }
    checkTransaction() {
        if (isNaN(parseFloat(this.amount))) {
            logger.debug("invalid transaction: " + this.returnString());
            console.log("invalid transaction: " + this.returnString() + " - amount is not recognised, ignoring for total calculation");
            return false;
        }
        if (!moment(this.date, DateFormatCSV).isValid()) {
            logger.debug("invalid transaction: " + this.returnString());
            console.log("invalid transaction: " + this.returnString() + " - Warning: invalid date, continuing");
            return true;
        }
        return true;
    }
}

exports.Transaction = Transaction;