import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AudioChatInterface from './AudioChatInterface';
import './InterviewRoom.css';

const InterviewRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { type } = location.state || { type: 'technical' };

  const [resume, setResume] = useState(null);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [showSpeechInterface, setShowSpeechInterface] = useState(false);
  const [interimUserText, setInterimUserText] = useState('');
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const timerRef = useRef(null);
  const lastAudioBase64Ref = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);


  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (interimTranscript) setInterimUserText(interimTranscript);
        if (finalTranscript) {
          setUserResponse(prev => (prev ? prev + ' ' : '') + finalTranscript);
          setInterimUserText('');
        }
      };
    }
  }, []);

  const handleResumeUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResume(file);
    } else {
      alert('Please upload a PDF file');
    }
  };

  const extractSkillsFromResume = async (resumeFile) => {
    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('type', type);

    try {
      const response = await fetch('/api/process-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process resume');
      }

      const data = await response.json();
      return data.skills;
    } catch (error) {
      console.error('Error processing resume:', error);
      // Fallback to default skills
      return ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'];
    }
  };

  const generateQuestions = async (skills, interviewType) => {
    try {
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: skills,
          interviewType: interviewType,
          previousQuestions: []
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      // When first starting, backend endpoint returns a single question; wrap as list
      return [data.question];
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback to default questions
      const questions = {
        technical: [
          "Explain the difference between let, const, and var in JavaScript.",
          "How would you optimize a React component that's re-rendering too frequently?",
          "Describe your experience with database design and normalization."
        ],
        behavioral: [
          "Tell me about a time when you had to work under pressure.",
          "Describe a situation where you had to learn a new technology quickly.",
          "Give me an example of how you handled a difficult team member."
        ],
        mixed: [
          "Walk me through how you would debug a performance issue in a web application.",
          "Tell me about a challenging project you worked on and the technical decisions you made.",
          "How do you stay updated with the latest technologies in your field?"
        ]
      };

      return questions[interviewType] || questions.technical;
    }
  };

  const startInterview = async () => {
    if (!resume) {
      alert('Please upload your resume first');
      return;
    }

    try {
      const skills = await extractSkillsFromResume(resume);
      const questions = await generateQuestions(skills, type);

      setIsInterviewStarted(true);
      setCurrentQuestion(questions[0]);
      setInterviewHistory([{ type: 'ai', content: questions[0] }]);
      setIsInterviewActive(true);
      // Start 10-minute timer
      const endAt = Date.now() + 10 * 60 * 1000;
      setTimeLeftMs(endAt - Date.now());
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        const remaining = endAt - Date.now();
        setTimeLeftMs(Math.max(0, remaining));
        if (remaining <= 0) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setIsInterviewActive(false);
          endInterview();
        }
      }, 500);
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview. Please try again.');
    }
  };



  const handleTranscriptComplete = (transcript) => {
    // Handle complete transcript
    setUserResponse(transcript);
    setIsRecording(false);
  };

  const toggleSpeechInterface = () => {
    setShowSpeechInterface(!showSpeechInterface);
    if (!showSpeechInterface && 'speechSynthesis' in window && currentQuestion) {
      // Speak the current question when entering audio mode
      const utterance = new SpeechSynthesisUtterance(currentQuestion);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const startRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          mediaRecorderRef.current = new MediaRecorder(stream);
          audioChunksRef.current = [];

          mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
          };

          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            // Convert to base64 for transport
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result;
              lastAudioBase64Ref.current = base64;
              console.log('Audio recorded:', audioBlob);
            };
            reader.readAsDataURL(audioBlob);
          };

          mediaRecorderRef.current.start();
          setIsRecording(true);
        })
        .catch((error) => {
          console.error('Error accessing microphone:', error);
          alert('Microphone access denied. Please allow microphone access to continue.');
        });
    } else {
      alert('Your browser does not support audio recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const startSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any current speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0; // Slightly faster for natural flow
      utterance.pitch = 1;
      utterance.volume = 1.0; // Max volume as requested

      speechSynthesis.speak(utterance);
    }
  };

  const nextQuestion = async () => {
    try {
      // Push final user text to history
      const finalUser = userResponse || interimUserText;
      setInterviewHistory(prev => [...prev, { type: 'user', content: finalUser }]);
      setInterimUserText('');

      // Optionally send audio to backend for feedback
      const feedbackResp = await fetch('/api/process-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: lastAudioBase64Ref.current || null,
          question: currentQuestion,
          interviewType: type
        })
      }).catch(() => null);

      if (feedbackResp && feedbackResp.ok) {
        const feedbackData = await feedbackResp.json();
        if (feedbackData?.feedback) {
          let feedbackText = '';
          if (typeof feedbackData.feedback === 'string') {
            feedbackText = feedbackData.feedback;
          } else if (typeof feedbackData.feedback === 'object') {
            const { summary, score, suggestions } = feedbackData.feedback;
            feedbackText = [
              summary ? `Feedback: ${summary}` : null,
              Number.isFinite(score) ? `Score: ${score}` : null,
              Array.isArray(suggestions) && suggestions.length ? `Suggestions: ${suggestions.join('; ')}` : null
            ].filter(Boolean).join(' | ');
          }
          if (feedbackText) {
            setInterviewHistory(prev => [...prev, { type: 'ai', content: feedbackText }]);
          }
        }
      }

      // Generate next question
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: ['JavaScript', 'React', 'Node.js'],
          interviewType: type,
          previousQuestions: interviewHistory.filter(msg => msg.type === 'ai').map(msg => msg.content)
        })
      });

      let nextQ = 'What are your thoughts on this approach?';
      if (response.ok) {
        const data = await response.json();
        nextQ = data.question;
      }

      setCurrentQuestion(nextQ);
      setInterviewHistory(prev => [...prev, { type: 'ai', content: nextQ }]);
      setUserResponse('');
      speakText(nextQ);
    } catch (error) {
      console.error('Error generating next turn:', error);
      const nextQ = 'What are your thoughts on this approach?';
      setCurrentQuestion(nextQ);
      setInterviewHistory(prev => [...prev, { type: 'ai', content: nextQ }]);
      setUserResponse('');
      speakText(nextQ);
    }
  };

  const endInterview = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    navigate('/dashboard');
  };

  return (
    <>
      <div className="interview-room">
        <div className="interview-header">
          <h2>Interview Room - {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {isInterviewStarted && (
              <div className="timer" aria-label="Time left">
                {(() => {
                  const totalSec = Math.ceil(timeLeftMs / 1000);
                  const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
                  const s = (totalSec % 60).toString().padStart(2, '0');
                  return `${m}:${s}`;
                })()}
              </div>
            )}
            <button onClick={endInterview} className="end-interview-btn">End Interview</button>
          </div>
        </div>

        <div className="interview-content">
          {!isInterviewStarted ? (
            <div className="resume-upload-section">
              <h3>Upload Your Resume</h3>
              <p>Upload your resume so we can generate personalized questions based on your skills and experience.</p>

              <div className="upload-area">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  id="resume-upload"
                  className="file-input"
                />
                <label htmlFor="resume-upload" className="upload-label">
                  {resume ? `Selected: ${resume.name}` : 'Choose PDF File'}
                </label>
              </div>

              <button
                onClick={startInterview}
                className="start-interview-btn"
                disabled={!resume}
              >
                Start Interview
              </button>
            </div>
          ) : (
            <div className="interview-interface">
              <div className="interview-history" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <h3>Conversation</h3>
                <div className="history-messages">
                  {/* Current AI question on top if not in history yet */}
                  {!interviewHistory.length && currentQuestion && (
                    <div className="message ai">
                      <strong>AI:</strong>
                      <p className="text-lg font-medium">{currentQuestion}</p>
                    </div>
                  )}
                  {interviewHistory.map((message, index) => (
                    <div key={index} className={`message ${message.type}`}>
                      <strong>{message.type === 'ai' ? 'AI' : 'You'}:</strong>
                      <p>{message.content}</p>
                    </div>
                  ))}
                  {interimUserText && (
                    <div className="message user">
                      <strong>You:</strong>
                      <p>{interimUserText}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Bottom center recording control */}
      {isInterviewStarted && (
        <div className="bottom-controls">
          <button
            onClick={() => {
              if (isRecording) {
                stopRecording();
                stopSpeechRecognition();
                nextQuestion();
              } else {
                startRecording();
                startSpeechRecognition();
              }
            }}
            className={`record-large-btn ${isRecording ? 'recording' : ''}`}
          >
            {isRecording ? '⏹️ Stop' : '🎤 Start Recording'}
          </button>
        </div>
      )}
    </>
  );
};

export default InterviewRoom;
