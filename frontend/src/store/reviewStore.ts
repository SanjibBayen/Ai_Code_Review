import { create } from 'zustand';
import { ReviewRecord, CodeIssue, FileItem } from '../types';
import { reviewApi } from '../api/review.api';

interface ReviewState {
  currentReview: ReviewRecord | null;
  reviewLoading: boolean;
  reviewStep: string;
  selectedIssue: CodeIssue | null;
  activeFile: FileItem | null;
  openFiles: FileItem[];
  diffViewActive: boolean;
  activeDiffIssue: CodeIssue | null;
  
  // Actions
  setActiveFile: (file: FileItem) => void;
  openFile: (file: FileItem) => void;
  closeFile: (filePath: string) => void;
  updateFileContent: (path: string, content: string) => void;
  setSelectedIssue: (issue: CodeIssue | null) => void;
  setDiffViewActive: (active: boolean, issue?: CodeIssue | null) => void;
  previewImprovedCode: () => void;
  runReview: (data: { projectId?: string; code: string; fileName?: string; language?: string }) => Promise<ReviewRecord>;
  setCurrentReview: (review: ReviewRecord | null) => void;
}

const DEFAULT_FILES: FileItem[] = [
  {
    id: 'f1',
    name: 'auth.controller.js',
    path: 'src/controllers/auth.controller.js',
    type: 'file',
    language: 'javascript',
    content: `// Authentication Controller
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  // Generate 6-digit OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP in database
  const query = \`UPDATE users SET otp = '\${otpCode}' WHERE email = '\${email}'\`;
  await db.query(query);

  res.json({ message: 'OTP sent successfully' });
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const user = await db.query(\`SELECT * FROM users WHERE email = '\${email}' AND otp = '\${otp}'\`);
  
  if (!user || user.length === 0) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }

  // Generate JWT token
  const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET || 'secretKey', {
    expiresIn: '7d'
  });

  res.json({ token, user: user[0] });
};`
  },
  {
    id: 'f2',
    name: 'project.controller.js',
    path: 'src/controllers/project.controller.js',
    type: 'file',
    language: 'javascript',
    content: `// Project Management Controller
const db = require('../config/db');

exports.getProjects = async (req, res) => {
  const search = req.query.search || '';
  // Potential SQL injection risk
  const query = \`SELECT * FROM projects WHERE name LIKE '%\${search}%' ORDER BY created_at DESC\`;
  
  try {
    const results = await db.query(query);
    res.json({ projects: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProject = async (req, res) => {
  const { name, repository, branch } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const query = 'INSERT INTO projects (name, repository, branch) VALUES ($1, $2, $3) RETURNING *';
  const result = await db.query(query, [name, repository, branch]);
  
  res.status(201).json({ project: result[0] });
};`
  },
  {
    id: 'f3',
    name: 'aiReview.service.js',
    path: 'src/services/aiReview.service.js',
    type: 'file',
    language: 'javascript',
    content: `// AI Code Review Service
const { GoogleGenAI } = require('@google/genai');

class AIReviewService {
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async reviewCodeSnippet(code, language) {
    if (!code) throw new Error('Code is required');

    const prompt = \`Review this \${language} code for security vulnerabilities and performance bottlenecks:\n\n\${code}\`;
    
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return response.text;
  }
}

module.exports = new AIReviewService();`
  }
];

export const useReviewStore = create<ReviewState>((set, get) => ({
  currentReview: null,
  reviewLoading: false,
  reviewStep: 'Idle',
  selectedIssue: null,
  activeFile: DEFAULT_FILES[0],
  openFiles: DEFAULT_FILES,
  diffViewActive: false,
  activeDiffIssue: null,

  setActiveFile: (file) => set({ activeFile: file }),

  openFile: (file) => {
    const { openFiles } = get();
    if (!openFiles.some(f => f.path === file.path)) {
      set({ openFiles: [...openFiles, file], activeFile: file });
    } else {
      set({ activeFile: file });
    }
  },

  closeFile: (filePath) => {
    const { openFiles, activeFile } = get();
    const filtered = openFiles.filter(f => f.path !== filePath);
    let nextActive = activeFile;
    if (activeFile?.path === filePath) {
      nextActive = filtered.length > 0 ? filtered[filtered.length - 1] : null;
    }
    set({ openFiles: filtered, activeFile: nextActive });
  },

  updateFileContent: (path, content) => {
    const { openFiles, activeFile } = get();
    const updatedFiles = openFiles.map(f => f.path === path ? { ...f, content, isModified: true } : f);
    const updatedActive = activeFile?.path === path ? { ...activeFile, content, isModified: true } : activeFile;
    set({ openFiles: updatedFiles, activeFile: updatedActive });
  },

  setSelectedIssue: (issue) => set({ selectedIssue: issue }),

  setDiffViewActive: (active, issue = null) => set({ diffViewActive: active, activeDiffIssue: issue }),

  previewImprovedCode: () => {
    const { currentReview, activeFile } = get();
    if (!currentReview?.improvedCode || !activeFile) return;

    set({
      diffViewActive: true,
      activeDiffIssue: {
        id: 'ai-improved-code',
        severity: 'SUGGESTION',
        title: 'AI improved code',
        file: activeFile.path,
        line: 1,
        description: 'A full-file quality improvement suggested by the AI review.',
        whyItMatters: 'Review the proposed implementation before applying it to your workspace.',
        suggestedFix: 'Compare the generated code and apply it only if it fits your project requirements.',
        originalCode: activeFile.content || '',
        suggestedCode: currentReview.improvedCode,
      },
    });
  },

  runReview: async (data) => {
    set({ reviewLoading: true, reviewStep: '$ ai-review analyze' });

    // Terminal progress animation steps
    const steps = [
      '✓ Loading project workspace',
      '✓ Parsing AST & files',
      '● Detecting security vulnerabilities',
      '● Checking performance bottlenecks',
      '● Evaluating architectural best practices',
      '✓ Generating AI recommendations'
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 250));
      set({ reviewStep: step });
    }

    try {
      const res = await reviewApi.analyzeCode(data);
      set({
        currentReview: res.review,
        reviewLoading: false,
        reviewStep: 'Analysis Complete',
        selectedIssue: res.review.issues.length > 0 ? res.review.issues[0] : null
      });
      return res.review;
    } catch (err: any) {
      set({ reviewLoading: false, reviewStep: 'Review Failed' });
      throw err;
    }
  },

  setCurrentReview: (review) => set({ currentReview: review })
}));
