export type UserRole = 'admin' | 'professor' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Student extends User {
  role: 'student';
  group?: string;
  progress: number;
  casesCompleted: number;
  casesAssigned: number;
  competencies: Competency[];
}

export interface Competency {
  name: string;
  level: number; // 0-100
}

export interface Professor extends User {
  role: 'professor';
  department?: string;
  totalStudents: number;
  totalCases: number;
}

export type CaseDifficulty = 'basic' | 'intermediate' | 'advanced';
export type CaseStatus = 'draft' | 'published' | 'archived';
export type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'reviewed';

export interface Case {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  instructions: string;
  difficulty: CaseDifficulty;
  category: string;
  deadline?: string;
  evaluationCriteria: string[];
  suggestedResources: string[];
  status: CaseStatus;
  professorId: string;
  professorName: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: string[];
}

export interface Assignment {
  id: string;
  caseId: string;
  studentId: string;
  studentName: string;
  status: AssignmentStatus;
  response?: string;
  submittedAt?: string;
  feedback?: string;
  score?: number;
  maxScore: number;
  progress: number;
}

export interface Evaluation {
  id: string;
  assignmentId: string;
  caseId: string;
  caseTitle: string;
  studentId: string;
  studentName: string;
  response: string;
  score?: number;
  maxScore: number;
  feedback?: string;
  status: 'pending' | 'reviewed';
  reviewedAt?: string;
  reviewedBy?: string;
  rubric: RubricItem[];
}

export interface RubricItem {
  criterion: string;
  maxScore: number;
  score?: number;
  comment?: string;
}

export type SourceType = 'article' | 'book' | 'clinical_guide' | 'systematic_review' | 'clinical_trial' | 'web';
export type EvidenceLevel = 1 | 2 | 3 | 4 | 5;

export interface SearchResult {
  id: string;
  title: string;
  authors: string;
  year: number;
  source: string;
  type: SourceType;
  evidenceLevel: EvidenceLevel;
  abstract: string;
  url?: string;
  doi?: string;
  journal?: string;
  reliability: 'high' | 'medium' | 'low';
  keywords: string[];
}

export interface BibliographyItem {
  id: string;
  type: 'book' | 'article' | 'web' | 'journal' | 'doi';
  author: string;
  title: string;
  year: string;
  publisher?: string;
  journal?: string;
  url?: string;
  doi?: string;
  userId: string;
  createdAt: string;
}

export type VerificationStatus = 'reliable' | 'caution' | 'unreliable';

export interface VerificationResult {
  id: string;
  input: string;
  inputType: 'url' | 'title' | 'doi';
  status: VerificationStatus;
  criteria: VerificationCriterion[];
  recommendations: string[];
  overallScore: number;
  userId: string;
  createdAt: string;
}

export interface VerificationCriterion {
  name: string;
  passed: boolean;
  weight: number;
  detail: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  ip: string;
  timestamp: string;
  details?: string;
}

export interface SystemService {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  latency: number;
  uptime: number;
  lastChecked: string;
  message?: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  services: SystemService[];
  lastUpdated: string;
  errorCount: number;
  uptime: number;
}

export type TestStatus = 'passed' | 'failed' | 'running' | 'pending';

export interface TestCase {
  id: string;
  name: string;
  category: string;
  status: TestStatus;
  duration?: number;
  lastRun?: string;
  message?: string;
  logs: string[];
}

export interface HedgeRule {
  id: string;
  name: string;
  description: string;
  category: 'search' | 'verification' | 'evaluation';
  active: boolean;
  examples: string[];
  professorId: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  userId: string;
  context: 'student' | 'professor' | 'admin';
}

export interface SystemConfig {
  platformName: string;
  maintenanceMode: boolean;
  userLimit: number;
  searchConfig: {
    maxResults: number;
    defaultFilter: SourceType;
    enableAI: boolean;
  };
  verificationConfig: {
    strictMode: boolean;
    autoVerify: boolean;
    minReliabilityScore: number;
  };
  securityConfig: {
    maxLoginAttempts: number;
    sessionTimeout: number;
    twoFactorAuth: boolean;
  };
}

export interface FavoriteSource {
  id: string;
  userId: string;
  searchResultId: string;
  addedAt: string;
}
