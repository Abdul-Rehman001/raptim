export interface IUser {
  _id: string;
  name?: string;
  email: string;
  image?: string;
  role?: string;
  phone?: string;
  jobTitle?: string;
  resumeText?: string;
  completedOnboarding?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface IJob {
  _id: string;
  userId: string;
  title: string;
  company: string;
  location?: string;
  status: string;
  jobDescription: string;
  jobUrl?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  platform?: string;
  matchScore?: number | null;
  analysis?: string;
  redFlags?: string[];
  redFlagAnalysis?: string;
  whatsStrong?: string;
  biggestGap?: string;
  followUpDate?: string | null;
  coldEmail?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tailoredResume?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resumeHistory?: any[];
  aiAnalyzedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  appliedDate?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
