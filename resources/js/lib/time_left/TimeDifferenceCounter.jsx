import { useEffect } from "react";
import { Badge } from "react-bootstrap";
import { getRemainingTimeUntilMSTimeStamp } from "./getRemainingTimeUntilMSTimeStamp";

const TimeDifferenceCounter = ({ timeStamp, remainingTime, setRemainingTime }) => {

    useEffect(()=>{
        const intervalId = setInterval(() => {
            updateRemainingTime(timeStamp);
        }, 1000)
        return () => clearInterval(intervalId);
    }, [])

    function updateRemainingTime(countdown){
        setRemainingTime(getRemainingTimeUntilMSTimeStamp(countdown))
    }

    return (
        <>
            <p style={{marginBottom: 0}}><b>remaining time : </b> <Badge pill bg={'dark'}>days : {remainingTime.days} | hours : {remainingTime.hours} | minutes : {remainingTime.minutes} | seconds : {remainingTime.seconds}</Badge></p>
        </>
    )
}

export default TimeDifferenceCounter;