// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { useRownd } from '@rownd/react';
import './App.css';
import SettingsMenu from './SettingsMenu';
import ConfettiButton from './ConfettiButton';
import SignInCallToAction from './components/SignInCallToAction';
import unicornImage from './fun-unicorn.png';
import AudioRecorder from './components/AudioRecorder';
import AudioPlayer from './components/AudioPlayer';


function ChatApp() {
// Removed is_authenticated and requestSignIn
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [audioData, setAudioData] = useState(null);
  const messagesRef = useRef([]);
  const chatWindowRef = useRef(null);
  const { getAccessToken, user, isLoading } = useRownd(); // Ref for the chat window

  useEffect(() => {
    const initialDelay = 1000; // 1 second delay
    const retryDelay = 3000; // 3 seconds delay
    let timeoutId;

    const initializeMessages = () => {
      if (!isLoading && messagesRef.current.length === 0) {
        console.log('User data:', user); // Debugging line
        if (user && user.data) {
          const initialMessage = constructInitialMessage(user);
          messagesRef.current = [initialMessage];
        } else {
          console.log('User data is empty or not available, retrying...');
          timeoutId = setTimeout(initializeMessages, retryDelay);
        }
      }
    };

    timeoutId = setTimeout(initializeMessages, initialDelay);

    return () => clearTimeout(timeoutId); // Cleanup timeout on unmount
  }, [user, isLoading]);

  useEffect(() => {
    // Scroll to the bottom of the chat window whenever messages change
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messagesRef.current.length]);

  const constructInitialMessage = (user) => {
    let messageContent = "You are a magical unicorn named Sparkle. You love to chat with children, especially those around 5 years old. Keep everything short and concise. Always be whimsical, friendly, and full of wonder. Use playful language and encourage imagination. Keep responses short and ask easy questions and use emojis!";

    if (user?.data?.first_name) {
      messageContent += ` The user's name is ${user.data.first_name}, try to say "welcome back" early on, but don't repeat it.`;
    } else {
      messageContent += ` If their name is not known ask for it.`;
    }

    if (user?.data?.favorites) {
      messageContent += ` They previously mentioned they like ${user.data.favorites}. Mention that you remember their favorites, but, feel free to explore other areas of interest.`;
    }

    return {
      role: 'system',
      content: messageContent
    };
  };


    const sendMessage = async (messageContent = null) => {
      const content = messageContent !== null ? String(messageContent) : input;

      console.log('Content to send:', content); // Debugging line

      if (typeof content !== 'string') {
        console.error('Expected a string but received:', typeof content);
        return;
      }

      if (content.trim() === '') return;

      const userMessage = { role: 'user', content };
      messagesRef.current = [...messagesRef.current, userMessage];
      setInput('');
      setIsTyping(true);
      setMessageCount(messageCount + 1);

      console.log('Messages before sending:', messagesRef.current);

      try {
        const token = await getAccessToken();
        console.log('JWT Token:', token);

        const response = await fetch('https://my-worker.robert-9e7.workers.dev/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ messages: messagesRef.current }),
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
            messagesRef.current = [...messagesRef.current, botMessage];
            console.log('Updated messages:', messagesRef.current);

            if (data.audioData) {
              setAudioData(data.audioData);
            }

            if (messageCount === 3 || (messageCount > 3 && (messageCount - 3) % 20 === 0)) {
              extractProfileData(messagesRef.current);
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
     
     /*  if (profileData.favorite_things) {
        const currentFavorites = user?.data?.favorites ? user.data.favorites.split(', ') : [];
        const newFavorites = profileData.favorite_things.split(', ');

        // Merge and ensure uniqueness
        const updatedFavorites = Array.from(new Set([...currentFavorites, ...newFavorites])).join(', ');

        console.log(`Updating favorites to: ${updatedFavorites}`);
        await setUserValue('favorites', updatedFavorites);
      }
      // Update first_name
      if (profileData.first_name) {
        console.log(`Updating first_name to: ${profileData.first_name}`);
        await setUserValue('first_name', profileData.first_name);
      }
 */
      // Update favorites

    } catch (error) {
      console.error('Error extracting profile data:', error);
    }
  };

 

  const handleTranscription = (data) => {
    console.log('Received transcription:', data);
    if (data && data.text) {
      setInput(data.text); // Optional: If you want to display it in the input field
      console.log('Input set to:', data.text);
      
      // Call sendMessage with the transcribed text
      sendMessage(data.text);
    }
  };

  return (
    <div className="App">
      <SettingsMenu />
      <header className="App-header">
        <h1>Unicorn Chat</h1>
        <div className="chat-container">
          <div className="chat-window" ref={chatWindowRef}>
            {messagesRef.current
              .filter((msg, index) => !(msg.role === 'system' && index === 0))
              .map((msg, index) => (
                <div key={index} className={`message ${msg.role}`}>
                  {msg.role === 'system' ? (
                    <img src={unicornImage} alt="Unicorn" className="unicorn-avatar" />
                  ) : null}
                  <SignInCallToAction text={msg.content} />
                </div>
              ))}
            {isTyping && (
              <div className="message system">
                <img src={unicornImage} alt="Unicorn" className="unicorn-avatar" />
                <span className="typing">...</span>
              </div>
            )}
          </div>
          <div className="input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                console.log('Input changed:', e.target.value);
                setInput(e.target.value);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  console.log('Enter key pressed');
                  sendMessage();
                }
              }}
              placeholder="Type your message..."
            />
            <AudioRecorder onTranscription={handleTranscription} />
            <button onClick={() => sendMessage()}>Send</button>
          </div>
        </div>
        {audioData && <AudioPlayer audioData={audioData} />}
      </header>
      <ConfettiButton />
    </div>
  );
}

export default ChatApp;
