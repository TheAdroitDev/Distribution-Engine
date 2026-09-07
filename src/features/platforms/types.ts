export type PlatformId =
  | "x"
  | "linkedin"
  | "peerlist"
  | "github"
  | "reddit"
  | "blog"
  | "portfolio";

export type PlatformFormat =
  // X
  | "short_post"
  | "thread"
  | "technical_opinion"
  | "reply"
  | "discussion"
  // LinkedIn
  | "professional_post"
  | "engineering_lesson"
  | "case_study"
  | "project_update"
  // Peerlist
  | "project_showcase"
  // GitHub
  | "readme"
  | "documentation"
  | "release_update"
  // Reddit
  | "question"
  | "answer"
  | "technical_post"
  // Blog
  | "article"
  | "deep_dive"
  | "tutorial"
  // Portfolio
  | "project_section"
  | "architecture_decision";

export type PlatformAction =
  | "publish"
  | "reply"
  | "create_thread"
  | "update_project"
  | "update_documentation"
  | "update_readme"
  | "create_discussion"
  | "add_case_study"
  | "add_section"
  | "create_case_study"
  | "post"
  | "comment"
  | "release_update"
  | "update";

export type PlatformConstraints = {
  maxTextLength?: number | null;
  supportsLongForm: boolean;
  supportsThreads: boolean;
  supportsReplies: boolean;
  supportsLinks: boolean;
  supportsImages: boolean;
  supportsVideo: boolean;
  supportsCode: boolean;
  supportsMarkdown: boolean;
  supportsPersistentContent: boolean;
  requiresCommunityContext: boolean;
  promotionSensitivity: "LOW" | "MEDIUM" | "HIGH";
};

export type PlatformStrategyRules = {
  strengths: string[];
  weakUseCases: string[];
  bestFor: string[];
  avoid: string[];
};

export type DistributionGoalId =
  | "REACH"
  | "PROFILE_DISCOVERY"
  | "CREDIBILITY"
  | "NETWORK_GROWTH"
  | "PROJECT_DISCOVERY"
  | "HIRING"
  | "COLLABORATION"
  | "TRAFFIC"
  | "COMMUNITY"
  | "LEADS";

export type PlatformGoalAffinity = Record<DistributionGoalId, number>; // 0 to 1

export type PlatformDefinition = {
  id: PlatformId;
  name: string;
  purpose: string;
  formats: PlatformFormat[];
  actions: PlatformAction[];
  validCombinations: Array<{ formatId: PlatformFormat; actionId: PlatformAction }>;
  constraints: PlatformConstraints;
  strategyRules: PlatformStrategyRules;
  goalAffinity: PlatformGoalAffinity;
};
