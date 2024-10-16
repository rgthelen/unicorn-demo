// src/App.js
import React, { useState, useEffect } from 'react';
import { useRownd } from '@rownd/react';
import './App.css'; // Ensure this import is correct
import SettingsMenu from './SettingsMenu';

function ChatApp() {
  const { is_authenticated, is_initializing, requestSignIn, getAccessToken, setUserValue, user } = useRownd();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    if (is_authenticated) {
      const initialMessage = constructInitialMessage(user);
      setMessages([initialMessage]);
    }
  }, [is_authenticated, user]);

  const constructInitialMessage = (user) => {
    let messageContent = "You are a magical unicorn named Sparkle. You love to chat with children, especially those around 5 years old. Always be whimsical, friendly, and full of wonder. Use playful language and encourage imagination. Keep responses short, ask easy questions, and use emojis!";

    if (user?.data?.first_name) {
      messageContent += ` The user's name is ${user.data.first_name}, but you don't have to use it all of the time.`;
    } else {
      messageContent += " If their name is not known ask for it.";
    }

    if (user?.data?.favorites) {
      messageContent += ` They previously mentioned they like ${user.data.favorites}. But, feel free to explore other areas of interest.`;
    }

    return {
      role: 'system',
      content: messageContent
    };
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    setMessageCount(messageCount + 1);

    try {
      const token = await getAccessToken();
      console.log('JWT Token:', token);

      const response = await fetch('https://my-worker.robert-9e7.workers.dev/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: updatedMessages }),
        mode: 'cors'
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Response data:', data);

      setTimeout(() => {
        setIsTyping(false);
        if (data && data.response) {
          const botMessage = { role: 'system', content: data.response };
          setMessages((prev) => [...prev, botMessage]);
          console.log('Updated messages:', [...updatedMessages, botMessage]);

          if (messageCount === 3 || (messageCount > 3 && (messageCount - 3) % 10 === 0)) {
            extractProfileData(updatedMessages);
          }
        } else {
          console.error('Unexpected response structure:', data);
        }
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const extractProfileData = async (messages) => {
    try {
      const token = await getAccessToken();

      const response = await fetch('https://my-worker.robert-9e7.workers.dev/api/extract-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        throw new Error('Failed to extract profile data');
      }

      const { profileData } = await response.json();
      console.log('Extracted Profile Data:', profileData);

      // Update Rownd profile with extracted data
      if (profileData.first_name) {
        setUserValue('first_name', profileData.first_name);
      }
      if (profileData.favorite_things) {
        setUserValue('favorites', profileData.favorite_things);
      }
    } catch (error) {
      console.error('Error extracting profile data:', error);
    }
  };

  if (is_initializing) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <SettingsMenu /> {/* Place the SettingsMenu component here */}
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
            <button onClick={() => requestSignIn()}>Sign In</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default ChatApp;
