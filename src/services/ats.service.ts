import { AtsScoreBreakdown } from "@/types";

// Standard technical skills taxonomy and common aliases/synonyms
const SKILL_SYNONYMS: Record<string, string[]> = {
  python: ["py", "python3", "python2", "django", "flask", "fastapi", "numpy", "pandas", "scipy"],
  javascript: ["js", "ecmascript", "node", "nodejs", "express", "expressjs"],
  typescript: ["ts"],
  java: ["core java", "j2ee", "spring", "springboot", "hibernate"],
  cplusplus: ["c++", "cpp"],
  csharp: ["c#", ".net", "dotnet", "asp.net"],
  react: ["reactjs", "react.js", "nextjs", "next.js", "redux", "zustand"],
  angular: ["angularjs", "angular 2+"],
  vue: ["vuejs", "vue.js", "nuxt", "nuxtjs"],
  html_css: ["html", "html5", "css", "css3", "sass", "scss", "tailwind", "tailwindcss", "bootstrap"],
  sql: ["postgresql", "postgres", "mysql", "sqlite", "oracle", "mariadb", "sql server", "mssql"],
  nosql: ["mongodb", "redis", "cassandra", "dynamodb", "couchbase", "firebase"],
  machine_learning: [
    "ml",
    "deep learning",
    "dl",
    "neural networks",
    "scikit-learn",
    "sklearn",
    "tensorflow",
    "keras",
    "pytorch",
    "predictive modeling",
    "nlp",
    "computer vision",
  ],
  data_analytics: ["pandas", "numpy", "powerbi", "tableau", "excel", "data visualization", "matplotlib", "seaborn"],
  cloud: ["aws", "amazon web services", "azure", "gcp", "google cloud", "cloud computing"],
  devops: ["docker", "kubernetes", "k8s", "ci/cd", "github actions", "jenkins", "terraform", "ansible"],
  git: ["github", "gitlab", "version control", "bitbucket"],
  api_design: ["rest", "restful", "rest api", "graphql", "grpc", "microservices"],
  testing: ["jest", "mocha", "cypress", "playwright", "selenium", "unit testing", "pytest"],
};

/**
 * Normalizes text to lowercase alphanumeric tokens
 */
