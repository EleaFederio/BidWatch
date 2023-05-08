import dayjs from 'dayjs';

export function getRemainingTimeUntilMSTimeStamp (timeStampMS) {
    
    const timeStampDayJs = dayjs(timeStampMS);
    const nowDayJs = dayjs();

    if(timeStampDayJs.isBefore(nowDayJs)){
        return {
            seconds: '00',
            minutes: '00',
            hours: '00',
            days: '00'
        }
    }

    return {
        seconds : getRemainingSeconds(nowDayJs, timeStampDayJs),
        minutes : getRemainingMinutes(nowDayJs, timeStampDayJs),
        hours : getRemainingHours(nowDayJs, timeStampDayJs),
        days : getRemainingDays(nowDayJs, timeStampDayJs)
    }

}

function getRemainingSeconds(nowDayJs, timeStampDayJs){
    const seconds = timeStampDayJs.diff(nowDayJs, 'seconds') % 60;
    return padWithZeros(seconds, 2);
    // return seconds;
}

function getRemainingMinutes(nowDayJs, timeStampDayJs){
    const minutes = timeStampDayJs.diff(nowDayJs, 'minutes') % 60;
    return padWithZeros(minutes, 2);
    // return minutes;
}

function getRemainingHours(nowDayJs, timeStampDayJs){
    const hours = timeStampDayJs.diff(nowDayJs, 'hours') % 24;
    return padWithZeros(hours, 2);
    // return hours;
}

function getRemainingDays(nowDayJs, timeStampDayJs){
    const days = timeStampDayJs.diff(nowDayJs, 'days');
    return days.toString();
    // return days;    
}

function padWithZeros(number, minLenght){
    const numberString = number.toString();
    if(numberString.lenght >= minLenght) return numberString;
    return "0".repeat(minLenght - numberString.lenght) + numberString; 
}