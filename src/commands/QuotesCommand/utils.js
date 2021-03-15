var fs = require('fs');

const writeToFile = (filePath, data) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 1), (err) => {
        if(err){
            console.error(err);
            return;
        }
    });
    return;
}

module.exports = {
    writeToFile
}
