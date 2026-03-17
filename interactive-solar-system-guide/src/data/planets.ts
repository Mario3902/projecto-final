export interface PlanetLayer {
  name: string;
  color: string;
  radius: number; // percentage of total
  description: string;
}

export interface SurfaceFeature {
  name: string;
  description: string;
  emoji: string;
}

export interface Planet {
  id: string;
  name: string;
  namePt: string;
  order: number;
  color: string;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  ringColor?: string;
  description: string;
  facts: {
    diameter: string;
    distanceSun: string;
    orbitalPeriod: string;
    rotationPeriod: string;
    moons: string;
    temperature: string;
    gravity: string;
    atmosphere: string;
  };
  funFact: string;
  gradient: string[];
  texture: string; // CSS for realistic texture
  atmosphereColor: string;
  surfaceFeatures: SurfaceFeature[];
  layers: PlanetLayer[];
  exploration: string;
  compareSizeToEarth: number; // ratio
  hasAtmosphere: boolean;
  type: string;
  yearDiscovered?: string;
}

export const SUN_DATA = {
  name: "Sol",
  description:
    "O Sol é a estrela central do nosso sistema solar. É uma esfera quase perfeita de plasma quente, com movimento convectivo interno que gera um campo magnético. É de longe a fonte de energia mais importante para a vida na Terra. A cada segundo, o Sol converte cerca de 600 milhões de toneladas de hidrogênio em hélio através da fusão nuclear.",
  facts: {
    diameter: "1.392.700 km",
    temperature: "5.500°C (superfície) / 15 milhões°C (núcleo)",
    age: "4,6 bilhões de anos",
    type: "Estrela anã amarela (G2V)",
    mass: "1,989 × 10³⁰ kg",
    composition: "73% Hidrogênio, 25% Hélio",
  },
  funFact:
    "O Sol contém 99,86% de toda a massa do sistema solar! A luz do Sol leva cerca de 8 minutos e 20 segundos para chegar à Terra.",
  layers: [
    { name: "Núcleo", color: "#ffffff", radius: 25, description: "15 milhões °C - Fusão nuclear de H em He" },
    { name: "Zona Radiativa", color: "#fff44f", radius: 45, description: "Energia transportada por radiação" },
    { name: "Zona Convectiva", color: "#ffaa00", radius: 70, description: "Energia transportada por convecção" },
    { name: "Fotosfera", color: "#ff8800", radius: 85, description: "Superfície visível - 5.500°C" },
    { name: "Cromosfera", color: "#ff4400", radius: 95, description: "Atmosfera inferior avermelhada" },
    { name: "Coroa", color: "#ff220040", radius: 100, description: "Atmosfera externa - milhões de °C" },
  ],
};

