import { useState, useEffect } from "react";

const CountDown = ({
  startTime,
  endTime,
}: {
  startTime: number;
  endTime: number;
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isStarted, setIsStarted] = useState<boolean>(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      // If not started yet, count down to start time
      if (now < startTime) {
        setIsStarted(false);
        return startTime - now;
      }
      // If started but not ended, count down to end time
      if (now < endTime) {
        setIsStarted(true);
        return endTime - now;
      }
      // If ended
      setIsStarted(true);
      return 0;
    };

    // Set initial time
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      // Clear interval when countdown reaches zero
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    // Cleanup on unmount
    return () => clearInterval(timer);
  }, [startTime, endTime]);

  // Convert milliseconds to hours, minutes, seconds
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="countdown">
      {timeLeft === 0 ? (
        isStarted ? (
          <span>Training has ended</span>
        ) : (
          <span>Training will start soon</span>
        )
      ) : (
        <span>
          {!isStarted && "Training will start in "}
          {hours.toString().padStart(2, '0')}:
          {minutes.toString().padStart(2, '0')}:
          {seconds.toString().padStart(2, '0')}
        </span>
      )}
    </div>
  );
};

export default CountDown;
