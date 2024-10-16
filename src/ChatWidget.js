import React from 'react';

const ChatWidget = ({ transcript }) => {
  return (
    <div>
      <h3>Transcript:</h3>
      <p>{transcript}</p>
    </div>
  );
};

export default ChatWidget;