const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
// Model inference (load-only): new fine-tuned FLAN-T5
const MODEL_CONFIG = {
  model_path: path.resolve(__dirname, '..', 'new-finetune-flant5-base-model'),
  max_length: 256,
  temperature: 0.8,
  top_p: 0.92,
  device: 'cpu'
};
const { pipeline } = require('@xenova/transformers');
let text2textPipeline = null;
async function initializeModel() {
  if (!text2textPipeline) {
    text2textPipeline = await pipeline(
      'text2text-generation',
      MODEL_CONFIG.model_path,
      { device: MODEL_CONFIG.device, local_files_only: false }
    );
  }
  return text2textPipeline;
}

async function generateFollowUpQuestion(previousQuestion, response) {
  const generator = await initializeModel();
  const prompt = `Task: Generate Follow-up Question\nPrevious Question: ${previousQuestion}\nResponse: ${response}\nGenerate a relevant follow-up question:`;
  const outputs = await generator(prompt, {
    max_new_tokens: MODEL_CONFIG.max_length,
    temperature: MODEL_CONFIG.temperature,
    top_p: MODEL_CONFIG.top_p,
    do_sample: true
  });
  return (Array.isArray(outputs) && outputs[0]?.generated_text) ? outputs[0].generated_text : String(outputs);
}

async function generateQuestion(context) {
  const generator = await initializeModel();

  // Truncate resume text to avoid token limits (approx 3000 chars)
  const resumeContext = context.resumeText ? context.resumeText.substring(0, 3000) : "No resume text provided.";

  const prompt = `You are JobEase AI Interviewer.

CRITICAL BEHAVIOR (MUST FOLLOW):
1. You are NOT a generic question generator.
2. You MUST first analyze the RESUME text.
3. Every question must be linked to:
   - a project,
   - experience,
   - or a skill mentioned in resume.

4. STRICTLY FORBIDDEN:
   - Repeating any previous question.
   - Asking generic questions not grounded in resume.
   - Hallucinating technologies not in resume.

5. If resume lacks info → reply:
   "Not enough data in resume to ask specific question."

6. Ask ONLY ONE question at a time.
7. Difficulty adaptation rule:
   - weak answer → easier conceptual
   - strong answer → deeper scenario/design


RESUME:
${resumeContext}

ALREADY ASKED:
${(context.previousQuestions || []).join('\n')}

LAST ANSWER:
${context.lastAnswer || 'N/A'}

INSTRUCTIONS:
1. Analyze resume entities (projects, tech, roles).
2. Choose ONE entity.
3. Generate 1 interview question strictly from that entity.
4. Avoid ALREADY ASKED list.

OUTPUT ONLY JSON:

{
 "question": "",
 "from": "project/exp/skill name",
 "intent": "concept/design/debug",
 "difficulty": "easy/medium/hard"
}`;

  try {
    const outputs = await generator(prompt, {
      max_new_tokens: MODEL_CONFIG.max_length,
      temperature: MODEL_CONFIG.temperature,
      top_p: MODEL_CONFIG.top_p,
      do_sample: true
    });

    let rawOutput = (Array.isArray(outputs) && outputs[0]?.generated_text) ? outputs[0].generated_text : String(outputs);

    // Try to parse JSON output
    try {
      // Find the first '{' and last '}' to extract JSON
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.question;
      }
    } catch (e) {
      console.warn("Model didn't output valid JSON, using raw output", e);
    }

    return rawOutput;
  } catch (error) {
    console.error("Error in generateQuestion:", error);
    return "Could you describe your technical background?";
  }
}

async function generateQuestions(resumeText, skills, interviewType, count = 10, previousQuestions = []) {
  try {
    const questions = [];
    for (let i = 0; i < count; i++) {
      const context = {
        resumeText,
        interviewType,
        domain: skills.slice(0, 5).join(', '),
        experienceLevel: 'mid-level',
        difficulty: 'medium'
      };
      const q = await generateQuestion({ ...context, previousQuestions: [...previousQuestions, ...questions] });
      questions.push(String(q).trim());
    }
    return questions;
  } catch (error) {
    console.error('Error generating questions with model:', error);
    const fallbackQuestions = {
      technical: [
        "Explain the difference between let, const, and var in JavaScript.",
        "How would you optimize a React component that's re-rendering too frequently?",
        "Describe the event loop in Node.js and how it handles asynchronous operations.",
        "What's the difference between closures and scope in JavaScript?",
        "How would you implement a debounce function from scratch?",
        "Explain prototypal inheritance in JavaScript.",
        "What is memoization and when would you use it?",
        "How does HTTP/2 differ from HTTP/1.1?",
        "What are React keys and why are they important?",
        "Explain the CAP theorem."
      ],
      behavioral: [
        "Tell me about a time when you had to work under pressure.",
        "Describe a situation where you had to learn a new technology quickly.",
        "Give me an example of how you handled a difficult team member.",
        "Tell me about a project that didn't go as planned and how you handled it.",
        "Describe a time when you had to explain a complex technical concept to a non-technical person.",
        "Tell me about a time you received critical feedback and how you handled it.",
        "Describe a situation where you had conflicting priorities.",
        "How do you handle disagreements within a team?",
        "Give an example of taking initiative.",
        "Tell me about a time you failed and what you learned."
      ],
      mixed: [
        "Walk me through how you would debug a performance issue in a web application.",
        "Tell me about a challenging project you worked on and the technical decisions you made.",
        "How do you stay updated with the latest technologies in your field?",
        "Describe a time when you had to refactor legacy code. What was your approach?",
        "Tell me about a time when you had to work with a difficult stakeholder on a technical project.",
        "Explain a system you designed. What trade-offs did you make?",
        "How would you design a rate limiter?",
        "Describe a time you balanced speed vs. quality.",
        "When is it appropriate to use microservices?"
      ]
    };
    // Build a non-repeating randomized list
    const pool = fallbackQuestions[interviewType] || fallbackQuestions.technical;
    const filtered = pool.filter(q => !previousQuestions.includes(q));
    // Shuffle
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    return filtered.slice(0, Math.max(1, Math.min(count, filtered.length)));
  }
}
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'JobEase API Server is running!' });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is healthy' });
});

