import React, { useState, useRef, useEffect } from 'react';
import './AudioChatInterface.css';

const AudioChatInterface = ({ currentQuestion, onUserResponse, isActive }) => {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentQuestion) {
      addMessage('ai', currentQuestion);
      speakQuestion(currentQuestion);
    }
  }, [currentQuestion]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentTranscript(transcript);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    }
  }, [isListening]);

  const addMessage = (type, content) => {
    setMessages(prev => [...prev, { type, content, timestamp: Date.now() }]);
  };

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      setIsAISpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => setIsAISpeaking(false);
      utterance.onerror = () => setIsAISpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const handleMicClick = () => {
    if (!isListening) {
      startListening();
    } else {
      stopListening();
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      if (currentTranscript) {
        addMessage('user', currentTranscript);
        if (onUserResponse) {
          onUserResponse(currentTranscript);
        }
        setCurrentTranscript('');
      }
    }
  };

  return (
    <div className="audio-chat-interface">
      {/* Chat Messages Area */}
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message-bubble ${message.type}`}>
            <div className="message-avatar">
              {message.type === 'ai' ? '🤖' : '👤'}
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-author">{message.type === 'ai' ? 'AI Interviewer' : 'You'}</span>
                {isListening && index === messages.length - 1 && message.type === 'user' && (
                  <span className="typing-indicator">●</span>
                )}
              </div>
              <div className="message-text">{message.content}</div>
            </div>
          </div>
        ))}
        {currentTranscript && (
          <div className="message-bubble user interim">
            <div className="message-avatar">👤</div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-author">You</span>
                <span className="typing-indicator">Listening...</span>
              </div>
              <div className="message-text">{currentTranscript}</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Mic Button - Bottom Center */}
      <div className="mic-button-container">
        <button
          className={`mic-button ${isListening ? 'listening' : ''}`}
          onClick={handleMicClick}
        >
          <span className="mic-icon">{isListening ? '⏹️' : '🎤'}</span>
        </button>
      </div>

      {/* AI Speaking Indicator */}
      {isAISpeaking && (
        <div className="ai-speaking-indicator">
          🤖 AI is speaking...
        </div>
      )}
    </div>
  );
};

export default AudioChatInterface;



