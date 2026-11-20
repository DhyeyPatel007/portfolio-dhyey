export type ViewName = 'home' | 'projects' | 'about';
export type Category = 'ai' | 'mobile' | 'web' | 'security';

export interface ProjectItem {
  id: string;
  name: string;
  desc: string;
  catLabel: string;
  cats: Category[];
  link: string;
  poster: string;
}

export const PROFILE = {
  firstName: 'Dhyey',
  fullName: 'Dhyey Patel',
  email: 'dhyeypatel.work@gmail.com',
  linkedin: 'https://www.linkedin.com/in/dhyeypatel-work',
  github: 'https://github.com/DhyeyPatel007',
};

export const PROJECTS: ProjectItem[] = [
  {
    id: 'specballoon',
    name: 'SpecBalloon',
    desc: 'AI that reads 2D CAD drawings and auto-balloons dimensions into FAI/PPAP Excel.',
    catLabel: 'AI TOOL · 2026',
    cats: ['ai'],
    link: 'https://spec-balloon.vercel.app',
    poster: '/assets/posters/specballoon.png',
  },
  {
    id: 'auditify',
    name: 'Auditify',
    desc: 'Free website-audit tool — 36 checks, full report, PDF and monitoring.',
    catLabel: 'WEB & SAAS · 2026',
    cats: ['web'],
    link: 'https://auditify.krynex.in',
    poster: '/assets/posters/auditify.png',
  },
  {
    id: 'dopadiary',
    name: 'DopaDiary',
    desc: "Parkinson's symptom tracking with 4 trained engines. Live in production.",
    catLabel: 'MOBILE · HEALTH · 2026',
    cats: ['mobile'],
    link: 'https://dopadiary.vercel.app',
    poster: '/assets/posters/dopadiary.png',
  },
  {
    id: 'gillnet',
    name: 'GillNet AI',
    desc: 'Phishing detection for URLs and text with a heuristic engine.',
    catLabel: 'SECURITY · 2026',
    cats: ['security', 'mobile'],
    link: 'https://gillnet-project.vercel.app',
    poster: '/assets/posters/gillnet.png',
  },
  {
    id: 'phalanx',
    name: 'PHALANX',
    desc: 'Dispute-defense swarm for PayPal sellers, with a human approval gate.',
    catLabel: 'AI TOOL · 2026',
    cats: ['ai', 'security'],
    link: 'https://phalanx.krynex.in',
    poster: '/assets/posters/phalanx.png',
  },
  {
    id: 'tether',
    name: 'TETHER',
    desc: 'Split-brain persistence so AI agents survive disconnects and merge back safely.',
    catLabel: 'AI TOOL · 2026',
    cats: ['ai'],
    link: 'https://tether-ten-psi.vercel.app',
    poster: '/assets/posters/tether.png',
  },
  {
    id: 'evenly',
    name: 'Evenly',
    desc: 'Expense-splitting app — paise-perfect splits and per-app UPI settle-up.',
    catLabel: 'MOBILE APP · 2026',
    cats: ['mobile'],
    link: 'https://github.com/DhyeyPatel007/evenly',
    poster: '/assets/posters/evenly.png',
  },
  {
    id: 'vajra',
    name: 'Vajra',
    desc: 'GPU kernel optimization built for the Nebius × NVIDIA challenge.',
    catLabel: 'AI · GPU · 2026',
    cats: ['ai', 'web'],
    link: 'https://vajra.krynex.in',
    poster: '/assets/posters/vajra.png',
  },
  {
    id: 'datum',
    name: 'DATUM',
    desc: 'A friendly UI over sqlmap — for authorized testing and practice labs only.',
    catLabel: 'SECURITY · 2026',
    cats: ['security'],
    link: 'https://datum-a7iq.onrender.com',
    poster: '/assets/posters/datum.png',
  },
  {
    id: 'krynex',
    name: 'Krynex',
    desc: 'My audit agency — Figma-first, premium typography, no AI slop.',
    catLabel: 'WEB & SAAS · 2026',
    cats: ['web'],
    link: 'https://krynex.in',
    poster: '/assets/posters/krynex.png',
  },
];

export const HOME_FEATURED: ProjectItem[] = [
  {
    ...PROJECTS[0],
    desc: 'AI that reads 2D CAD drawings and auto-balloons dimensions into FAI/PPAP Excel for CNC shops.',
    catLabel: 'AI Tool · 2026 ↗',
  },
  {
    ...PROJECTS[1],
    desc: 'Free website-audit tool — 36 checks, full report, PDF and monitoring. Live and free for everyone.',
    catLabel: 'Web & SaaS · 2026 ↗',
  },
  {
    ...PROJECTS[2],
    desc: "Parkinson's symptom tracking scored against your own baseline, timed to the dose clock. In production.",
    catLabel: 'Mobile · Health · 2026 ↗',
  },
  {
    ...PROJECTS[4],
    desc: 'Dispute-defense swarm for PayPal sellers — evidence built automatically, human approval before anything sends.',
    catLabel: 'AI Tool · 2026 ↗',
  },
];

