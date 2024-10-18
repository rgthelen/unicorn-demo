// src/components/ConfettiButton.js
import React, { useState } from 'react';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';

const ConfettiButton = () => {
  const { width, height } = useWindowSize();
  const [isConfettiRunning, setIsConfettiRunning] = useState(false);

  const handleConfettiClick = () => {
    setIsConfettiRunning(true);
    setTimeout(() => setIsConfettiRunning(false), 7000); // Confetti runs for 3 seconds
  };

  return (
    <div>
      {isConfettiRunning && (
        <Confetti
          width={width}
          height={height}
          colors={['#ff69b4', '#800080']} // Pink and purple colors
          numberOfPieces={1000}
          recycle={false}
          gravity={0.1}
          run={true}
        />
      )}
      <button
        onClick={handleConfettiClick}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
        }}
      >
        🎉
      </button>
    </div>
  );
};

export default ConfettiButton;

