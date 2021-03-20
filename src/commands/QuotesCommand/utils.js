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
    return JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8', flag: "a+" }));
}

module.exports = {
    writeToFile,
    readQuotesFromFile
}