export interface ArchiveTile {
  project: ProjectItem;
  shape: 'ar-tall' | 'ar-std' | 'ar-sq' | 'ar-wide';
}

export const ARCHIVE_TILES: ArchiveTile[] = [
  { project: PROJECTS[0], shape: 'ar-tall' },
  { project: PROJECTS[1], shape: 'ar-std' },
  { project: PROJECTS[2], shape: 'ar-wide' },
  { project: PROJECTS[3], shape: 'ar-tall' },
  { project: PROJECTS[4], shape: 'ar-sq' },
  { project: PROJECTS[5], shape: 'ar-std' },
  { project: PROJECTS[6], shape: 'ar-wide' },
  { project: PROJECTS[7], shape: 'ar-tall' },
  { project: PROJECTS[8], shape: 'ar-sq' },
  { project: PROJECTS[9], shape: 'ar-std' },
  { project: PROJECTS[0], shape: 'ar-sq' },
  { project: PROJECTS[1], shape: 'ar-wide' },
  { project: PROJECTS[2], shape: 'ar-tall' },
  { project: PROJECTS[4], shape: 'ar-std' },
];

export interface ToolItem {
  name: string;
  short: string;
  color: string;
  rotate: number;
  left: string;
  top: string;
  speed: number;
}

export const TOOLS: ToolItem[] = [
  { name: 'React Native', short: 'Rn', color: '#0B7285', rotate: -13, left: '6%', top: '4%', speed: -60 },
  { name: 'TypeScript', short: 'TS', color: '#2563EB', rotate: 10, left: '27%', top: '0%', speed: -100 },
  { name: 'JavaScript', short: 'JS', color: '#B58A00', rotate: -5, left: '48%', top: '5%', speed: -70 },
  { name: 'React', short: 'Re', color: '#0891B2', rotate: 14, left: '69%', top: '1%', speed: -115 },
  { name: 'Next.js', short: 'Nx', color: '#111111', rotate: -16, left: '86%', top: '7%', speed: -80 },
  { name: 'Python', short: 'Py', color: '#1D4ED8', rotate: 8, left: '13%', top: '38%', speed: -95 },
  { name: 'Figma', short: 'Fg', color: '#7C2D12', rotate: -9, left: '34%', top: '35%', speed: -55 },
  { name: 'Supabase', short: 'Sb', color: '#16A34A', rotate: 15, left: '55%', top: '39%', speed: -110 },
  { name: 'Firebase', short: 'Fb', color: '#D97706', rotate: -12, left: '76%', top: '36%', speed: -65 },
  { name: 'Expo', short: 'Ex', color: '#1F2937', rotate: 11, left: '7%', top: '70%', speed: -85 },
  { name: 'Tailwind CSS', short: 'TW', color: '#0EA5E9', rotate: -7, left: '29%', top: '72%', speed: -120 },
  { name: 'GitHub', short: 'Gh', color: '#24292F', rotate: 13, left: '50%', top: '69%', speed: -75 },
  { name: 'Vercel', short: 'Vc', color: '#000000', rotate: -14, left: '71%', top: '73%', speed: -105 },
];

export interface VideoItem {
  title: string;
  desc: string;
  kind: string;
  offset: number;
}

export const VIDEOS: VideoItem[] = [
  {
    title: 'Ambika Mobile Promos',
    desc: "Gujarati promo videos for my father's mobile shop — script, motion graphics and subtitles, made with Google Flow & Hydrogen.",
    kind: 'Promo Series',
    offset: 0,
  },
  {
    title: 'Krynex Brand Film — GRAVITY',
    desc: 'A 35-second premium brand film for the Krynex audit agency. Typography-led, no AI slop.',
    kind: 'Brand Film',
    offset: 56,
  },
  {
    title: 'SpecBalloon Explainer',
    desc: 'Product explainer with rich voiceover and motion graphics, cut from 10-second clips into one film.',
    kind: 'Product Film',
    offset: 112,
  },
];

export const CATEGORY_TABS: { key: Category | 'all'; label: string }[] = [
  { key: 'ai', label: 'AI Tools' },
  { key: 'mobile', label: 'Mobile Apps' },
  { key: 'web', label: 'Web & SaaS' },
  { key: 'security', label: 'Security Tools' },
  { key: 'all', label: 'All Projects' },
];
