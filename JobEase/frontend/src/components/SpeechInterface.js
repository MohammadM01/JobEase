import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import './SpeechInterface.css';

const SpeechInterface = forwardRef(({ onTranscript, onTranscriptComplete, isActive, currentQuestion }, ref) => {
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const spokenWordsRef = useRef([]);
  const [aiSpokenText, setAiSpokenText] = useState('');
  const [userSpokenText, setUserSpokenText] = useState('');
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  // Update AI spoken text when current question changes
  useEffect(() => {
    if (currentQuestion) {
      setAiSpokenText(currentQuestion);
    }
  }, [currentQuestion]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
            setUserSpokenText(prev => prev + transcript + ' ');
          } else {
            interim += transcript;
          }
        }

        setInterimTranscript(interim);
        setFinalTranscript(prev => prev + final);

        if (final && onTranscript) {
          onTranscript(final, interim);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Automatically restart listening
          startListening();
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          // Automatically restart if still supposed to be listening
          startListening();
        }
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsRecording(false);
      
      // Send final transcript when stopping
      if (onTranscriptComplete && (finalTranscript || userSpokenText)) {
        onTranscriptComplete(finalTranscript || userSpokenText);
      }
    }
  };

  const handleMicClick = () => {
    if (!isRecording) {
      startListening();
    } else {
      stopListening();
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      setIsAISpeaking(true);
      setAiSpokenText(text);

      utterance.onstart = () => {
        setIsAISpeaking(true);
      };

      utterance.onend = () => {
        setIsAISpeaking(false);
        setAiSpokenText('');
      };

      utterance.onerror = () => {
        setIsAISpeaking(false);
        setAiSpokenText('');
      };
      
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  };

  // Expose speakText function
  useImperativeHandle(ref, () => ({
    speakText,
    startListening,
    stopListening,
    isRecording
  }));

  return (
    <div className="speech-interface">
      <div className="speech-display-area">
        {/* AI Speaking Display */}
        {isAISpeaking && (
          <div className="speech-bubble ai-speech">
            <div className="speaker-label">🤖 AI:</div>
            <div className="speech-text animate-text">{aiSpokenText}</div>
          </div>
        )}

        {/* User Speaking Display */}
        {isRecording && (
          <div className="speech-bubble user-speech">
            <div className="speaker-label">🎤 You:</div>
            <div className="speech-text animate-text">
              {userSpokenText}
              {interimTranscript && <span className="interim">{interimTranscript}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Circular Mic Button */}
      <div className="mic-button-container">
        <button
          className={`mic-button ${isRecording ? 'recording' : ''}`}
          onClick={handleMicClick}
        >
          <span className="mic-icon">{isRecording ? '⏹️' : '🎤'}</span>
        </button>
      </div>

      {/* Visual Indicator */}
      {isRecording && (
        <div className="recording-indicator">
          <div className="pulse-dot"></div>
          <span>Listening...</span>
        </div>
      )}
    </div>
  );
});

SpeechInterface.displayName = 'SpeechInterface';

export default SpeechInterface;

