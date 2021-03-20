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
    const data = fs.readFileSync(filePath, { encoding: 'utf8', flag: "a+" });
    if (data === "") return {};
    return JSON.parse(data);
}

module.exports = {
    writeToFile,
    readQuotesFromFile
}
