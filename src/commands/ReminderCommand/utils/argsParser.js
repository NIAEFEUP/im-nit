const momentTimezone = require('moment-timezone');

const parsingTypes = {
    FORMAL: 0,
    HUMAN_LANGUAGE: 1,
}

/**
 * 
 * @param {*} args 
 * @param {*} parsingType 
 * @returns array with the following format: [date, time, clockType, timeZone]
 */
const argsParser = (args, parsingType) => {
    switch(parsingType){
        case parsingTypes.FORMAL:
            return args;
        case parsingTypes.HUMAN_LANGUAGE:
            let currDate = Date.now();

            const milliToSeconds = 1000;

            while(args.length > 0){
                if(args[0].toLowerCase() == 'and') args.shift();   // ignore some human language

                let [timeOffset, timeUnits] = args;     // grab the next 2 args
                timeUnits = timeUnits.toLowerCase();

                if(isNaN(timeOffset)){
                    return [];
                }

                if(timeUnits == 'minute' || timeUnits == 'hour' || timeUnits == 'day' || timeUnits == 'month'){
                    timeUnits += "s";
                }
                switch(timeUnits){
                    case 'minutes':
                        currDate += parseInt(timeOffset) * 60 * milliToSeconds;  // increment in milliseconds
                        break;
                    case 'hours':
                        currDate += parseInt(timeOffset) * 60 * 60 * milliToSeconds;
                        break;
                    case 'days':
                        currDate += parseInt(timeOffset) * 24 * 60 * 60 * milliToSeconds;
                        break;
                    case 'months':
                        currDate += parseInt(timeOffset) * 30 * 24 * 60 * 60 * milliToSeconds;  // assuming all months have 30 days
                        break;
                    default:
                        return [];
                }
                args.shift(); args.shift();
            }
            
            let resultDate = new Date(currDate).toLocaleString();

            let [date, timeAndClockType] = resultDate.split(",");
            timeAndClockType = timeAndClockType.trim();   // remove white spaces from the beggining and end of the string

            let [time, clockType] = timeAndClockType.split(" ");

            let [month, day, year] = date.split("/");

            date = day + "/" + month + "/" + year;

            return [date, time, clockType];
    }
}

module.exports.argsParser = argsParser;
module.exports.parsingTypes = parsingTypes;