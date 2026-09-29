// Conteúdo do perfil — edite aqui e rode `node scripts/build.mjs`.

export const USER = 'mhaurinho'

export const LINKS = {
  site: 'https://mhaurinho.github.io/',
  linkedin: 'https://www.linkedin.com/in/mauro-andrade-5a782147/',
  cv: 'https://mhaurinho.github.io/cv.pdf',
  cvEn: 'https://mhaurinho.github.io/cv-en.pdf',
  email: 'mailto:maurolpx@hotmail.com',
  projects: 'https://github.com/mhaurinho?tab=projects',
}

export const ROLES = [
  'BUSINESS ANALYST',
  'ANALISTA DE DADOS',
  'POWER BI · SQL · PYTHON',
  'IA APLICADA & AGENTES',
  'GOOGLE GEMINI AMBASSADOR',
]

export const PERFIL = {
  resumo:
    'Business Analyst e Analista de Dados com experiência em operações comerciais, supply chain, inteligência de negócios e automação de processos no agronegócio, na indústria e no comércio. Conecto negócio, tecnologia e liderança para transformar dados dispersos em indicadores, diagnósticos e ações práticas.',
  itens: [
    ['LOCALIZAÇÃO', 'Região Metropolitana de Goiânia, GO'],
    ['FOCO', 'BI · Automação · IA Aplicada · Operações'],
    ['COMUNIDADE', 'Google Gemini Ambassador · SCTI Goiás'],
    ['IDIOMAS', 'Português nativo · Inglês profissional'],
  ],
  stats: [
    ['9+', 'anos em operações,', 'supply chain e dados'],
    ['20+', 'anos de trajetória', 'profissional'],
    ['5', 'formações — graduação,', '2 pós, MBA e ADS'],
    ['2026', 'Estudante Embaixador', 'Google Gemini'],
  ],
}

export const EXPERIENCIAS = [
  {
    cargo: 'Estudante Embaixador Google Gemini',
    empresa: 'Google',
    periodo: 'ago/2026 — atual',
    local: 'Programa Estudantes Embaixadores 2026',
    atual: true,
    pontos: [
      'Comunidade nacional de capacitação prática em Google Gemini, IA generativa e liderança estudantil.',
      'Criação e teste de prompts estruturados e avaliação de respostas em conversas multi-turno.',
    ],
    tags: ['Gemini', 'Prompt Engineering', 'IA Generativa', 'Avaliação de LLM'],
  },
  {
    cargo: 'Analista de Dados',
    empresa: 'Rede JS Peças',
    periodo: 'dez/2025 — atual',
    local: 'Goiânia, GO',
    atual: true,
    pontos: [
      'Integração de dados de múltiplas fontes com foco em consistência, rastreabilidade e qualidade.',
      'Dashboards de compras, vendas, carteira, risco de estoque e performance comercial.',
      'Análises exploratórias, data mining e uso de IA e automação para acelerar rotinas.',
    ],
    tags: ['Power BI', 'SQL / Dremio', 'Python', 'Agentes de IA'],
  },
  {
    cargo: 'Business Analyst',
    empresa: 'Corteva Agriscience',
    periodo: 'fev/2021 — jul/2025',
    local: 'Goiânia, GO',
    pontos: [
      'Gestão ponta a ponta de D2C e OTD: backlog, lead time, OTIF, nível de serviço e aging de pedidos.',
      'Planejamento de cotas e demanda para Row Crops/Seeds (Pioneer), apoiando o Demand Forecast.',
      'Ponto focal regional em Control Tower, integrando comercial, logística, operações e liderança.',
    ],
    tags: ['SAP S/4HANA', 'Salesforce', 'S&OP', 'Control Tower'],
  },
  {
    cargo: 'Assistente Adm. de Comércio Exterior',
    empresa: 'Laboratório Teuto',
    periodo: 'jun/2017 — jul/2021',
    local: 'Anápolis, GO',
    pontos: [
      'Atendimento a clientes internacionais, prospecção de mercados e gestão de pedidos de exportação.',
      'Follow-up logístico de embarques marítimos e aéreos, documentação de exportação e compliance.',
    ],
    tags: ['Comércio Exterior', 'Logística', 'Incoterms'],
  },
]

