const fs = require("fs");

class Writer {
    writeToFile(filename, data) {
        fs.writeFileSync(filename, data);
    }

    formatOutput(data) {
        var output = "";
        data.forEach(item => {
            output += item.returnString() + "\n";
        });
        return output;
    }
}

exports.Writer = Writer;