export function normalizeTokens(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s_-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/**
 * Extracts skills from text based on taxonomy and exact phrases
 */
export function extractSkills(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const tokens = new Set(normalizeTokens(text));
  const foundSkills = new Set<string>();

  for (const [canonical, aliases] of Object.entries(SKILL_SYNONYMS)) {
    const formattedCanonical = canonical.replace(/_/g, " ");
    if (lower.includes(formattedCanonical) || tokens.has(formattedCanonical)) {
      foundSkills.add(formattedCanonical);
    }
    for (const alias of aliases) {
      if (lower.includes(alias.toLowerCase()) || tokens.has(alias.toLowerCase())) {
        foundSkills.add(formattedCanonical);
        break;
      }
    }
  }

  // Also extract specific single words and acronyms like AWS, Docker, Git, etc.
  const commonKeywords = [
    "git",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "linux",
    "agile",
    "scrum",
    "graphql",
    "rest",
    "figma",
    "prisma",
    "redis",
    "kafka",
    "pandas",
    "numpy",
  ];
  for (const kw of commonKeywords) {
    if (lower.includes(kw)) {
      foundSkills.add(kw);
    }
  }

  return Array.from(foundSkills);
}

export interface AtsEvaluationInput {
  studentResumeText: string;
  studentSkills?: string[];
  studentCgpa?: number | null;
  studentUgPercentage?: number;
  jdSummary?: string | null;
  requiredSkills: string[];
  preferredSkills?: string[];
  weights?: {
    skillMatch: number;
    semanticMatch: number;
    education: number;
    experience: number;
    project: number;
  };
}

/**
 * Calculates semantic similarity fallback between resume text and JD summary
 */
function calculateSemanticSimilarity(resumeText: string, jdText: string): number {
  if (!resumeText || !jdText) return 60; // neutral fallback
  const resumeTokens = new Set(normalizeTokens(resumeText));
  const jdTokens = normalizeTokens(jdText);

  if (jdTokens.length === 0) return 70;

  let matches = 0;
  for (const token of jdTokens) {
    if (resumeTokens.has(token)) {
      matches++;
    }
  }

  const overlapRatio = matches / Math.min(jdTokens.length, 100);
  // Scale between 50 and 98 based on contextual overlap
  return Math.min(98, Math.max(50, Math.round(50 + overlapRatio * 48)));
}

/**
 * Main ATS Resume Matching Engine
 * Weighted scoring: Skill (50%), Semantic (20%), Education (10%), Experience (10%), Project (10%)
 */
export function evaluateAtsScore(input: AtsEvaluationInput): AtsScoreBreakdown {
  const weights = input.weights || {
    skillMatch: 50,
    semanticMatch: 20,
    education: 10,
    experience: 10,
    project: 10,
  };

  const resumeText = input.studentResumeText || "";
  const resumeSkills = new Set<string>([
    ...(input.studentSkills || []).map((s) => s.toLowerCase()),
    ...extractSkills(resumeText),
  ]);

  const required = (input.requiredSkills || []).map((s) => s.toLowerCase().trim()).filter(Boolean);
  const preferred = (input.preferredSkills || []).map((s) => s.toLowerCase().trim()).filter(Boolean);

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  // Match required skills
  for (const reqSkill of required) {
    let isMatched = false;
    if (resumeSkills.has(reqSkill) || resumeText.toLowerCase().includes(reqSkill)) {
      isMatched = true;
    } else {
      // Check synonyms
      for (const [canonical, aliases] of Object.entries(SKILL_SYNONYMS)) {
        if (
          (canonical === reqSkill.replace(/\s+/g, "_") || aliases.includes(reqSkill)) &&
          aliases.some((a) => resumeSkills.has(a) || resumeText.toLowerCase().includes(a))
        ) {
          isMatched = true;
          break;
        }
      }
    }

    if (isMatched) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  }

  // Calculate Skill Match Score (out of weights.skillMatch, default 50)
  const reqMatchRatio = required.length > 0 ? matchedSkills.length / required.length : 0.8;
  const prefMatchCount = preferred.filter(
    (p) => resumeSkills.has(p) || resumeText.toLowerCase().includes(p)
  ).length;
  const prefBonus = preferred.length > 0 ? (prefMatchCount / preferred.length) * 0.15 : 0;
  const rawSkillScore = Math.min(1.0, reqMatchRatio + prefBonus);
  const skillMatchScore = Math.round(rawSkillScore * weights.skillMatch * 10) / 10;

  // Calculate Semantic Match Score (out of weights.semanticMatch, default 20)
  const semanticRatio = calculateSemanticSimilarity(resumeText, input.jdSummary || "") / 100;
  const semanticMatchScore = Math.round(semanticRatio * weights.semanticMatch * 10) / 10;

  // Calculate Education Score (out of weights.education, default 10)
  const cgpa = input.studentCgpa || (input.studentUgPercentage ? input.studentUgPercentage / 10 : 7.0);
  const educationRatio = Math.min(1.0, Math.max(0.4, cgpa / 10));
  const educationScore = Math.round(educationRatio * weights.education * 10) / 10;

  // Calculate Experience Score (out of weights.experience, default 10)
  const hasInternship = /intern|internship|trainee|apprentice|work experience/i.test(resumeText);
  const experienceScore = hasInternship ? weights.experience : Math.round(weights.experience * 0.7 * 10) / 10;

  // Calculate Project Relevance Score (out of weights.project, default 10)
  const hasProjects = /project|developed|built|created|implemented|architected/i.test(resumeText);
  const projectScore = hasProjects ? weights.project : Math.round(weights.project * 0.6 * 10) / 10;

  // Total ATS Score (0 - 100)
  const atsScore = Math.min(
    100,
    Math.round(skillMatchScore + semanticMatchScore + educationScore + experienceScore + projectScore)
  );

  return {
    atsScore,
    skillMatchScore,
    semanticMatchScore,
    educationScore,
    experienceScore,
    projectScore,
    matchedSkills,
    missingSkills,
  };
}
