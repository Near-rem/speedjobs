import { Job, CandidateProfile } from '../types';

export const INITIAL_PROFILE: CandidateProfile = {
  fullName: 'Alex Rivera',
  title: 'Senior Full Stack Engineer',
  email: 'alex.rivera@speedtalent.dev',
  phone: '+1 (555) 234-5678',
  location: 'San Francisco, CA (Open to Remote)',
  skills: [
    'React',
    'TypeScript',
    'Node.js',
    'Next.js',
    'PostgreSQL',
    'Tailwind CSS',
    'GraphQL',
    'Docker',
    'AWS'
  ],
  experienceYears: 6,
  expectedSalary: 155000,
  availability: 'Immediately',
  bio: 'Full-stack builder passionate about fast iterations, clean UI architectures, and scalable cloud backends. Ready to join high-velocity teams and ship on day one.',
  github: 'https://github.com/alexrivera',
  linkedin: 'https://linkedin.com/in/alex-rivera-dev',
  portfolio: 'https://alexrivera.work',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
};

export const SEED_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Full Stack Engineer (React & Node)',
    company: 'HyperScale Labs',
    logo: '⚡',
    location: 'San Francisco, CA',
    remoteType: 'Remote',
    salaryMin: 160000,
    salaryMax: 195000,
    salaryPeriod: 'yr',
    jobType: 'Full-time',
    urgency: 'Flash (24h)',
    department: 'Engineering',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    experienceLevel: 'Senior',
    description: 'We are looking for an exceptional Senior Full Stack Engineer to build lightning-fast web applications. We move quickly: same-day code reviews, weekly production releases, and zero red tape. High equity and express hiring pipeline.',
    responsibilities: [
      'Architect and deliver end-to-end features using React, Vite, and Node.js microservices',
      'Optimize database queries and caching layers for sub-100ms response times',
      'Collaborate directly with founders and product design in quick design sprints',
      'Mentor junior engineers and champion clean TypeScript patterns'
    ],
    requirements: [
      '5+ years of production experience building high-performance web applications',
      'Deep mastery of TypeScript, modern React hooks, and Node.js async runtimes',
      'Hands-on experience with relational databases (PostgreSQL) and REST/GraphQL APIs',
      'High autonomy, bias for action, and ability to thrive in rapid environments'
    ],
    benefits: [
      'Hiring decision guaranteed within 48 hours of application',
      '100% remote flexibility & home office stipend ($2,500)',
      'Top-tier health, dental, and vision insurance',
      'Generous equity package (0.4% - 0.8%)'
    ],
    postedAt: '1 hour ago',
    hiringSpeedDays: 1,
    applicantsCount: 14,
    featured: true,
    speedInterviewAvailable: true
  },
  {
    id: 'job-2',
    title: 'Staff Rust & Systems Engineer',
    company: 'Orbit Engine',
    logo: '🪐',
    location: 'New York, NY',
    remoteType: 'Hybrid',
    salaryMin: 185000,
    salaryMax: 230000,
    salaryPeriod: 'yr',
    jobType: 'Full-time',
    urgency: 'Urgent (48h)',
    department: 'Infrastructure',
    skills: ['Rust', 'Distributed Systems', 'Linux', 'Docker', 'C++'],
    experienceLevel: 'Lead',
    description: 'Help us build the next generation of ultra-low-latency financial streaming infrastructure. You will work on lock-free data structures, kernel bypass networking, and memory-safe concurrency.',
    responsibilities: [
      'Design and implement high-throughput network protocols in modern Rust',
      'Profile and optimize CPU cache misses, allocation overhead, and async latency',
      'Participate in architecture reviews for critical consensus mechanisms'
    ],
    requirements: [
      '6+ years systems programming in Rust or modern C++',
      'Solid grasp of memory management, SIMD, and concurrent data models',
      'Experience with Linux kernel network stack and benchmarking tools'
    ],
    benefits: [
      'Immediate technical screening within 24 hours',
      'Competitive base + performance bonus + equity',
      'Comprehensive wellness benefits and catered lunches'
    ],
    postedAt: '3 hours ago',
    hiringSpeedDays: 2,
    applicantsCount: 9,
    featured: true,
    speedInterviewAvailable: true
  },
  {
    id: 'job-3',
    title: 'Product Designer (Design Systems & UX)',
    company: 'PulseFlow Studio',
    logo: '🎨',
    location: 'Austin, TX',
    remoteType: 'Remote',
    salaryMin: 130000,
    salaryMax: 165000,
    salaryPeriod: 'yr',
    jobType: 'Full-time',
    urgency: 'Flash (24h)',
    department: 'Design',
    skills: ['Figma', 'Design Systems', 'Prototyping', 'User Research', 'Tailwind CSS'],
    experienceLevel: 'Mid',
    description: 'PulseFlow needs a craft-obsessed Product Designer to lead our design system evolution and craft snappy, micro-interaction-rich enterprise workflows.',
    responsibilities: [
      'Craft Figma component libraries with auto-layout and variable tokens',
      'Partner closely with front-end engineers to ensure pixel-perfect fidelity',
      'Conduct rapid user interviews and test interactive prototypes weekly'
    ],
    requirements: [
      '3+ years designing complex SaaS or consumer web applications',
      'Strong portfolio showcasing interaction design and design system tokens',
      'Familiarity with CSS / web layout constraints'
    ],
    benefits: [
      'Instant 1-Click portfolio review',
      'Annual learning stipend & conference budget ($3,000)',
      'Flexible working hours & unlimited PTO'
    ],
    postedAt: '4 hours ago',
    hiringSpeedDays: 1,
    applicantsCount: 21,
    featured: false,
    speedInterviewAvailable: true
  },
  {
    id: 'job-4',
    title: 'AI / LLM Applications Engineer',
    company: 'NeuralVibe',
    logo: '🧠',
    location: 'Seattle, WA',
    remoteType: 'Remote',
    salaryMin: 165000,
    salaryMax: 210000,
    salaryPeriod: 'yr',
    jobType: 'Full-time',
    urgency: 'Flash (24h)',
    department: 'AI & Data',
    skills: ['Python', 'TypeScript', 'LangChain', 'OpenAI', 'Vector DB', 'Next.js'],
    experienceLevel: 'Senior',
    description: 'NeuralVibe is democratizing multimodal generative AI workflows. We need an engineer who loves shipping agentic pipelines, RAG systems, and responsive frontends that delight users.',
    responsibilities: [
      'Build evaluation pipelines and prompt optimization frameworks',
      'Integrate vector embeddings (Qdrant/Pinecone) for semantic document retrieval',
      'Implement streaming UI components with real-time feedback and abort controllers'
    ],
    requirements: [
      '4+ years building software with strong proficiency in Python and TypeScript',
      'Demonstrated experience shipping LLM-driven features to production',
      'Solid understanding of chunking, reranking, and hallucination reduction techniques'
    ],
    benefits: [
      'Speed hiring: 15-min technical chat + 1-day turnaround offer',
      'Latest M4 Max MacBook Pro + $1,000 workspace allowance',
      'Generous seed equity'
    ],
    postedAt: 'Just now',
    hiringSpeedDays: 1,
    applicantsCount: 32,
    featured: true,
    speedInterviewAvailable: true
  },
  {
    id: 'job-5',
    title: 'Cloud DevOps & SRE Specialist',
    company: 'CloudSprint Technologies',
    logo: '☁️',
    location: 'Denver, CO',
    remoteType: 'Remote',
    salaryMin: 145000,
    salaryMax: 180000,
    salaryPeriod: 'yr',
    jobType: 'Full-time',
    urgency: 'Urgent (48h)',
    department: 'DevOps',
    skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Prometheus', 'Docker'],
    experienceLevel: 'Senior',
    description: 'CloudSprint provides high-availability infrastructure for tier-1 fintech startups. You will lead our multi-region Kubernetes deployments and automate disaster recovery.',
    responsibilities: [
      'Automate infrastructure as code using Terraform and GitOps (ArgoCD)',
      'Maintain 99.99% uptime SLAs across distributed Kubernetes clusters',
      'Streamline CI/CD pipelines to achieve <3 minute build-and-test runs'
    ],
    requirements: [
      '5+ years managing production cloud workloads on AWS or GCP',
      'Strong expertise in container orchestration, Istio service mesh, and observability',
      'Scripting proficiency in Python, Bash, or Go'
    ],
    benefits: [
      'Same-day response to verified applicants',
      'Quarterly performance bonuses',
      'Comprehensive healthcare and 401(k) matching up to 5%'
    ],
    postedAt: '5 hours ago',
    hiringSpeedDays: 2,
    applicantsCount: 11,
    featured: false,
    speedInterviewAvailable: false
  },
  {
    id: 'job-6',
    title: 'Contract Frontend Speed Builder (React + Tailwind)',
    company: 'FlashSprint Gig',
    logo: '🚀',
    location: 'Anywhere',
    remoteType: 'Remote',
    salaryMin: 75,
    salaryMax: 110,
    salaryPeriod: 'hr',
    jobType: 'Contract',
    urgency: 'Flash (24h)',
    department: 'Frontend',
    skills: ['React', 'Tailwind CSS', 'TypeScript', 'Vite', 'REST API'],
    experienceLevel: 'Mid',
    description: 'Immediate 4-week sprint contract to build 6 responsive portal pages from ready Figma specs. We pay weekly via direct deposit and provide immediate onboarding.',
    responsibilities: [
      'Convert Figma components into modular, typed React components with Tailwind CSS',
      'Wire up API endpoints and handle loading/empty/error states cleanly',
      'Ensure 100% responsive design across mobile and desktop devices'
    ],
    requirements: [
      'Available to start within 24-48 hours',
      'Demonstrated high speed in shipping clean React code',
      'Excellent communication and async responsiveness on Slack'
    ],
    benefits: [
      'Instant contract offer for qualified candidates',
      'Direct weekly payout with transparent billing',
      'Potential extension into ongoing retainers'
    ],
    postedAt: '2 hours ago',
    hiringSpeedDays: 1,
    applicantsCount: 18,
    featured: true,
    speedInterviewAvailable: true
  },
  {
    id: 'job-7',
    title: 'Growth Marketing & Performance Lead',
    company: 'FlashScale Digital',
    logo: '📈',
    location: 'Chicago, IL',
    remoteType: 'Hybrid',
    salaryMin: 120000,
    salaryMax: 150000,
    salaryPeriod: 'yr',
    jobType: 'Full-time',
    urgency: 'Same-Week',
    department: 'Marketing',
    skills: ['SEO', 'Google Ads', 'Paid Social', 'Analytics', 'Conversion Optimization'],
    experienceLevel: 'Mid',
    description: 'Drive rapid customer acquisition and experiment velocity. Run 5+ A/B tests weekly, scale paid channels efficiently, and partner with creative teams.',
    responsibilities: [
      'Manage $150k+/month performance ad budgets across Meta, Google, and LinkedIn',
      'Optimize conversion funnels from landing page through onboarding completion',
      'Track CAC, LTV, and payback periods in real-time dashboards'
    ],
    requirements: [
      '3+ years managing direct-response marketing for B2B or B2C SaaS',
      'Data-driven mindset with advanced Google Analytics 4 and SQL skills',
      'Proven track record scaling revenue efficiently'
    ],
    benefits: [
      'Rapid interview pipeline (2 rounds total)',
      'Uncapped performance bonus pool',
      'Hybrid work flexibility with commuter benefits'
    ],
    postedAt: '1 day ago',
    hiringSpeedDays: 3,
    applicantsCount: 16,
    featured: false,
    speedInterviewAvailable: true
  },
  {
    id: 'job-8',
    title: 'Junior Frontend Developer (React)',
    company: 'NextGen Velocity',
    logo: '🌟',
    location: 'Boston, MA',
    remoteType: 'Remote',
    salaryMin: 85000,
    salaryMax: 105000,
    salaryPeriod: 'yr',
    jobType: 'Full-time',
    urgency: 'Urgent (48h)',
    department: 'Engineering',
    skills: ['React', 'JavaScript', 'HTML/CSS', 'Git', 'Tailwind CSS'],
    experienceLevel: 'Junior',
    description: 'Looking to kickstart your engineering career in a fast-paced environment? Join NextGen Velocity where you will pair with senior mentors and ship production code in your first week.',
    responsibilities: [
      'Build reusable UI elements and fix responsive layout bugs',
      'Write unit tests and participate in code reviews',
      'Collaborate on design sprint implementations'
    ],
    requirements: [
      '1-2 years experience with React or impressive portfolio of personal projects',
      'Strong grasp of CSS flexbox/grid and modern JavaScript ES6+',
      'Hungry to learn and receptive to constructive code feedback'
    ],
    benefits: [
      'Mentorship pairing with Senior Staff Engineer',
      'Education stipend for books and courses',
      'Fast promotion cycle based on shipped output'
    ],
    postedAt: '6 hours ago',
    hiringSpeedDays: 2,
    applicantsCount: 45,
    featured: false,
    speedInterviewAvailable: true
  }
];

