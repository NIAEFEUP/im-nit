var fs = require('fs');

const writeToFile = (filePath, data) => {
    fs.writeFile(filePath, data, (err) => {
        if(err){
            console.error(err);
            return;
        }
    });
    return;
}

const readQuotesFromFile = async (filePath) => {
    let quotes = {};
    fs.readFile(filePath, 'utf8', (err, contents )=> {
        if(err){
            console.error(err);
            return;
        }
        
        let res = contents.split('\r\n');
        
        res.map(quote => {
            let parsing = quote.split(':');     // contains an array with 2 elements (quoteKey, quoteText)
            quotes[parsing[0].trim()] = parsing[1].trim();
        })
        console.log(quotes);
    });
    return quotes;
}

exports.writeToFile = writeToFile;
exports.readQuotesFromFile = readQuotesFromFile;