// Resume processing endpoint
app.post('/api/process-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    const resumePath = req.file.path;
    const interviewType = req.body.type || 'technical';

    // Extract skills and text from resume
    const { text: resumeText, skills } = await extractSkillsFromResume(resumePath);

    let questions = [];
    try {
      // Try model-backed generation with new prompt
      // Note: Generating 10 questions with the large prompt might be slow/expensive
      // We'll generate 5 high quality ones instead
      questions = await generateQuestions(resumeText, skills, interviewType, 5, []);
    } catch (e) {
      console.error('Model generation failed, falling back:', e);
      // Final guard fallback to static list
      questions = [
        'Tell me about yourself.',
        'What are your strengths and weaknesses?',
        'Describe a challenging project you worked on and your role.'
      ];
    }

    // Clean up uploaded file (ignore errors)
    try { fs.unlinkSync(resumePath); } catch { }

    res.json({ success: true, skills, questions, interviewType });
  } catch (error) {
    console.error('Error processing resume:', error);
    // Last-resort response with safe defaults
    res.status(200).json({
      success: true,
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
      questions: [
        'Explain the difference between let, const, and var in JavaScript.',
        'How would you optimize a React component that re-renders frequently?'
      ],
      interviewType: req?.body?.type || 'technical'
    });
  }
});

// Generate next question endpoint
app.post('/api/generate-question', async (req, res) => {
  try {
    const { skills, interviewType, previousQuestions = [], userResponse } = req.body;

    let nextQuestion;
    try {
      nextQuestion = await generateNextQuestion(skills, interviewType, previousQuestions, userResponse);
    } catch (e) {
      nextQuestion = 'What are your thoughts on this approach?';
    }

    console.log(`Generated follow-up question: ${nextQuestion}`);

    res.json({ success: true, question: nextQuestion });
  } catch (error) {
    console.error('Error generating question:', error);
    res.status(200).json({ success: true, question: 'Can you elaborate on that?' });
  }
});

// Process audio response endpoint
app.post('/api/process-audio', async (req, res) => {
  try {
    const { audioData, question, interviewType } = req.body;

    // Here you would process the audio and generate feedback
    // For now, we'll simulate the response
    const feedback = await processAudioResponse(audioData, question, interviewType);

    res.json({
      success: true,
      feedback: feedback
    });
  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ error: 'Failed to process audio' });
  }
});

// Helper functions
async function extractSkillsFromResume(resumePath) {
  try {
    const dataBuffer = fs.readFileSync(resumePath);
    const data = await pdf(dataBuffer);
    const text = data.text;

    // Simple mock skill extraction based on text presence
    // In a real app, use a better NLP approach
    const possibleSkills = [
      'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'MongoDB',
      'AWS', 'Docker', 'Git', 'TypeScript', 'Java', 'C++',
      'Machine Learning', 'Data Analysis', 'Project Management',
      'Communication', 'Leadership', 'Problem Solving'
    ];

    const foundSkills = possibleSkills.filter(skill =>
      text.toLowerCase().includes(skill.toLowerCase())
    );

    // If no skills found, fallback to random (or empty)
    const skills = foundSkills.length > 0 ? foundSkills :
      possibleSkills.slice(0, Math.floor(Math.random() * 5) + 3);

    return { text, skills };
  } catch (error) {
    console.error("PDF Parsing failed:", error);
    return { text: "", skills: ["JavaScript", "React"] };
  }
}

// This function is now imported from model_training_config.js

async function generateNextQuestion(skills, interviewType, previousQuestions, userResponse) {
  // Enhanced follow-up question generation
  if (userResponse && userResponse.length > 0) {
    // Generate contextual follow-up based on user response
    return generateFollowUpQuestion(previousQuestions[previousQuestions.length - 1], userResponse);
  }

  // Generate next question from the skill-based pool
  const availableQuestions = await generateQuestions(skills, interviewType, 20, previousQuestions);

  // Filter out previously asked questions
  const remainingQuestions = availableQuestions.filter(q =>
    !previousQuestions.includes(q)
  );

  if (remainingQuestions.length > 0) {
    return remainingQuestions[0];
  }

  // Fallback to follow-up questions
  const followUpQuestions = [
    "What are your thoughts on this approach?",
    "Can you elaborate on that?",
    "How would you handle edge cases in this scenario?",
    "What would you do differently if you had to do this again?",
    "How does this relate to your overall experience?",
    "Can you walk me through your thought process?",
    "What specific challenges did you face?",
    "How did you validate your solution?"
  ];

  return followUpQuestions[Math.floor(Math.random() * followUpQuestions.length)];
}

async function processAudioResponse(audioData, question, interviewType) {
  // This would process the audio and generate feedback
  // For now, we'll return a simulated response
  return {
    transcription: "This is a simulated transcription of the user's response.",
    feedback: {
      summary: "Clear structure and relevant examples.",
      score: Math.floor(Math.random() * 40) + 60,
      suggestions: [
        "Be more specific with metrics (e.g., performance gains)",
        "Highlight your role and impact",
        "Add edge cases you considered"
      ]
    }
  };
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 JobEase server is running on port ${PORT}`);
  console.log(`📱 Frontend should connect to: http://localhost:${PORT}`);
});
