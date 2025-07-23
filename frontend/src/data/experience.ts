export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  duration: string;
  location?: string;
  description: string;
  achievements: string[];
  technologies: string[];
  category: 'work' | 'ai' | 'tools';
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

export const experienceData: ExperienceItem[] = [
  {
    id: 'higher-logic-lead',
    company: 'Higher Logic',
    position: 'Lead Application Engineering Developer',
    duration: '11/2022 – 4/2025',
    location: 'Remote',
    description:
      'Drove application engineering growth by leading/mentoring a dynamic team and championing implementation and integration improvement initiatives. Evolved support capabilities by leading comprehensive digital transformation efforts.',
    achievements: [
      'Skilled in maintaining and debugging MVC marketing automation web application, ensuring optimal performance of relational SQL databases and middleware solutions',
      'Designed and implemented scalable solutions for customized API integrations and reports utilizing technologies such as SQL, PowerShell, and .NET',
      'Directly supported customers on related implementations/escalations of custom features',
      'Lead the development and adoption of enhanced processes for documentation, service monitoring, and resolving major, critical and P1 level incidents',
    ],
    technologies: [
      'SQL',
      'PowerShell',
      '.NET',
      'MVC',
      'API Integration',
      'Relational Databases',
      'Middleware',
    ],
    category: 'work',
  },
  {
    id: 'higher-logic-senior',
    company: 'Higher Logic',
    position: 'Senior Application Engineering Developer',
    duration: '4/2022 – 11/2022',
    location: 'Remote',
    description:
      "Continuously improved core support workflows while transforming the engineering organization's training and onboarding capabilities. Fostered cross-functional collaboration and key process enhancements by developing custom solutions.",
    achievements: [
      'Utilized technical expertise and diagnostic skills to resolve complex platform issues, leveraging code analysis, SQL queries, and system-level insights',
      'Accelerated incident detection times and mitigated potential customer impacts by implementing custom dashboards and a tailored DataDog alert system',
      "Enhanced the team's ability to address issues proactively",
      'Improved new engineer ramp-up speed by ~30%, building a structured onboarding program focused on building expertise in the enterprise technology stack and support/development methodologies',
      "Orchestrated escalation-level technical troubleshooting for Higher Logic's marketing automation platforms",
    ],
    technologies: [
      'SQL',
      'DataDog',
      'Code Analysis',
      'System Diagnostics',
      'Training Programs',
      'Process Improvement',
    ],
    category: 'work',
  },
  {
    id: 'higher-logic-developer',
    company: 'Higher Logic',
    position: 'Application Engineering Developer',
    duration: '8/2019 – 4/2022',
    location: 'Remote',
    description:
      "Continuously improved core support workflows while transforming the engineering organization's training and onboarding capabilities. Fostered cross-functional collaboration and key process enhancements by developing custom solutions.",
    achievements: [
      'Utilized technical expertise and diagnostic skills to resolve complex platform issues, leveraging code analysis, SQL queries, and system-level insights',
      'Accelerated incident detection times and mitigated potential customer impacts by implementing custom dashboards and a tailored DataDog alert system',
      "Enhanced the team's ability to address issues proactively",
      'Improved new engineer ramp-up speed by ~30%, building a structured onboarding program focused on building expertise in the enterprise technology stack and support/development methodologies',
      "Orchestrated escalation-level technical troubleshooting for Higher Logic's marketing automation platforms",
    ],
    technologies: [
      'SQL',
      'DataDog',
      'Code Analysis',
      'System Diagnostics',
      'Training Programs',
      'Process Improvement',
    ],
    category: 'work',
  },
  {
    id: 'zones-nfrastructure',
    company: 'Zones nFrastructure',
    position: 'Team Lead Supervisor / Tier 3 Support Technician',
    duration: '11/2017 – 7/2019',
    location: 'Remote',
    description:
      'Coached team leads and support technicians on technical troubleshooting, time management, and customer service. Provided technical support via phone, email, chat, and remote desktop session effectively with both technical and non-technical clients.',
    achievements: [
      'Experienced with threat detection and remediation through Microsoft 365 Defender, Audit logs, and backend diagnostics',
      'Analyzed suspicious activities, phishing/spam attacks, compromised accounts, and unauthorized access',
      'Configured compliance solutions such as retention policies, data governance, MFA, security audits, and eDiscovery',
      'Lead and executed tenant-to-tenant migrations, on-prem to cloud migrations, and hybrid Exchange deployments',
      'Performed mailbox, SharePoint, OneDrive, and Teams data migrations with minimal downtime and data loss',
    ],
    technologies: [
      'Microsoft 365 Defender',
      'Exchange Online',
      'SharePoint Online',
      'Teams',
      'OneDrive',
      'PowerShell',
      'eDiscovery',
      'MFA',
      'Data Migration',
    ],
    category: 'work',
  },
  {
    id: 'ai-development',
    company: 'AI Development',
    position: 'AI Development & Integration',
    duration: '2023 – Present',
    location: 'Remote',
    description:
      'Specialized in AI development and integration, working with cutting-edge AI technologies and tools to enhance development workflows and create intelligent applications.',
    achievements: [
      'Applied AI tools like GitHub Copilot and prompt engineering techniques to enhance development workflows',
      'Developed AI-powered solutions for automation and process improvement',
      'Integrated AI capabilities into existing applications and systems',
      'Created AI agents for specific business use cases and workflows',
    ],
    technologies: [
      'AI Development',
      'GitHub Copilot',
      'Prompt Engineering',
      'AI Integration',
      'Automation',
    ],
    category: 'ai',
  },
  {
    id: 'cursor-claude',
    company: 'Modern Development Tools',
    position: 'AI-Assisted Development',
    duration: '2023 – Present',
    location: 'Remote',
    description:
      'Leveraging modern AI-powered development tools to enhance productivity and code quality.',
    achievements: [
      'Utilized Cursor IDE for AI-assisted coding and development',
      'Applied Claude AI for code review, debugging, and problem-solving',
      'Enhanced development workflows with AI-powered tools',
      'Improved code quality and development speed through AI assistance',
    ],
    technologies: [
      'Cursor IDE',
      'Claude AI',
      'AI-Assisted Development',
      'Code Review',
      'Debugging',
    ],
    category: 'ai',
  },
];

