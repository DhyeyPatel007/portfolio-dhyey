// The Concrete Drafting Lab — station data.
// Positions are in room metres: x right, z toward the entrance (+z), y up.
// Room is 5 x 5 m, floor y = 0, back wall z = -2.5 (the D wall).
export type StationId = 'drawanything' | 'aurapph' | 'specballoon' | 'vajra' | 'phalanx';

export interface Station {
  id: StationId;
  num: string;
  name: string;
  line: string;
  badges: string[];
  live: string;
  github: string;
  /** where the prop group sits on the bench */
  pos: [number, number, number];
  /** desk lamp position (behind the prop, off the camera sightline) */
  lamp: [number, number, number];
  /** camera viewpoint for the dock glide */
  viewPos: [number, number, number];
  /** what the camera looks at from viewPos */
  viewTarget: [number, number, number];
}

export const STATIONS: Station[] = [
  {
    id: 'drawanything',
    num: '01',
    name: 'DrawAnything',
    line: 'Draw a control desk on plain paper — the ink works live.',
    badges: ['MediaPipe', 'Gemma 3 27B', 'React', 'GenHacks 2026'],
    live: 'https://drawanything-xi.vercel.app',
    github: 'https://github.com/DhyeyPatel007/drawanything',
    pos: [-2.05, 0.92, 0.9],
    lamp: [-2.2, 0.92, 1.28],
    viewPos: [-1.15, 1.4, 0.9],
    viewTarget: [-2.05, 0.95, 0.9],
  },
  {
    id: 'aurapph',
    num: '02',
    name: 'AuraPPH',
    line: 'Offline phone-camera blood-loss meter for postpartum haemorrhage.',
    badges: ['Kotlin', 'Camera2 RAW', 'OpenCV', 'TRIVENI'],
    live: 'https://aurapph.vercel.app',
    github: 'https://github.com/DhyeyPatel007/aurapph',
    pos: [-2.05, 0.92, -1.3],
    lamp: [-2.2, 0.92, -1.68],
    viewPos: [-1.15, 1.4, -1.3],
    viewTarget: [-2.05, 0.95, -1.3],
  },
  {
    id: 'specballoon',
    num: '03',
    name: 'SpecBalloon',
    line: 'AI reads 2D CAD drawings and auto-balloons dimensions into FAI/PPAP Excel.',
    badges: ['Gemini 4 Hydrogen', 'FastAPI', '331-drawing benchmark'],
    live: 'https://spec-balloon.vercel.app',
    github: 'https://github.com/DhyeyPatel007/SpecBalloon',
    pos: [-1.3, 0.92, -2.05],
    lamp: [-1.68, 0.92, -2.25],
    viewPos: [-1.3, 1.35, -1.0],
    viewTarget: [-1.3, 0.95, -2.05],
  },
  {
    id: 'vajra',
    num: '04',
    name: 'Vajra',
    line: 'GPU kernel optimisation — Softmax 5.09x, Conv1D 1.39x, Sobel 1.32x.',
    badges: ['CUDA', 'Nebius x NVIDIA', 'WGSL'],
    live: 'https://vajra.krynex.in',
    github: 'https://github.com/DhyeyPatel007/vajra',
    pos: [1.3, 0.92, -2.05],
    lamp: [1.68, 0.92, -2.25],
    viewPos: [1.3, 1.35, -1.0],
    viewTarget: [1.3, 0.95, -2.05],
  },
  {
    id: 'phalanx',
    num: '05',
    name: 'PHALANX',
    line: 'Dispute-defence swarm for PayPal sellers — human approval before anything sends.',
    badges: ['PayPal APIs', 'AI agents', 'Sandbox-verified'],
    live: 'https://phalanx.krynex.in',
    github: 'https://github.com/DhyeyPatel007/phalanx',
    pos: [2.05, 0.92, -1.3],
    lamp: [2.2, 0.92, -1.68],
    viewPos: [1.15, 1.4, -1.3],
    viewTarget: [2.05, 0.95, -1.3],
  },
];

export const CENTRE_VIEW = {
  pos: [0, 1.55, 1.9] as [number, number, number],
  target: [0, 1.7, -2.3] as [number, number, number],
};

export const PALETTE = {
  nearBlack: '#14181A',
  concrete: '#1C1F22',
  slate: '#121518',
  plywood: '#D8C9A8',
  steel: '#3A3F44',
  cobalt: '#2563EB',
  mint: '#10E59A',
  amber: '#FFB347',
  cream: '#FAF6EC',
};
