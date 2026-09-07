export interface InbuiltAudiencePreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  interests: string[];
  problems: string[];
  platformAffinity: string[];
}

export const INBUILT_AUDIENCE_PRESETS: InbuiltAudiencePreset[] = [
  {
    id: "nextjs_engineers",
    name: "Next.js & Full-Stack Developers",
    badge: "Web Engineers",
    description: "Modern developers building React & Next.js applications, server components, and performant web apps.",
    interests: ["Next.js", "React", "TypeScript", "Fullstack", "Web Performance"],
    problems: [
      "App Router architecture & caching",
      "Hydration & server component boundaries",
      "API route scalability",
    ],
    platformAffinity: ["x", "linkedin", "peerlist"],
  },
  {
    id: "ai_engineers",
    name: "AI Engineers & Agent Builders",
    badge: "AI & ML",
    description: "Engineers building LLM workflows, autonomous agent loops, RAG systems, and AI developer tools.",
    interests: ["AI Agents", "LLMs", "LangChain", "Vector Databases", "Prompt Engineering"],
    problems: [
      "Model latency & cost control",
      "Context window limitations",
      "Evaluation & reliability of agents",
    ],
    platformAffinity: ["x", "reddit", "blog"],
  },
  {
    id: "indie_builders",
    name: "Indie Builders & Solo Founders",
    badge: "Bootstrappers",
    description: "Bootstrappers and solo creators shipping SaaS products, MVPs, and building in public.",
    interests: ["Building in Public", "Bootstrapping", "SaaS", "Distribution", "Product Launch"],
    problems: [
      "Finding the first 100 users",
      "Balancing coding with marketing",
      "Pricing and conversion optimization",
    ],
    platformAffinity: ["x", "peerlist", "linkedin"],
  },
  {
    id: "tech_leaders",
    name: "Tech Leaders & Architects",
    badge: "Leadership",
    description: "Engineering managers, CTOs, and staff architects focused on system scale and developer velocity.",
    interests: ["System Design", "Cloud Infrastructure", "Engineering Leadership", "Microservices"],
    problems: [
      "Technical debt & legacy systems",
      "Engineering team productivity",
      "Cloud infrastructure costs",
    ],
    platformAffinity: ["linkedin", "blog", "x"],
  },
  {
    id: "ux_designers",
    name: "Product Designers & UX Engineers",
    badge: "Design Systems",
    description: "Designers and design engineers crafting intuitive design systems, typography, and polished micro-interactions.",
    interests: ["Design Systems", "UI/UX", "Tailwind CSS", "Figma", "Accessibility"],
    problems: [
      "Design-to-code translation gaps",
      "Accessibility & responsive design",
      "Token consistency across platforms",
    ],
    platformAffinity: ["x", "portfolio", "linkedin"],
  },
];

export const ONBOARDING_GOALS = [
  {
    id: "AUTHORITY",
    title: "Build Authority & Trust",
    description: "Share knowledge, build credibility, and become a recognized voice in your domain.",
  },
  {
    id: "LEAD_GEN",
    title: "Get Leads & Customers",
    description: "Attract high-intent inquiries, demo requests, and buyers for your product or service.",
  },
  {
    id: "TRAFFIC",
    title: "Maximum Reach & Traffic",
    description: "Get your work seen by as many people as possible and drive visitors to your project.",
  },
  {
    id: "COMMUNITY",
    title: "Grow an Engaged Audience",
    description: "Build a loyal following, start conversations, and connect directly with your peers.",
  },
];

export const ONBOARDING_PLATFORMS = [
  {
    id: "x",
    name: "Twitter / X",
    desc: "Short punchy posts, threads, and fast developer engagement.",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    desc: "Professional breakdowns, engineering lessons, and career insights.",
  },
  {
    id: "peerlist",
    name: "Peerlist",
    desc: "Project showcases, proof-of-work updates, and tech community feedback.",
  },
  {
    id: "blog",
    name: "Blog",
    desc: "In-depth articles, tutorials, and long-form technical authority.",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    desc: "Evergreen case studies, architectural breakdowns, and project showcases.",
  },
  {
    id: "reddit",
    name: "Reddit",
    desc: "Community discussions, authentic feedback, and targeted subreddits.",
  },
];

export const ONBOARDING_PROMOTION_TOLERANCES = [
  {
    id: "LOW",
    title: "Subtle / Organic",
    badge: "Low Promo",
    description: "100% focused on educational value and lessons. Zero aggressive sales pitches or intrusive links.",
  },
  {
    id: "MEDIUM",
    title: "Balanced Value",
    badge: "Recommended",
    description: "Provides upfront value first, followed by organic contextual calls-to-action and relevant product mentions.",
  },
  {
    id: "HIGH",
    title: "Proactive Launch",
    badge: "High Growth",
    description: "Direct product positioning, assertive promotional CTAs, and active conversion-focused copy.",
  },
];

export const ONBOARDING_AUTOMATIONS = [
  {
    id: "auto_analyze",
    title: "Auto-Analyze New Content",
    description: "Extract core themes, angles, intelligence, and ideas immediately upon importing any content source.",
  },
  {
    id: "auto_generate_plan",
    title: "Auto-Create Distribution Plans",
    description: "Synthesize targeted cross-platform strategies and platform recommendations once content analysis is ready.",
  },
];
