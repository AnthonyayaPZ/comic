import type { ComicPage, ComicRegion } from './types';
import { createId } from './utils';

const createRegion = (overrides: Partial<ComicRegion>): ComicRegion => ({
  id: createId(),
  x: 80,
  y: 120,
  width: 180,
  height: 120,
  status: 'empty',
  sourceText: '',
  translatedText: '',
  fontSize: 24,
  lineHeight: 1.35,
  letterSpacing: 0,
  color: '#111827',
  ...overrides,
});

const svgToDataUrl = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const pageOne = svgToDataUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" width="820" height="1160" viewBox="0 0 820 1160">
    <defs>
      <linearGradient id="bg" x1="0%" x2="0%" y1="0%" y2="100%">
        <stop offset="0%" stop-color="#fcfcfd"/>
        <stop offset="100%" stop-color="#eef1f5"/>
      </linearGradient>
    </defs>
    <rect width="820" height="1160" fill="url(#bg)"/>
    <rect x="48" y="48" width="724" height="1064" rx="32" fill="#ffffff" stroke="#0f172a" stroke-width="10"/>
    <rect x="92" y="92" width="636" height="300" rx="28" fill="#dbeafe" stroke="#1e293b" stroke-width="6"/>
    <circle cx="210" cy="255" r="80" fill="#111827"/>
    <circle cx="278" cy="255" r="80" fill="#111827"/>
    <circle cx="244" cy="214" r="92" fill="#111827"/>
    <rect x="112" y="460" width="260" height="300" rx="24" fill="#f8fafc" stroke="#1e293b" stroke-width="6"/>
    <rect x="448" y="460" width="260" height="300" rx="24" fill="#f8fafc" stroke="#1e293b" stroke-width="6"/>
    <rect x="112" y="820" width="596" height="220" rx="24" fill="#fef3c7" stroke="#1e293b" stroke-width="6"/>
    <ellipse cx="540" cy="220" rx="142" ry="96" fill="#ffffff" stroke="#111827" stroke-width="6"/>
    <ellipse cx="250" cy="900" rx="110" ry="72" fill="#ffffff" stroke="#111827" stroke-width="6"/>
    <text x="490" y="205" font-size="30" font-family="Arial" fill="#1f2937">今日は</text>
    <text x="505" y="245" font-size="30" font-family="Arial" fill="#1f2937">追いつくぞ!</text>
    <text x="190" y="900" font-size="26" font-family="Arial" fill="#1f2937">真的吗？</text>
  </svg>
`);

const pageTwo = svgToDataUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" width="820" height="1160" viewBox="0 0 820 1160">
    <rect width="820" height="1160" fill="#f7efe5"/>
    <rect x="44" y="44" width="732" height="1072" rx="36" fill="#fffdf9" stroke="#292524" stroke-width="10"/>
    <rect x="86" y="88" width="648" height="420" rx="30" fill="#fde68a" stroke="#292524" stroke-width="6"/>
    <rect x="86" y="560" width="310" height="470" rx="24" fill="#d9f99d" stroke="#292524" stroke-width="6"/>
    <rect x="424" y="560" width="310" height="470" rx="24" fill="#bfdbfe" stroke="#292524" stroke-width="6"/>
    <ellipse cx="250" cy="220" rx="130" ry="86" fill="#ffffff" stroke="#292524" stroke-width="6"/>
    <ellipse cx="574" cy="720" rx="118" ry="80" fill="#ffffff" stroke="#292524" stroke-width="6"/>
    <text x="178" y="210" font-size="28" font-family="Arial" fill="#292524">Wait, what?</text>
    <text x="518" y="715" font-size="24" font-family="Arial" fill="#292524">行こう。</text>
  </svg>
`);

export const initialPages: ComicPage[] = [
  {
    id: createId(),
    name: 'sample-page-01.png',
    src: pageOne,
    width: 820,
    height: 1160,
    regions: [
      createRegion({
        x: 404,
        y: 125,
        width: 278,
        height: 188,
        status: 'translated',
        sourceText: '今日は追いつくぞ!',
        translatedText: '今天一定追上你！',
        fontSize: 28,
      }),
      createRegion({
        x: 138,
        y: 826,
        width: 224,
        height: 134,
        status: 'recognized',
        sourceText: '真的吗？',
        translatedText: '',
      }),
    ],
  },
  {
    id: createId(),
    name: 'sample-page-02.png',
    src: pageTwo,
    width: 820,
    height: 1160,
    regions: [
      createRegion({
        x: 120,
        y: 134,
        width: 258,
        height: 168,
        status: 'reviewed',
        sourceText: 'Wait, what?',
        translatedText: '等一下，什么情况？',
        fontSize: 26,
      }),
      createRegion({
        x: 456,
        y: 642,
        width: 236,
        height: 152,
        status: 'embedded',
        sourceText: '行こう。',
        translatedText: '走吧。',
        fontSize: 28,
      }),
    ],
  },
];
