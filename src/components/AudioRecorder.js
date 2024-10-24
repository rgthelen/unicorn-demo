// src/components/AudioRecorder.js
import React, { useState, useRef } from 'react';
import microphoneIcon from './microphone.svg'; // Adjust the path as necessary
import './AudioRecorder.css'; // Import CSS for styling
import { useRownd } from '@rownd/react';
import { isIOS } from './detectIOS';

const AudioRecorder = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunks = useRef([]);
  const timerRef = useRef(null); // Ref to store the timer
  const [progress, setProgress] = useState(0); // State for recording progress
  const { getAccessToken } = useRownd();

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorder) {
        mediaRecorder.stop(); // Only call stop if mediaRecorder is initialized
      }
      setIsRecording(false);
      clearTimeout(timerRef.current); // Clear the timer if recording is stopped manually
      clearInterval(timerRef.current); // Clear the progress interval
      setProgress(0); // Reset progress
    } else {
      if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices) {
        console.error('MediaRecorder not supported on your browser!');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        let options = null;

        if (isIOS()) {
          // Use 'audio/mp4' or 'audio/m4a' for iOS
          if (MediaRecorder.isTypeSupported('audio/mp4')) {
            options = { mimeType: 'audio/mp4' };
          } else if (MediaRecorder.isTypeSupported('audio/m4a')) {
            options = { mimeType: 'audio/m4a' };
          } else {
            console.error('No supported MIME types found for iOS devices');
            return;
          }
        } else {
          // Use 'audio/webm;codecs=opus' for other devices
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            options = { mimeType: 'audio/webm; codecs=opus' };
          } else if (MediaRecorder.isTypeSupported('audio/webm')) {
            options = { mimeType: 'audio/webm' };
          } else {
            console.error('No supported MIME types found for non-iOS devices');
            return;
          }
        }

        const recorder = new MediaRecorder(stream, options);
        setMediaRecorder(recorder);

        recorder.ondataavailable = (event) => {
          audioChunks.current.push(event.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks.current, { type: recorder.mimeType });
          audioChunks.current = [];
          await sendAudioToWorker(audioBlob, recorder.mimeType);
        };

        recorder.start(1000); // Start recording with a timeslice of 1000ms (1 second)
        setIsRecording(true);
        setProgress(0); // Reset progress when starting recording

        // Set a timer to stop recording after 10 seconds
        timerRef.current = setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop(); // Automatically stop the recording
            setIsRecording(false);
          }
        }, 10000); // 10 seconds

        // Update progress every second
        let elapsed = 0;
        const interval = setInterval(() => {
          elapsed += 1;
          setProgress((elapsed / 10) * 100); // Update progress as a percentage
          if (elapsed >= 10) {
            clearInterval(interval); // Clear interval after 10 seconds
          }
        }, 1000);
        timerRef.current = interval; // Store the interval ID
      } catch (err) {
        console.error('Error accessing media devices:', err);
      }
    }
  };

  const sendAudioToWorker = async (audioBlob, mimeType) => {
    try {
      const fileExtension = mimeType.includes('mp4') || mimeType.includes('m4a') ? 'm4a' : 'webm';
      const formData = new FormData();
      formData.append('file', audioBlob, `recording.${fileExtension}`);

      const accessToken = await getAccessToken({ waitForToken: true });

      const response = await fetch('https://audio-test.robert-9e7.workers.dev/api/transcribe', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Do not set 'Content-Type'; let the browser handle it
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to send audio to worker');
      }

      const data = await response.json();
      console.log('Transcription result:', data);
      if (onTranscription) {
        onTranscription(data);
      }
    } catch (error) {
      console.error('Error sending audio to worker:', error);
    }
  };

  return (
    <div>
      <button
        onClick={toggleRecording}
        className={`microphone-button ${isRecording ? 'recording' : ''}`}>
        <img src={microphoneIcon} alt="Microphone" className="microphone-icon" />
      </button>
      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%`, backgroundColor: 'pink', height: '5px', transition: 'width 0.1s' }} />
      </div>
    </div>
  );
};

export default AudioRecorder;
