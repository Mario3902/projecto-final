const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'interactive-solar-system-guide (1)', 'src');
const outDir = path.join(__dirname, '..', 'public', 'solar-system');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const planets = fs.readFileSync(path.join(srcDir, 'data', 'planets.ts'), 'utf8');
const stars = fs.readFileSync(path.join(srcDir, 'components', 'Stars.tsx'), 'utf8');
const solarSystem = fs.readFileSync(path.join(srcDir, 'components', 'SolarSystem.tsx'), 'utf8');
const planetList = fs.readFileSync(path.join(srcDir, 'components', 'PlanetList.tsx'), 'utf8');
const planetDive = fs.readFileSync(path.join(srcDir, 'components', 'PlanetDive.tsx'), 'utf8');
const quiz = fs.readFileSync(path.join(srcDir, 'components', 'Quiz.tsx'), 'utf8');
const app = fs.readFileSync(path.join(srcDir, 'App.tsx'), 'utf8');
const css = fs.readFileSync(path.join(srcDir, 'index.css'), 'utf8');

function stripTs(code) {
    return code
        .replace(/^export interface[\s\S]*?^}/gm, '')
        .replace(/^interface[\s\S]*?^}/gm, '')
        .replace(/export (const|function|default)/g, (m, p1) => p1 === 'default' ? 'export default' : p1)
        .replace(/: Planet\[\]/g, '')
        .replace(/: Planet \| null/g, '')
        .replace(/: Planet/g, '')
        .replace(/<Planet>/g, '')
        .replace(/<Planet \| null>/g, '')
        .replace(/<Tab>/g, '')
        .replace(/: Tab/g, '')
        .replace(/: ShootingStar\[\]/g, '')
        .replace(/: ShootingStar/g, '')
        .replace(/: SolarSystemProps/g, '')
        .replace(/: PlanetListProps/g, '')
        .replace(/: PlanetDiveProps/g, '')
        .replace(/: Question/g, '')
        .replace(/: Question\[\]/g, '')
        .replace(/: ReactNode/g, '')
        .replace(/: React\.CSSProperties/g, '')
        .replace(/: React\.MouseEvent/g, '')
        .replace(/: number/g, '')
        .replace(/: string/g, '')
        .replace(/: boolean/g, '')
        .replace(/\?: string/g, '')
        .replace(/\?: number/g, '')
        .replace(/: \{ id: number; x: number; y: number; delay: number;\}/g, '')
        .replace(/<[A-Z][A-Za-z]*>/g, '')
        .replace(/import.*from.*;\n/g, '')
        .replace(/export \{ .* \};\n/g, '')
        .replace(/from \"\.\.\/data\/planets\"/g, '')
        .replace(/from \"\.\/data\/planets\"/g, '')
        .replace(/from \"..\/data\/planets\"/g, '')
        .replace(/from 'react'/g, '')
        .replace(/import.*'react'.*;\n/g, '')
        .replace(/import.*"react".*;\n/g, '')
        .replace(/as React\./g, 'as "React".')
        .replace(/React\./g, 'React.');
}

const cleanCss = css.replace(/@import "tailwindcss";/, '');

const combined = `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>🌌 Sistema Solar Interativo</title>
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body,#root{width:100%;height:100%;overflow:hidden;background:#020010;font-family:system-ui,sans-serif}
${cleanCss}
</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel" data-presets="react">
const {useState,useCallback,useMemo,useEffect,useRef} = React;

${stripTs(planets)}

${stripTs(stars).replace('export default function Stars', 'function Stars')}

${stripTs(solarSystem).replace('export default function SolarSystem', 'function SolarSystem')}

${stripTs(planetList).replace('export default function PlanetList', 'function PlanetList')}

${stripTs(planetDive).replace('export default function PlanetDive', 'function PlanetDive')}

${stripTs(quiz).replace('export default function Quiz', 'function Quiz')}

${stripTs(app).replace('export default function App', 'function App')}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
<\/script>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'index.html'), combined, 'utf8');
console.log('Solar system HTML written to public/solar-system/index.html');
console.log('Size:', (combined.length / 1024).toFixed(1) + ' KB');
