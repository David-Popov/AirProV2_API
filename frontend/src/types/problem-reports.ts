/**
 * Categories for problem reports
 */
export const ProblemCategory = {
  FeatureNotWorking: 0,
  DataNotInserted: 1,
  Bug: 2,
  UIIssue: 3,
  PerformanceIssue: 4,
  Other: 5,
} as const;

export type ProblemCategory = typeof ProblemCategory[keyof typeof ProblemCategory];

/**
 * Problem category options for dropdown
 */
export const PROBLEM_CATEGORY_OPTIONS = [
  { value: ProblemCategory.FeatureNotWorking, labelKey: 'problem_reports.categories.feature_not_working' },
  { value: ProblemCategory.DataNotInserted, labelKey: 'problem_reports.categories.data_not_inserted' },
  { value: ProblemCategory.Bug, labelKey: 'problem_reports.categories.bug' },
  { value: ProblemCategory.UIIssue, labelKey: 'problem_reports.categories.ui_issue' },
  { value: ProblemCategory.PerformanceIssue, labelKey: 'problem_reports.categories.performance_issue' },
  { value: ProblemCategory.Other, labelKey: 'problem_reports.categories.other' },
] as const;

/**
 * Reported problem from API
 */
export interface ReportedProblem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: ProblemCategory;
  description: string;
  screenshotUrl: string | null;
  hasScreenshot: boolean;
  createdAt: string;
}

/**
 * Request to create a problem report
 */
export interface CreateReportedProblemRequest {
  category: ProblemCategory;
  description: string;
}