export const skillCategories: SkillCategory[] = [
  {
    name: 'Programming & Scripting',
    skills: ['SQL', 'C#', 'JavaScript', 'PowerShell'],
  },
  {
    name: 'Web & Backend',
    skills: ['Node.js', 'React', '.NET', '.asp', 'DNS'],
  },
  {
    name: 'Tools & Environments',
    skills: [
      'Visual Studio',
      'SSMS',
      'Cursor',
      'GitHub',
      'Copilot',
      'Jira',
      'Confluence',
      'Microsoft Office 365 Business Admin',
      'Azure Active Directory',
      'Postman',
      'Windows Environment',
      'AWS',
    ],
  },
  {
    name: 'Microsoft Technologies',
    skills: [
      'Microsoft Office 365',
      'Exchange Online',
      'SharePoint Online',
      'Teams',
      'OneDrive',
      'Microsoft 365 Defender',
      'Azure Active Directory',
      'PowerShell',
    ],
  },
  {
    name: 'AI & Modern Tools',
    skills: [
      'AI Development',
      'AI Agents',
      'Cursor',
      'Claude',
      'GitHub Copilot',
      'Prompt Engineering',
    ],
  },
  {
    name: 'Security & Compliance',
    skills: [
      'Threat Detection',
      'MFA',
      'eDiscovery',
      'Data Governance',
      'Security Audits',
      'Compliance Solutions',
    ],
  },
];

export const coreExpertise = [
  'Software as a Service (SaaS)',
  'System Administration',
  'Computer Programming',
  'Team Leadership',
  'Customer Success and Implementation',
  'Process Improvement',
  'Staff Training',
  'Technical Support',
  'System Monitoring',
];

export const getExperienceByCategory = (category: 'work' | 'ai' | 'tools') => {
  return experienceData.filter(item => item.category === category);
};

export const getWorkExperience = () => getExperienceByCategory('work');
export const getAIExperience = () => getExperienceByCategory('ai');
export const getToolsExperience = () => getExperienceByCategory('tools');
