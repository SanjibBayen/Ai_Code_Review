export type Severity = 'CRITICAL' | 'ERROR' | 'WARNING' | 'SUGGESTION' | 'INFO';

export interface CodeIssue {
  id: string;
  severity: Severity;
  title: string;
  file: string;
  line: number;
  description: string;
  whyItMatters: string;
  suggestedFix: string;
  originalCode?: string;
  suggestedCode?: string;
}

export interface ReviewScoreBreakdown {
  security: number;
  performance: number;
  maintainability: number;
  readability: number;
  bestPractices: number;
}

export interface ReviewRecord {
  id: string;
  projectId?: string;
  projectName: string;
  repository?: string;
  branch?: string;
  language: string;
  overallScore: number;
  scores: ReviewScoreBreakdown;
  issues: CodeIssue[];
  filesReviewedCount: number;
  status: 'Completed' | 'Analyzing' | 'Failed';
  createdAt: string;
  summary?: string;
  suggestions?: string[];
  improvedCode?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  repository: string;
  branch: string;
  language: string;
  reviewsCount: number;
  lastReviewed: string;
  score: number;
  status: 'Healthy' | 'Needs Attention' | 'Critical Issues';
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  updated_at: string;
  default_branch: string;
}

export interface GitHubUser {
  connected: boolean;
  username: string;
  avatar: string;
  repositoriesCount: number;
  connectedAt: string;
}

export interface FileItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
  children?: FileItem[];
  isOpened?: boolean;
  isModified?: boolean;
}
