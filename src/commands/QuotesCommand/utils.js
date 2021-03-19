const fs = require('fs');

const writeToFile = (filePath, data) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 1), (err) => {
        if(err){
            console.error(err);
            return;
        }
    });
    return;
}

const readQuotesFromFile = (filePath) => {
    fs.readFile(filePath, { flag: "a+" }, (err, contents) => {
        if (err) {
            console.error(err);
            return {};
        }
        if (!contents[0]) return {};  // file was just created
        return JSON.parse(contents);
    });
}

module.exports = {
    writeToFile,
    readQuotesFromFile
}
