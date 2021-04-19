const momentTimezone = require('moment-timezone');

/**
 * 
 * @param {*} args 
 * @param {*} parsingType 
 * @returns array with the following format: [date, time, clockType, timeZone]
 */
const argsParser = (args, parsingType) => {
    switch(parsingType){
        case 0:
            return args;
        case 1:
            let currDate = Date.now();

            const milliToSeconds = 1000;

            while(args.length > 0){
                if(args[0] == 'and') args.shift();   // ignore some human language

                let [timeOffset, timeUnits] = args;     // grab the next 2 args
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
                }
                args.shift(); args.shift();
            }
            
            let resultDate = new Date(currDate).toLocaleString();

            let [date, timeAndTimeZone] = resultDate.split(",");
            timeAndTimeZone = timeAndTimeZone.trim();   // remove white spaces from the beggining and end of the string

            let [time, timezone] = timeAndTimeZone.split(" ");

            let [month, day, year] = date.split("/");

            date = day + "/" + month + "/" + year;

            console.log(date, time, timezone);

            return [date, time, timezone];
    }
}

module.exports = argsParser;