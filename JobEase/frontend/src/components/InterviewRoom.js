import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './InterviewRoom.css';

const InterviewRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { type } = location.state || { type: 'technical' };

  const [resume, setResume] = useState(null);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [skills, setSkills] = useState([]);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [interimUserText, setInterimUserText] = useState('');
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [notes, setNotes] = useState('');

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

  const processResume = async (resumeFile) => {
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
      return { skills: data.skills || [], questions: data.questions || [] };
    } catch (error) {
      console.error('Error processing resume:', error);
      return {
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
        questions: []
      };
    }
  };

  const generateQuestions = async (currentSkills, interviewType) => {
    try {
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: currentSkills,
          interviewType: interviewType,
          previousQuestions: []
        }),
      });

      if (!response.ok) throw new Error('Failed to generate questions');
      const data = await response.json();
      return [data.question];
    } catch (error) {
      console.error('Error generating questions:', error);
      const questions = {
        technical: [
          "Explain the difference between let, const, and var in JavaScript.",
          "How would you optimize a React component that's re-rendering too frequently?"
        ],
        behavioral: [
          "Tell me about a time when you had to work under pressure."
        ]
      };
      // Fix fallback access
      const fallbackList = questions[interviewType] || questions.technical;
      return fallbackList;
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1;
      utterance.volume = 1.0;
      speechSynthesis.speak(utterance);
    }
  };

  const startInterview = async () => {
    if (!resume) {
      alert('Please upload your resume first');
      return;
    }

    try {
      // 1. Process resume and get initial questions
      const { skills: extractedSkills, questions: initialQuestions } = await processResume(resume);

      setSkills(extractedSkills);

      let finalQuestions = initialQuestions;

      // 2. If no questions returned (edge case), try generating one
      if (!finalQuestions || finalQuestions.length === 0) {
        finalQuestions = await generateQuestions(extractedSkills, type);
      }

      setIsInterviewStarted(true);
      setCurrentQuestion(finalQuestions[0]);
      setInterviewHistory([{ type: 'ai', content: finalQuestions[0] }]);

      // Auto-speak first question
      speakText(finalQuestions[0]);

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
          endInterview();
        }
      }, 500);
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview. Please try again.');
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
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result;
              lastAudioBase64Ref.current = base64;
            };
            reader.readAsDataURL(audioBlob);
          };

          mediaRecorderRef.current.start();
          setIsRecording(true);
        })
        .catch((error) => {
          console.error('Error accessing microphone:', error);
          alert('Microphone access denied.');
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
    if (recognitionRef.current) recognitionRef.current.start();
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const nextQuestion = async () => {
    try {
      const finalUser = userResponse || interimUserText;
      setInterviewHistory(prev => [...prev, { type: 'user', content: finalUser }]);
      setInterimUserText('');

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

      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: skills.length > 0 ? skills : ['JavaScript', 'React'],
          interviewType: type,
          previousQuestions: interviewHistory.filter(msg => msg.type === 'ai').map(msg => msg.content),
          userResponse: finalUser
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
      const nextQ = 'Could you elaborate on that?';
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
    <div className="interview-room">
      <header className="oxford-header">
        <div className="header-brand">
          <h2>JobEase</h2>
        </div>
        <div className="header-status">
          <div className="status-item">
            <span className="timer">
              ⏱ {(() => {
                const totalSec = Math.ceil(timeLeftMs / 1000);
                const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
                const s = (totalSec % 60).toString().padStart(2, '0');
                return `${m}:${s}`;
              })()}
            </span>
          </div>
          <div className="status-item">
            Status: {isInterviewStarted ? 'Live' : 'Ready'}
          </div>
        </div>
      </header>

      {!isInterviewStarted ? (
        <div className="upload-container">
          <div className="resume-card">
            <h3>Welcome to your Interview</h3>
            <p>Please upload your resume to begin the personalized session.</p>

            <div className="upload-area">
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                id="resume-upload"
                className="file-input"
              />
              <label htmlFor="resume-upload" className="file-upload-label">
                {resume ? `Selected: ${resume.name}` : 'Select Resume (PDF)'}
              </label>
            </div>

            <button
              onClick={startInterview}
              className="start-btn"
              disabled={!resume}
            >
              Start Interview
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="dashboard-grid">
            {/* LEFT PANEL: Log */}
            <div className="panel left-panel">
              <div className="panel-header">
                📝 Conversation Log
              </div>
              <div className="history-list">
                {interviewHistory.map((msg, i) => (
                  <div key={i} className={`chat-bubble ${msg.type}`}>
                    <strong>{msg.type === 'ai' ? 'AI' : 'YOU'}: </strong>
                    {msg.content}
                  </div>
                ))}
                {interimUserText && (
                  <div className="chat-bubble user">
                    <strong>YOU: </strong> <span className="interim-text">{interimUserText}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CENTER PANEL: Main Interaction */}
            <div className="panel center-panel">
              <div className="ai-avatar-container">
                <div className="ai-avatar">
                  🤖
                </div>
                <div className="question-display">
                  "{currentQuestion}"
                </div>
              </div>

              <div className="mic-container">
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
                  className={`mic-button ${isRecording ? 'recording' : ''}`}
                  title={isRecording ? "Stop & Submit" : "Click to Speak"}
                >
                  {isRecording ? '⏹' : '🎤'}
                </button>
              </div>
            </div>

            {/* RIGHT PANEL: Tools */}
            <div className="panel right-panel">
              <div className="panel-header">
                🛠 Tools & Notes
              </div>
              <div className="tools-grid">
                <button className="tool-btn" onClick={() => speakText(currentQuestion)}>
                  🔊 Repeat Question
                </button>
                <button className="tool-btn" onClick={() => nextQuestion()}>
                  ⏭ Skip Question
                </button>
                <button className="tool-btn" onClick={() => alert("Take your time! The AI is waiting.")}>
                  ⏳ Need 10s to think
                </button>
              </div>

              <div className="notes-area">
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#002147' }}>Quick Notes</label>
                <textarea
                  className="notes-input"
                  placeholder="Type your thoughts here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="footer-bar">
            <button className="control-btn" onClick={() => {
              stopRecording();
              stopSpeechRecognition();
            }}>
              ⏸ Pause
            </button>
            <button className="control-btn danger" onClick={endInterview}>
              🔴 End Interview
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default InterviewRoom;
