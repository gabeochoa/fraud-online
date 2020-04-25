import React, { useState, useEffect, useCallback } from "react";
import "../spyfall/spyfall.css";

function TimerDisplay({
    minutes, seconds
}) {
    const timerUnder30 = parseInt(minutes) == 0 && parseInt(seconds) < 30;
    return (
        <div 
            style={{ textAlign: "center" }} 
            className={`${timerUnder30? "blinking" : ""}`}
        >
            <h1>{minutes}:{seconds}</h1>
        </div>
    );
}

const convertToMinSec = (total) => {
    const minutes = Math.floor(total / 60).toString().padStart(2, '0');
    const seconds = (total - minutes * 60).toString().padStart(2, '0');
    return [minutes, seconds]
}

const Timer = ({
    total_time
}) => {
    const [timeRemaining, setTimeRemaining] = useState(total_time);
    let intervalHandle;
    const tick = useCallback(
        () => {
            if (timeRemaining <= 0) { 
                clearInterval(intervalHandle); 
            } else {
                setTimeRemaining(timeRemaining - 1)
            }
        },
        [timeRemaining]
    );
    useEffect(() => {
        intervalHandle = setInterval(tick, 1000);
        return () => { clearInterval(intervalHandle); }
    }, [tick]);

    const [m, s] = convertToMinSec(timeRemaining);
    return (
        <TimerDisplay minutes={m} seconds={s} />
    );
}

export default Timer;