export const ANTERIORES = [
  ['Embrase Segurança & Serviços', 'Controle de Acesso · 2014 — 2017'],
  ['Supermarket Cuca', 'Atendimento ao Cliente · 2013 — 2014'],
  ['Exército Brasileiro', 'Soldado, Estado-Maior · 2008 — 2012'],
  ['Bequisa Indústria Química', 'Aprendiz, Contabilidade · 2004 — 2007'],
]

export const STACK = [
  ['BI', 'BI & Analytics', ['Power BI', 'DAX', 'Power Query', 'Excel', 'KPI design']],
  ['DB', 'Dados & Integração', ['SQL', 'Dremio', 'Python', 'Pandas', 'ETL/ELT']],
  ['AI', 'IA & LLMs', ['Gemini', 'Claude API', 'OpenAI', 'LangChain', 'RAG', 'Agentes']],
  ['AU', 'Automação', ['n8n', 'RPA', 'Make.com', 'GitHub Actions']],
  ['SY', 'Sistemas', ['SAP S/4HANA', 'Salesforce', 'SharePoint', 'M365']],
  ['SC', 'Negócio & Supply Chain', ['S&OP', 'Forecast', 'D2C', 'OTD', 'Agro']],
]

export const PROJETOS = [
  {
    slug: 'reciclachain',
    titulo: 'ReciclaChain',
    desc: 'Smart city na blockchain Stellar para incentivar a reciclagem com recompensas on-chain. Stellar Starbase Hackathon.',
    tags: ['Stellar', 'TypeScript', 'Web3'],
    link: 'https://mhaurinho.github.io/stellar/',
  },
  {
    slug: 'litterwatch',
    titulo: 'LitterWatch',
    desc: 'FastCamp EMC/UFG: dados sintéticos no Blender, detecção com YOLO e contagem de visitas à caixa de areia.',
    tags: ['Python', 'YOLO', 'Visão Computacional'],
    link: 'https://github.com/mhaurinho/litterwatch-dados-sinteticos',
  },
  {
    slug: 'agentes',
    titulo: 'Agentes de IA & Automação',
    desc: 'Orquestração de agentes LLM com ferramentas, memória e contexto para automatizar análises e relatórios.',
    tags: ['LLM Agents', 'MCP', 'Python', 'n8n'],
    link: 'https://mhaurinho.github.io/#projetos',
  },
  {
    slug: 'powerbi-ia',
    titulo: 'Power BI + IA',
    desc: 'Dashboards de compras, vendas, carteira, risco de estoque e performance comercial com insights por IA.',
    tags: ['Power BI', 'DAX', 'SQL', 'IA'],
    link: 'https://mhaurinho.github.io/#projetos',
  },
  {
    slug: 'cryptogo',
    titulo: 'CryptoGO',
    desc: 'Plataforma educacional gamificada sobre blockchain e Web3, com conteúdo assistido por IA e foco em UX.',
    tags: ['Web3', 'Gamificação', 'IA'],
    link: 'https://mhaurinho.github.io/#projetos',
  },
  {
    slug: 'rag',
    titulo: 'RAG Document Pipeline',
    desc: 'Q&A corporativo sobre documentos com extração, indexação semântica e busca por embeddings.',
    tags: ['LangChain', 'FAISS', 'Claude API'],
    link: 'https://mhaurinho.github.io/#projetos',
  },
]

export const CONQUISTAS = [
  ['Google Gemini Student Ambassador', 'Programa Estudantes Embaixadores do Google 2026'],
  ['Embaixador da Inovação', 'SCTI Goiás — ecossistema de inovação goiano'],
  ['Stellar Starbase Hackathon', 'ReciclaChain — smart city na blockchain'],
  ['Hackathon SAP', 'Soluções e prototipagem com tecnologias SAP'],
  ['Startup Weekend — Organizador (x2)', 'Conectando empreendedores, mentores e investidores'],
  ['Maratonas de Inovação', 'Sprints de criação para desafios reais de mercado'],
]

export const FORMACAO = [
  ['USP/ESALQ', 'MBA Data Science, Analytics e IA', 'previsão 2027'],
  ['ADS', 'Análise e Desenvolvimento de Sistemas', 'em andamento'],
  ['IFMT', 'Pós Agribusiness / Operações do Agronegócio', '2026'],
  ['IFMG', 'Pós Gestão, Tecnologia e Inovação', '2025'],
  ['UEG', 'Bacharelado em Administração', '2017 — 2022'],
]