export const INITIAL_APPLICATIONS = [
  {
    id: 'app-1',
    jobId: 'job-1',
    jobTitle: 'Senior Full Stack Engineer (React & Node)',
    company: 'HyperScale Labs',
    logo: '⚡',
    location: 'San Francisco, CA (Remote)',
    salaryText: '$160k - $195k / yr',
    status: 'Speed Interview' as const,
    appliedAt: 'Yesterday, 3:15 PM',
    urgency: 'Flash (24h)' as const,
    pitchNote: '6 years of React/Node production expertise, built high-scale systems and love rapid iterations!',
    interviewSlot: 'Tomorrow at 10:30 AM PST (15-Min Speed Chat)',
    feedback: 'Profile passed instant match with 96% score. Invited to 15-min lightning sync.'
  },
  {
    id: 'app-2',
    jobId: 'job-4',
    jobTitle: 'AI / LLM Applications Engineer',
    company: 'NeuralVibe',
    logo: '🧠',
    location: 'Seattle, WA (Remote)',
    salaryText: '$165k - $210k / yr',
    status: 'Fast Screened' as const,
    appliedAt: '2 days ago',
    urgency: 'Flash (24h)' as const,
    pitchNote: 'Shipped production RAG and agentic workflows using LangChain and Next.js.',
    feedback: 'Recruiter reviewed your SpeedPass. Matching with the hiring engineering manager today.'
  }
];
