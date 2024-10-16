// src/App.js
import React, { useState, useEffect } from 'react';
import { useRownd } from '@rownd/react';
import './App.css'; // Import the CSS file

function ChatApp() {
  const { is_authenticated, is_initializing, requestSignIn, getAccessToken } = useRownd();
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: "You are a magical unicorn named Sparkle. You love to chat with children, especially those around 5 years old. Always be whimsical, friendly, and full of wonder. Use playful language and encourage imagination. Keep responses short and use emojis!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Removed automatic sign-in prompt
  useEffect(() => {
    // No automatic sign-in on component mount
  }, []);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      const token = await getAccessToken();
      console.log('JWT Token:', token); // Log the token for debugging

      const response = await fetch('https://my-worker.robert-9e7.workers.dev/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: updatedMessages }), // Send the entire chat history
        mode: 'cors' // Ensure CORS mode is set
      });

      console.log('Response status:', response.status); // Log response status

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Response data:', data); // Log the response data

      // Simulate typing delay
      setTimeout(() => {
        setIsTyping(false);
        if (data && data.response) {
          const botMessage = { role: 'system', content: data.response }; // Keep role as 'system' for backend
          setMessages((prev) => [...prev, botMessage]);
          console.log('Updated messages:', [...updatedMessages, botMessage]); // Log updated messages
        } else {
          console.error('Unexpected response structure:', data);
        }
      }, 1000); // 1 second delay
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  if (is_initializing) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Unicorn Chat</h1>
        {is_authenticated ? (
          <div className="chat-container">
            <div className="chat-window">
              {messages
                .filter((msg, index) => !(msg.role === 'system' && index === 0)) // Filter out the first system message
                .map((msg, index) => (
                  <div key={index} className={`message ${msg.role}`}>
                    <strong>{msg.role === 'user' ? 'You' : 'Unicorn'}:</strong> {msg.content}
                  </div>
                ))}
              {isTyping && (
                <div className="message system">
                  <strong>Unicorn:</strong> <span className="typing">...</span>
                </div>
              )}
            </div>
            <div className="input-container">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        ) : (
          <div>
            <p>Please sign in to chat with the unicorn.</p>
            <button onClick={() => requestSignIn()}>Sign In</button> {/* Use Rownd's requestSignIn method */}
          </div>
        )}
      </header>
    </div>
  );
}

export default ChatApp;