export const planets: Planet[] = [
  {
    id: "mercury",
    name: "Mercury",
    namePt: "Mercúrio",
    order: 1,
    color: "#b5b5b5",
    size: 8,
    orbitRadius: 70,
    orbitSpeed: 18,
    type: "Rochoso",
    hasAtmosphere: false,
    compareSizeToEarth: 0.383,
    atmosphereColor: "transparent",
    description:
      "Mercúrio é o menor planeta do sistema solar e o mais próximo do Sol. Sua superfície é coberta por crateras, semelhante à Lua. Apesar de ser o mais próximo do Sol, não é o mais quente — esse título pertence a Vênus. Mercúrio não possui atmosfera significativa para reter calor.",
    facts: {
      diameter: "4.879 km",
      distanceSun: "57,9 milhões km",
      orbitalPeriod: "88 dias",
      rotationPeriod: "59 dias",
      moons: "0",
      temperature: "-180°C a 430°C",
      gravity: "3,7 m/s²",
      atmosphere: "Praticamente inexistente",
    },
    funFact: "Um dia em Mercúrio (de nascer do sol a nascer do sol) dura 176 dias terrestres!",
    gradient: ["#5c5c5c", "#9e9e9e", "#d4d4d4"],
    texture: "radial-gradient(circle at 30% 25%, #d4d4d4 0%, #9e9e9e 40%, #6b6b6b 70%, #4a4a4a 100%), radial-gradient(circle at 65% 60%, rgba(80,80,80,0.8) 0%, transparent 25%), radial-gradient(circle at 20% 70%, rgba(60,60,60,0.6) 0%, transparent 20%), radial-gradient(circle at 75% 30%, rgba(90,90,90,0.7) 0%, transparent 15%), radial-gradient(circle at 45% 45%, rgba(70,70,70,0.5) 0%, transparent 30%)",
    surfaceFeatures: [
      { name: "Cratera Caloris", description: "Uma das maiores crateras de impacto do sistema solar, com 1.550 km de diâmetro", emoji: "💥" },
      { name: "Planícies Suaves", description: "Vastas planícies formadas por antigos fluxos de lava", emoji: "🏜️" },
      { name: "Escarpas", description: "Falésias enormes de até 3 km de altura, formadas quando o planeta encolheu", emoji: "⛰️" },
      { name: "Gelo nos Polos", description: "Depósitos de gelo de água nas sombras permanentes das crateras polares", emoji: "🧊" },
    ],
    layers: [
      { name: "Núcleo de Ferro", color: "#c0c0c0", radius: 60, description: "Enorme núcleo metálico — 85% do raio do planeta" },
      { name: "Manto", color: "#8b7355", radius: 85, description: "Camada fina de silicatos" },
      { name: "Crosta", color: "#9e9e9e", radius: 100, description: "Crosta fina e cratera, rica em silicatos" },
    ],
    exploration: "A sonda MESSENGER da NASA orbitou Mercúrio de 2011 a 2015, mapeando toda a superfície. A missão BepiColombo (ESA/JAXA) está atualmente a caminho, com chegada prevista para 2025.",
  },
  {
    id: "venus",
    name: "Venus",
    namePt: "Vênus",
    order: 2,
    color: "#e8cda0",
    size: 14,
    orbitRadius: 110,
    orbitSpeed: 14,
    type: "Rochoso",
    hasAtmosphere: true,
    compareSizeToEarth: 0.949,
    atmosphereColor: "#e8cda060",
    description:
      "Vênus é frequentemente chamado de 'planeta irmão' da Terra devido ao seu tamanho similar. Possui a atmosfera mais densa entre os planetas rochosos, com nuvens de ácido sulfúrico que criam um efeito estufa extremo, tornando-o o planeta mais quente do sistema solar.",
    facts: {
      diameter: "12.104 km",
      distanceSun: "108,2 milhões km",
      orbitalPeriod: "225 dias",
      rotationPeriod: "243 dias (retrógrado)",
      moons: "0",
      temperature: "462°C (média)",
      gravity: "8,87 m/s²",
      atmosphere: "96,5% CO₂, 3,5% Nitrogênio",
    },
    funFact: "Vênus gira ao contrário! O Sol nasce no oeste e se põe no leste. Um dia em Vênus é mais longo que um ano em Vênus!",
    gradient: ["#8b6914", "#c4a35a", "#f0deb8"],
    texture: "radial-gradient(circle at 35% 30%, #f5e6c8 0%, #e8cda0 30%, #c4a35a 60%, #8b6914 100%), radial-gradient(ellipse at 50% 40%, rgba(245,230,200,0.4) 0%, transparent 50%), radial-gradient(ellipse at 30% 60%, rgba(200,170,80,0.3) 0%, transparent 40%)",
    surfaceFeatures: [
      { name: "Ishtar Terra", description: "Continente elevado do tamanho da Austrália com montanhas de até 11 km", emoji: "🏔️" },
      { name: "Maxwell Montes", description: "A montanha mais alta de Vênus com 11 km de altitude", emoji: "⛰️" },
      { name: "Vulcões de Escudo", description: "Milhares de vulcões, alguns possivelmente ainda ativos", emoji: "🌋" },
      { name: "Aracnoides", description: "Estruturas circulares únicas causadas por atividade vulcânica", emoji: "🕸️" },
    ],
    layers: [
      { name: "Núcleo de Ferro", color: "#d4a574", radius: 30, description: "Provavelmente sólido, sem campo magnético significativo" },
      { name: "Manto de Silicato", color: "#c48c3c", radius: 75, description: "Manto rochoso espesso e quente" },
      { name: "Crosta", color: "#e8cda0", radius: 90, description: "Crosta basáltica com atividade vulcânica" },
      { name: "Atmosfera Densa", color: "#f0deb880", radius: 100, description: "96% CO₂ — pressão 90x maior que a Terra" },
    ],
    exploration: "A União Soviética pousou várias sondas Venera na superfície entre 1970-1985. A sonda Magellan da NASA mapeou 98% da superfície por radar. A missão VERITAS e DAVINCI da NASA estão planejadas para os anos 2030.",
  },
  {
    id: "earth",
    name: "Earth",
    namePt: "Terra",
    order: 3,
    color: "#4da6ff",
    size: 15,
    orbitRadius: 155,
    orbitSpeed: 12,
    type: "Rochoso",
    hasAtmosphere: true,
    compareSizeToEarth: 1.0,
    atmosphereColor: "#4da6ff40",
    description:
      "A Terra é o terceiro planeta a partir do Sol e o único corpo celeste conhecido por abrigar vida. Cerca de 71% da superfície é coberta por oceanos de água líquida. Nossa atmosfera rica em oxigênio e o campo magnético protetor tornam a vida possível.",
    facts: {
      diameter: "12.742 km",
      distanceSun: "149,6 milhões km",
      orbitalPeriod: "365,25 dias",
      rotationPeriod: "24 horas",
      moons: "1 (Lua)",
      temperature: "15°C (média)",
      gravity: "9,8 m/s²",
      atmosphere: "78% Nitrogênio, 21% Oxigênio",
    },
    funFact: "A Terra é o único planeta que não foi nomeado em homenagem a um deus grego ou romano!",
    gradient: ["#1a3d6e", "#2d7dd2", "#76d7c4"],
    texture: "radial-gradient(circle at 35% 30%, #76d7c4 0%, #4da6ff 25%, #2d7dd2 50%, #1a3d6e 80%), radial-gradient(ellipse at 55% 45%, rgba(118,215,196,0.6) 0%, transparent 30%), radial-gradient(ellipse at 25% 55%, rgba(45,125,210,0.5) 0%, transparent 35%), radial-gradient(circle at 70% 35%, rgba(34,139,34,0.4) 0%, transparent 20%), radial-gradient(circle at 40% 70%, rgba(34,100,34,0.3) 0%, transparent 15%)",
    surfaceFeatures: [
      { name: "Oceano Pacífico", description: "O maior oceano, cobrindo mais de 30% da superfície terrestre", emoji: "🌊" },
      { name: "Monte Everest", description: "O ponto mais alto da Terra com 8.849 metros de altitude", emoji: "🏔️" },
      { name: "Fossa das Marianas", description: "O ponto mais profundo dos oceanos, com 10.994 metros", emoji: "🌀" },
      { name: "Floresta Amazônica", description: "A maior floresta tropical do mundo, produzindo 20% do oxigênio", emoji: "🌳" },
    ],
    layers: [
      { name: "Núcleo Interno", color: "#ff6b35", radius: 20, description: "Esfera sólida de ferro a 5.400°C" },
      { name: "Núcleo Externo", color: "#ff8c42", radius: 35, description: "Ferro líquido que gera o campo magnético" },
      { name: "Manto Inferior", color: "#cc6633", radius: 60, description: "Rocha sólida em convecção lenta" },
      { name: "Manto Superior", color: "#d4855c", radius: 80, description: "Parcialmente fundido, move as placas tectônicas" },
      { name: "Crosta", color: "#4da6ff", radius: 95, description: "5-70 km de espessura, oceânica e continental" },
      { name: "Atmosfera", color: "#87ceeb60", radius: 100, description: "Camada protetora de gases essenciais à vida" },
    ],
    exploration: "Temos milhares de satélites orbitando a Terra. A Estação Espacial Internacional (ISS) orbita a 400 km de altitude desde 2000, com astronautas vivendo e trabalhando no espaço continuamente.",
  },
  {
    id: "mars",
    name: "Mars",
    namePt: "Marte",
    order: 4,
    color: "#e07040",
    size: 12,
    orbitRadius: 200,
    orbitSpeed: 10,
    type: "Rochoso",
    hasAtmosphere: true,
    compareSizeToEarth: 0.532,
    atmosphereColor: "#e0704020",
    description:
      "Marte é conhecido como o 'Planeta Vermelho' devido ao óxido de ferro em sua superfície. Possui a montanha mais alta do sistema solar (Olympus Mons) e um grande sistema de cânions (Valles Marineris). É o principal candidato para colonização humana.",
    facts: {
      diameter: "6.779 km",
      distanceSun: "227,9 milhões km",
      orbitalPeriod: "687 dias",
      rotationPeriod: "24h 37min",
      moons: "2 (Fobos e Deimos)",
      temperature: "-65°C (média)",
      gravity: "3,72 m/s²",
      atmosphere: "95% CO₂, 2,7% Nitrogênio",
    },
    funFact: "O Monte Olimpo em Marte tem 21,9 km de altura — quase 2,5 vezes a altura do Monte Everest!",
    gradient: ["#6b2a0a", "#c85a28", "#f4a460"],
    texture: "radial-gradient(circle at 35% 30%, #f4a460 0%, #e07040 30%, #c85a28 55%, #6b2a0a 100%), radial-gradient(circle at 55% 50%, rgba(139,69,19,0.5) 0%, transparent 30%), radial-gradient(circle at 30% 65%, rgba(210,105,30,0.4) 0%, transparent 25%), radial-gradient(circle at 70% 25%, rgba(244,164,96,0.3) 0%, transparent 20%), radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.1) 0%, transparent 25%)",
    surfaceFeatures: [
      { name: "Olympus Mons", description: "O maior vulcão do sistema solar com 21,9 km de altura e 600 km de diâmetro", emoji: "🌋" },
      { name: "Valles Marineris", description: "Sistema de cânions com 4.000 km de comprimento e até 7 km de profundidade", emoji: "🏜️" },
      { name: "Calotas Polares", description: "Gelo de CO₂ e água nos polos norte e sul", emoji: "🧊" },
      { name: "Leitos de Rios Secos", description: "Evidências de que água líquida fluiu na superfície bilhões de anos atrás", emoji: "💧" },
    ],
    layers: [
      { name: "Núcleo", color: "#c0392b", radius: 35, description: "Núcleo de ferro parcialmente líquido" },
      { name: "Manto", color: "#a0522d", radius: 75, description: "Manto de silicato, menos ativo que o da Terra" },
      { name: "Crosta", color: "#e07040", radius: 95, description: "Crosta espessa rica em basalto e óxido de ferro" },
      { name: "Atmosfera Fina", color: "#e0704030", radius: 100, description: "Pressão 1% da Terra — muito fina" },
    ],
    exploration: "Rovers como Curiosity e Perseverance exploram a superfície. O helicóptero Ingenuity realizou o primeiro voo motorizado em outro planeta. A NASA e SpaceX planejam missões tripuladas para a década de 2030-2040.",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    namePt: "Júpiter",
    order: 5,
    color: "#c88b3a",
    size: 35,
    orbitRadius: 270,
    orbitSpeed: 7,
    type: "Gigante Gasoso",
    hasAtmosphere: true,
    compareSizeToEarth: 11.21,
    atmosphereColor: "#c88b3a30",
    description:
      "Júpiter é o maior planeta do sistema solar, um gigante gasoso com massa duas vezes maior que todos os outros planetas combinados. Sua Grande Mancha Vermelha é uma tempestade que dura há séculos. Possui um poderoso campo magnético e dezenas de luas.",
    facts: {
      diameter: "139.820 km",
      distanceSun: "778,5 milhões km",
      orbitalPeriod: "11,86 anos",
      rotationPeriod: "9h 55min",
      moons: "95 conhecidas",
      temperature: "-110°C (topo das nuvens)",
      gravity: "24,79 m/s²",
      atmosphere: "90% Hidrogênio, 10% Hélio",
    },
    funFact: "A Grande Mancha Vermelha de Júpiter é uma tempestade tão grande que caberia a Terra inteira dentro dela!",
    gradient: ["#5c3d10", "#c88b3a", "#e8c87a"],
    texture: "radial-gradient(circle at 35% 30%, #e8c87a 0%, #c88b3a 35%, #a06820 65%, #5c3d10 100%), repeating-linear-gradient(0deg, rgba(200,139,58,0.15) 0px, rgba(200,139,58,0.15) 3px, transparent 3px, transparent 8px), radial-gradient(ellipse at 60% 55%, rgba(180,80,30,0.6) 0%, rgba(180,80,30,0) 15%), radial-gradient(ellipse at 35% 45%, rgba(232,200,122,0.3) 0%, transparent 30%)",
    surfaceFeatures: [
      { name: "Grande Mancha Vermelha", description: "Tempestade anticiclônica maior que a Terra, ativa há mais de 350 anos", emoji: "🌀" },
      { name: "Faixas de Nuvens", description: "Bandas alternadas de ventos de até 620 km/h em direções opostas", emoji: "🌪️" },
      { name: "Lua Europa", description: "Oceano subterrâneo com potencial para vida, coberto por gelo", emoji: "🌙" },
      { name: "Lua Io", description: "O corpo mais vulcanicamente ativo do sistema solar", emoji: "🌋" },
    ],
    layers: [
      { name: "Núcleo Rochoso", color: "#8b7355", radius: 15, description: "Núcleo de rocha e metal, 20x a massa da Terra" },
      { name: "Hidrogênio Metálico", color: "#a08050", radius: 50, description: "Hidrogênio comprimido em estado metálico líquido" },
      { name: "Hidrogênio Líquido", color: "#c8a860", radius: 75, description: "Camada de hidrogênio e hélio líquidos" },
      { name: "Atmosfera Gasosa", color: "#e8c87a80", radius: 100, description: "Nuvens de amônia, hidrossulfeto de amônio e água" },
    ],
    exploration: "A sonda Juno orbita Júpiter desde 2016, estudando sua composição e campo magnético. A missão Europa Clipper da NASA (lançada em 2024) estudará a lua Europa em busca de condições para vida.",
  },
  {
    id: "saturn",
    name: "Saturn",
    namePt: "Saturno",
    order: 6,
    color: "#e8d580",
    size: 30,
    orbitRadius: 350,
    orbitSpeed: 5.5,
    ringColor: "#d4c475",
    type: "Gigante Gasoso",
    hasAtmosphere: true,
    compareSizeToEarth: 9.45,
    atmosphereColor: "#e8d58030",
    description:
      "Saturno é famoso por seu espetacular sistema de anéis, compostos principalmente de partículas de gelo e rocha. É o segundo maior planeta do sistema solar e possui a menor densidade de todos os planetas — flutuaria na água!",
    facts: {
      diameter: "116.460 km",
      distanceSun: "1,434 bilhão km",
      orbitalPeriod: "29,46 anos",
      rotationPeriod: "10h 42min",
      moons: "146 conhecidas",
      temperature: "-140°C (topo das nuvens)",
      gravity: "10,44 m/s²",
      atmosphere: "96% Hidrogênio, 3% Hélio",
    },
    funFact: "Saturno é tão leve que flutuaria na água (se existisse uma banheira grande o suficiente)! Sua densidade é menor que a da água.",
    gradient: ["#8b7930", "#c8b060", "#f0e8a0"],
    texture: "radial-gradient(circle at 35% 30%, #f0e8a0 0%, #e8d580 30%, #c8b060 55%, #8b7930 100%), repeating-linear-gradient(0deg, rgba(232,213,128,0.1) 0px, rgba(232,213,128,0.1) 2px, transparent 2px, transparent 6px), radial-gradient(ellipse at 45% 50%, rgba(200,176,96,0.3) 0%, transparent 40%)",
    surfaceFeatures: [
      { name: "Sistema de Anéis", description: "7 anéis principais compostos de bilhões de partículas de gelo e rocha", emoji: "💍" },
      { name: "Hexágono do Polo Norte", description: "Padrão hexagonal misterioso de nuvens no polo norte", emoji: "⬡" },
      { name: "Lua Titã", description: "Única lua com atmosfera densa e lagos de metano líquido", emoji: "🌙" },
      { name: "Lua Encélado", description: "Gêiseres de água expelidos da crosta gelada — possível oceano subsuperficial", emoji: "💦" },
    ],
    layers: [
      { name: "Núcleo Rochoso", color: "#a08850", radius: 15, description: "Núcleo de rocha e gelo metálico" },
      { name: "Hidrogênio Metálico", color: "#b8a060", radius: 45, description: "Hidrogênio em estado metálico líquido" },
      { name: "Hidrogênio Líquido", color: "#d0c070", radius: 75, description: "Hidrogênio e hélio líquidos" },
      { name: "Atmosfera", color: "#e8d58080", radius: 100, description: "Nuvens de amônia com ventos de até 1.800 km/h" },
    ],
    exploration: "A missão Cassini-Huygens (1997-2017) foi uma das mais bem-sucedidas da história. A sonda Huygens pousou em Titã em 2005 — o pouso mais distante já realizado. A missão Dragonfly da NASA enviará um drone para Titã em 2028.",
  },
  {
    id: "uranus",
    name: "Uranus",
    namePt: "Urano",
    order: 7,
    color: "#72c8d0",
    size: 22,
    orbitRadius: 420,
    orbitSpeed: 4,
    ringColor: "#5ab0b8",
    type: "Gigante de Gelo",
    hasAtmosphere: true,
    compareSizeToEarth: 4.01,
    atmosphereColor: "#72c8d030",
    description:
      "Urano é um gigante de gelo com uma inclinação axial única de 98°, fazendo-o girar praticamente de lado. Sua cor azul-esverdeada vem do metano em sua atmosfera que absorve a luz vermelha do Sol.",
    facts: {
      diameter: "50.724 km",
      distanceSun: "2,871 bilhões km",
      orbitalPeriod: "84 anos",
      rotationPeriod: "17h 14min (retrógrado)",
      moons: "27 conhecidas",
      temperature: "-224°C",
      gravity: "8,69 m/s²",
      atmosphere: "83% Hidrogênio, 15% Hélio, 2% Metano",
    },
    funFact: "Urano gira de lado! Acredita-se que uma colisão com um objeto do tamanho da Terra causou essa inclinação extrema.",
    gradient: ["#3a8a90", "#5ab8c0", "#a0e8f0"],
    texture: "radial-gradient(circle at 35% 30%, #b8ecf0 0%, #72c8d0 35%, #5ab0b8 60%, #3a8a90 100%), radial-gradient(ellipse at 50% 50%, rgba(160,232,240,0.2) 0%, transparent 50%)",
    surfaceFeatures: [
      { name: "Inclinação Axial", description: "Gira a 98° — estações extremas de 21 anos cada", emoji: "🔄" },
      { name: "Anéis Escuros", description: "13 anéis finos e escuros, descobertos em 1977", emoji: "💍" },
      { name: "Lua Miranda", description: "Superfície caótica com penhascos de até 20 km — a mais estranha lua do sistema", emoji: "🌙" },
      { name: "Campo Magnético Inclinado", description: "Eixo magnético inclinado 59° em relação ao eixo de rotação", emoji: "🧲" },
    ],
    layers: [
      { name: "Núcleo Rochoso", color: "#4a8a90", radius: 20, description: "Núcleo de rocha e gelo sob pressão extrema" },
      { name: "Manto de Gelo", color: "#5ab0b8", radius: 65, description: "Água, metano e amônia em estado 'quente e denso'" },
      { name: "Atmosfera de H/He", color: "#72c8d0", radius: 85, description: "Hidrogênio, hélio e metano gasosos" },
      { name: "Neblina Superior", color: "#a0e8f080", radius: 100, description: "Camada de neblina de metano dando a cor azul" },
    ],
    exploration: "Apenas a Voyager 2 visitou Urano, em janeiro de 1986, passando a 81.500 km do topo das nuvens. A NASA está considerando uma missão orbital dedicada (Uranus Orbiter) para a década de 2030.",
    yearDiscovered: "1781 por William Herschel",
  },
  {
    id: "neptune",
    name: "Neptune",
    namePt: "Netuno",
    order: 8,
    color: "#3366cc",
    size: 21,
    orbitRadius: 485,
    orbitSpeed: 3,
    type: "Gigante de Gelo",
    hasAtmosphere: true,
    compareSizeToEarth: 3.88,
    atmosphereColor: "#3366cc30",
    description:
      "Netuno é o planeta mais distante do Sol e possui os ventos mais fortes do sistema solar, chegando a 2.100 km/h. Foi o primeiro planeta encontrado por previsão matemática, antes de ser observado por telescópio.",
    facts: {
      diameter: "49.528 km",
      distanceSun: "4,495 bilhões km",
      orbitalPeriod: "164,8 anos",
      rotationPeriod: "16h 6min",
      moons: "16 conhecidas",
      temperature: "-214°C",
      gravity: "11,15 m/s²",
      atmosphere: "80% Hidrogênio, 19% Hélio, 1% Metano",
    },
    funFact: "Desde sua descoberta em 1846, Netuno completou apenas uma órbita completa ao redor do Sol — em 2011!",
    gradient: ["#1a2d6b", "#2850a8", "#5588ee"],
    texture: "radial-gradient(circle at 35% 30%, #6699ee 0%, #3366cc 30%, #2850a8 55%, #1a2d6b 100%), radial-gradient(ellipse at 55% 45%, rgba(85,136,238,0.4) 0%, transparent 35%), radial-gradient(ellipse at 35% 55%, rgba(40,80,168,0.3) 0%, transparent 30%), radial-gradient(circle at 60% 50%, rgba(100,150,255,0.2) 0%, transparent 20%)",
    surfaceFeatures: [
      { name: "Grande Mancha Escura", description: "Tempestade anticiclônica similar à de Júpiter, mas que aparece e desaparece", emoji: "🌀" },
      { name: "Ventos Supersônicos", description: "Os ventos mais rápidos do sistema solar, até 2.100 km/h", emoji: "🌪️" },
      { name: "Lua Tritão", description: "A maior lua, com gêiseres de nitrogênio e órbita retrógrada — provavelmente capturada", emoji: "🌙" },
      { name: "Anéis Fracos", description: "5 anéis finos e escuros, com arcos desiguais de material", emoji: "💍" },
    ],
    layers: [
      { name: "Núcleo Rochoso", color: "#1a2d6b", radius: 20, description: "Núcleo de rocha e gelo, ~1.2x massa da Terra" },
      { name: "Manto de Gelo", color: "#2850a8", radius: 60, description: "Água, metano e amônia super-comprimidos" },
      { name: "Atmosfera de H/He", color: "#3366cc", radius: 85, description: "Hidrogênio, hélio e metano" },
      { name: "Nuvens Superiores", color: "#5588ee80", radius: 100, description: "Cristais de metano formando nuvens cirrus" },
    ],
    exploration: "Apenas a Voyager 2 visitou Netuno, em agosto de 1989, descobrindo 6 luas e os anéis do planeta. Não há missões planejadas atualmente, mas cientistas propõem uma sonda orbital Neptune Odyssey.",
    yearDiscovered: "1846 por Johann Galle, previsto por Urbain Le Verrier",
  },
];
