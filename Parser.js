const fs = require("fs");
const parseJson = require("parse-json");
const parseXML = require("xml2js").parseString;
const csv = require("async-csv");
const moment = require("moment");

const DateFormatCSV = "DD/MM/YYYY";
const DateFormatJSON = moment.ISO_8601;

class Parser {
    async parse(files) {
        let fileData = [];
        for (let i = 0; i < files.length; i++) {
            let fileType = this.getFileType(files[i]);
            switch (fileType) {
            case "CSV":
                fileData = fileData.concat(await this.readCSVFile(files[i]));
                break;
            case "JSON":
                fileData = fileData.concat(await this.readJSONFile(files[i]));
                break;
            case "XML":
                fileData = fileData.concat(await this.readXMLFile(files[i]));
                break;
            default:
                logger.debug("File: " + files[i] + " was not of a recognised type");
                console.log("File: " + files[i] + " was not of a recognised type");
                break;
            }
        }

        return fileData;
    }

    getFileType(name) {
        if (name.search(".csv") != -1) {
            return "CSV";
        } else if (name.search(".json") != -1) {
            return "JSON";
        } else if (name.search(".xml") != -1) {
            return "XML";
        } else {
            return "UNKNOWN";
        }
    }

    async readCSVFile(name) {

        const csvString = await fs.promises.readFile(name, "utf-8");
        const data = await csv.parse(csvString);
        return data.slice(1);
    }

    convertToArray(data) {
        const newData = [];
        data.forEach(element => {
            element["Date"] = moment(element["Date"], DateFormatJSON).format(DateFormatCSV);
            newData.push(Object.values(element));
        });
        return newData;
    }

    async readJSONFile(name) {
        const jsonString = await fs.promises.readFile(name, "utf-8");
        const data = await parseJson(jsonString);
        return this.convertToArray(data);
    }

    async readXMLFile(name) {
        const XMLString = await fs.promises.readFile(name, "utf-8");
        const self = this;
        return new Promise((resolve) => {
            parseXML(XMLString, function (err, result) {
                resolve(self.convertXMLData(result["TransactionList"]["SupportTransaction"]));           // CHECK SCOPE OF this.convertXMLData (not seeing rest of class??)
            });
        });
    }

    convertXMLData = async (data) => {
        const arrayData = [];
        data.forEach(item => {
            const newItem = [];
            newItem.push(this.convertDate(item.$.Date));
            newItem.push(item.Parties[0].From[0]);
            newItem.push(item.Parties[0].To[0]);
            newItem.push(item.Description[0]);
            newItem.push(item.Value[0]);
            arrayData.push(newItem);
        });
        return arrayData;
    }

    convertDate(date) {
        return moment("31/12/1899", DateFormatCSV).add(date, "d").format(DateFormatCSV);
    }
}

exports.Parser = Parser;