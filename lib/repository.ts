import {
  User, Student, Professor, Case, Assignment, Evaluation,
  SearchResult, BibliographyItem, VerificationResult, AuditLog,
  SystemHealth, TestCase, HedgeRule, ChatMessage, SystemConfig,
  FavoriteSource, UserRole, VerificationCriterion, VerificationStatus
} from './types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

function getItem<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(`edusearch_${key}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setItem<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`edusearch_${key}`, JSON.stringify(data));
}

function getSingle<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(`edusearch_${key}`);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setSingle<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`edusearch_${key}`, JSON.stringify(data));
}

// ============ SEED DATA ============

const seedUsers: (Student | Professor | User)[] = [
  {
    id: 'admin1', email: 'admin@edusearch.com', name: 'Administrador General',
    role: 'admin', active: true, createdAt: '2025-01-01T00:00:00Z',
    lastLogin: '2025-06-01T10:00:00Z'
  },
  {
    id: 'prof1', email: 'professor@edusearch.com', name: 'Dra. María García',
    role: 'professor', active: true, createdAt: '2025-01-15T00:00:00Z',
    lastLogin: '2025-06-10T08:00:00Z', department: 'Medicina Interna',
    totalStudents: 24, totalCases: 8
  } as Professor,
  {
    id: 'prof2', email: 'prof2@edusearch.com', name: 'Dr. Carlos López',
    role: 'professor', active: true, createdAt: '2025-02-01T00:00:00Z',
    department: 'Cirugía', totalStudents: 18, totalCases: 5
  } as Professor,
  {
    id: 'stud1', email: 'student@edusearch.com', name: 'Ana Rodríguez',
    role: 'student', active: true, createdAt: '2025-02-15T00:00:00Z',
    lastLogin: '2025-06-12T14:00:00Z', group: 'A1', progress: 65,
    casesCompleted: 3, casesAssigned: 5,
    competencies: [
      { name: 'Búsqueda académica', level: 72 },
      { name: 'Análisis crítico', level: 58 },
      { name: 'Verificación de fuentes', level: 80 },
      { name: 'Redacción científica', level: 45 },
    ]
  } as Student,
  {
    id: 'stud2', email: 'student2@edusearch.com', name: 'Pedro Martínez',
    role: 'student', active: true, createdAt: '2025-02-20T00:00:00Z',
    group: 'A1', progress: 40, casesCompleted: 2, casesAssigned: 5,
    competencies: [
      { name: 'Búsqueda académica', level: 50 },
      { name: 'Análisis crítico', level: 38 },
      { name: 'Verificación de fuentes', level: 55 },
      { name: 'Redacción científica', level: 30 },
    ]
  } as Student,
  {
    id: 'stud3', email: 'student3@edusearch.com', name: 'Laura Sánchez',
    role: 'student', active: true, createdAt: '2025-03-01T00:00:00Z',
    group: 'B1', progress: 85, casesCompleted: 4, casesAssigned: 5,
    competencies: [
      { name: 'Búsqueda académica', level: 90 },
      { name: 'Análisis crítico', level: 82 },
      { name: 'Verificación de fuentes', level: 88 },
      { name: 'Redacción científica', level: 75 },
    ]
  } as Student,
  {
    id: 'stud4', email: 'student4@edusearch.com', name: 'Diego Fernández',
    role: 'student', active: false, createdAt: '2025-03-10T00:00:00Z',
    group: 'B1', progress: 15, casesCompleted: 1, casesAssigned: 4,
    competencies: [
      { name: 'Búsqueda académica', level: 20 },
      { name: 'Análisis crítico', level: 15 },
      { name: 'Verificación de fuentes', level: 25 },
      { name: 'Redacción científica', level: 10 },
    ]
  } as Student,
];

const seedCases: Case[] = [
  {
    id: 'case1', title: 'Neumonía adquirida en comunidad: Evaluación diagnóstica',
    description: 'Caso clínico sobre un paciente de 65 años con tos productiva, fiebre y disnea. Se requiere evaluar el enfoque diagnóstico óptimo según la evidencia actual.',
    objectives: ['Identificar criterios diagnósticos basados en evidencia', 'Evaluar la utilidad de pruebas de imagen', 'Analizar escalas de severidad (CURB-65, PSI)'],
    instructions: 'Revise las guías clínicas más recientes y analice la evidencia disponible sobre el diagnóstico de NAC. Presente un análisis crítico de al menos 3 fuentes.',
    difficulty: 'intermediate', category: 'Neumología', deadline: '2025-07-15',
    evaluationCriteria: ['Calidad del análisis', 'Uso de fuentes apropiadas', 'Coherencia argumentativa', 'Aplicación de niveles de evidencia'],
    suggestedResources: ['Guía ATS/IDSA 2019', 'Metaanálisis de biomarcadores en NAC', 'Revisión Cochrane de diagnóstico'],
    status: 'published', professorId: 'prof1', professorName: 'Dra. María García',
    createdAt: '2025-05-01T00:00:00Z', updatedAt: '2025-05-01T00:00:00Z',
    assignedTo: ['stud1', 'stud2', 'stud3']
  },
  {
    id: 'case2', title: 'Manejo de diabetes tipo 2: Novedades terapéuticas',
    description: 'Paciente de 52 años con DM2 mal controlada (HbA1c 9.2%). Analizar las opciones terapéuticas actuales según la evidencia más reciente.',
    objectives: ['Evaluar eficacia de nuevos fármacos (GLP-1 RA, SGLT2i)', 'Analizar estudios cardiovasculares', 'Comparar guías ADA/EASD vs ALAD'],
    instructions: 'Realice una búsqueda sistemática sobre los nuevos tratamientos para DM2. Evalúe la calidad de la evidencia y presente recomendaciones.',
    difficulty: 'advanced', category: 'Endocrinología', deadline: '2025-07-20',
    evaluationCriteria: ['Profundidad de búsqueda', 'Evaluación crítica de estudios', 'Claridad de recomendaciones', 'Uso de pirámide de evidencia'],
    suggestedResources: ['Estudios REWIND, SUSTAIN-6', 'Guía ADA 2024 Standards of Care', 'Metaanálisis Efficacy of GLP-1 RA'],
    status: 'published', professorId: 'prof1', professorName: 'Dra. María García',
    createdAt: '2025-05-10T00:00:00Z', updatedAt: '2025-05-10T00:00:00Z',
    assignedTo: ['stud1', 'stud3']
  },
  {
    id: 'case3', title: 'Antibioticoprofilaxis en cirugía: Análisis de evidencia',
    description: 'Evaluar la evidencia sobre antibioticoprofilaxis quirúrgica en procedimientos abdominales.',
    objectives: ['Revisar guías de antibioticoprofilaxis', 'Analizar estudios sobre duración óptima', 'Evaluar resistencia bacteriana'],
    instructions: 'Compare las recomendaciones de diferentes guías y evalúe la evidencia subyacente.',
    difficulty: 'basic', category: 'Cirugía',
    evaluationCriteria: ['Comprensión del tema', 'Calidad de fuentes', 'Análisis comparativo'],
    suggestedResources: ['Guía ASHP', 'Revisión Cochrane', 'WHO Guidelines'],
    status: 'published', professorId: 'prof2', professorName: 'Dr. Carlos López',
    createdAt: '2025-04-20T00:00:00Z', updatedAt: '2025-04-20T00:00:00Z',
    assignedTo: ['stud2', 'stud4']
  },
  {
    id: 'case4', title: 'Diagnóstico diferencial de dolor torácico',
    description: 'Paciente de 45 años con dolor torácico agudo. Desarrollar un algoritmo diagnóstico basado en evidencia.',
    objectives: ['Desarrollar algoritmo diagnóstico', 'Evaluar biomarcadores cardiacos', 'Analizar criterios de riesgo'],
    instructions: 'Cree un algoritmo diagnóstico fundamentado en la mejor evidencia disponible.',
    difficulty: 'intermediate', category: 'Cardiología',
    evaluationCriteria: ['Fundamento en evidencia', 'Claridad del algoritmo', 'Consideración de alternativas'],
    suggestedResources: ['Guía ESC 2024', 'Estudio HEART score', 'Metaanálisis troponinas de alta sensibilidad'],
    status: 'published', professorId: 'prof1', professorName: 'Dra. María García',
    createdAt: '2025-05-15T00:00:00Z', updatedAt: '2025-05-15T00:00:00Z',
    assignedTo: ['stud1', 'stud2', 'stud3', 'stud4']
  },
];

const seedAssignments: Assignment[] = [
  {
    id: 'asgn1', caseId: 'case1', studentId: 'stud1', studentName: 'Ana Rodríguez',
    status: 'completed', response: 'Análisis completo basado en 4 fuentes incluyendo la guía ATS/IDSA 2019 y dos metaanálisis recientes. El enfoque diagnóstico debe incluir curva-65 para clasificación de severidad...',
    submittedAt: '2025-06-01T10:00:00Z', feedback: 'Excelente análisis. Muy buena integración de fuentes. Podría profundizar más en la evaluación de biomarcadores.',
    score: 85, maxScore: 100, progress: 100
  },
  {
    id: 'asgn2', caseId: 'case1', studentId: 'stud2', studentName: 'Pedro Martínez',
    status: 'in_progress', progress: 45, maxScore: 100
  },
  {
    id: 'asgn3', caseId: 'case1', studentId: 'stud3', studentName: 'Laura Sánchez',
    status: 'completed', response: 'Revisión exhaustiva de la literatura. Se identificaron 12 estudios relevantes. La escala CURB-65 demostró mejor valor predictivo en la población estudiada...',
    submittedAt: '2025-06-02T14:00:00Z', feedback: 'Muy completo. Excelente uso de la pirámide de evidencia.',
    score: 92, maxScore: 100, progress: 100
  },
  {
    id: 'asgn4', caseId: 'case2', studentId: 'stud1', studentName: 'Ana Rodríguez',
    status: 'in_progress', progress: 30, maxScore: 100
  },
  {
    id: 'asgn5', caseId: 'case2', studentId: 'stud3', studentName: 'Laura Sánchez',
    status: 'pending', progress: 0, maxScore: 100
  },
  {
    id: 'asgn6', caseId: 'case3', studentId: 'stud2', studentName: 'Pedro Martínez',
    status: 'pending', progress: 0, maxScore: 100
  },
  {
    id: 'asgn7', caseId: 'case4', studentId: 'stud1', studentName: 'Ana Rodríguez',
    status: 'pending', progress: 0, maxScore: 100
  },
  {
    id: 'asgn8', caseId: 'case4', studentId: 'stud2', studentName: 'Pedro Martínez',
    status: 'pending', progress: 0, maxScore: 100
  },
];

const seedEvaluations: Evaluation[] = [
  {
    id: 'eval1', assignmentId: 'asgn1', caseId: 'case1', caseTitle: 'Neumonía adquirida en comunidad: Evaluación diagnóstica',
    studentId: 'stud1', studentName: 'Ana Rodríguez',
    response: 'Análisis completo basado en 4 fuentes...', score: 85, maxScore: 100,
    feedback: 'Excelente análisis. Muy buena integración de fuentes.',
    status: 'reviewed', reviewedAt: '2025-06-03T09:00:00Z', reviewedBy: 'prof1',
    rubric: [
      { criterion: 'Calidad del análisis', maxScore: 25, score: 22, comment: 'Muy buen nivel' },
      { criterion: 'Uso de fuentes apropiadas', maxScore: 25, score: 21, comment: 'Fuentes relevantes' },
      { criterion: 'Coherencia argumentativa', maxScore: 25, score: 22, comment: 'Argumentos sólidos' },
      { criterion: 'Aplicación de niveles de evidencia', maxScore: 25, score: 20, comment: 'Buena aplicación' },
    ]
  },
  {
    id: 'eval2', assignmentId: 'asgn3', caseId: 'case1', caseTitle: 'Neumonía adquirida en comunidad: Evaluación diagnóstica',
    studentId: 'stud3', studentName: 'Laura Sánchez',
    response: 'Revisión exhaustiva de la literatura...', score: 92, maxScore: 100,
    feedback: 'Muy completo. Excelente uso de la pirámide de evidencia.',
    status: 'reviewed', reviewedAt: '2025-06-04T11:00:00Z', reviewedBy: 'prof1',
    rubric: [
      { criterion: 'Calidad del análisis', maxScore: 25, score: 24, comment: 'Excelente' },
      { criterion: 'Uso de fuentes apropiadas', maxScore: 25, score: 23, comment: 'Muy completo' },
      { criterion: 'Coherencia argumentativa', maxScore: 25, score: 23, comment: 'Sólido' },
      { criterion: 'Aplicación de niveles de evidencia', maxScore: 25, score: 22, comment: 'Excelente aplicación' },
    ]
  },
];

const seedSearchResults: SearchResult[] = [
  {
    id: 'sr1', title: 'Diagnosis and Treatment of Adults with Community-Acquired Pneumonia',
    authors: 'Metlay JP, Waterer GW, Long AC', year: 2019,
    source: 'American Journal of Respiratory and Critical Care Medicine', type: 'clinical_guide',
    evidenceLevel: 1, abstract: 'Guía clínica oficial ATS/IDSA para el manejo de neumonía adquirida en comunidad en adultos, basada en revisión sistemática y metaanálisis.',
    doi: '10.1164/rccm.201908-1581ST', journal: 'AJRCCM', reliability: 'high',
    keywords: ['neumonía', 'NAC', 'diagnóstico', 'guía clínica']
  },
  {
    id: 'sr2', title: 'Procalcitonin-guided antibiotic therapy in adult patients with acute respiratory infections',
    authors: 'Schuetz P, Wirz Y, Sager R', year: 2020,
    source: 'Cochrane Database of Systematic Reviews', type: 'systematic_review',
    evidenceLevel: 1, abstract: 'Revisión sistemática Cochrane que evalúa la utilidad de procalcitonina como guía para terapia antimicrobiana en infecciones respiratorias agudas.',
    doi: '10.1002/14651858.CD007498.pub3', journal: 'Cochrane', reliability: 'high',
    keywords: ['procalcitonina', 'antibióticos', 'infecciones respiratorias']
  },
  {
    id: 'sr3', title: 'SGLT2 inhibitors and GLP-1 receptor agonists for type 2 diabetes',
    authors: 'Zinman B, Wanner C, Lachin JM', year: 2022,
    source: 'The Lancet', type: 'clinical_trial', evidenceLevel: 2,
    abstract: 'Ensayo clínico que evalúa los efectos cardiovasculares y renales de inhibidores SGLT2 y agonistas GLP-1 en diabetes tipo 2.',
    doi: '10.1016/S0140-6736(22)00456-1', journal: 'The Lancet', reliability: 'high',
    keywords: ['diabetes', 'SGLT2', 'GLP-1', 'cardiovascular']
  },
  {
    id: 'sr4', title: 'Efficacy and safety of GLP-1 receptor agonists in type 2 diabetes: A meta-analysis',
    authors: 'Bethel MA, Patel RA, Merrill P', year: 2021,
    source: 'Diabetes Care', type: 'systematic_review', evidenceLevel: 1,
    abstract: 'Metaanálisis que evalúa la eficacia y seguridad de agonistas del receptor GLP-1 en el control glucémico y eventos cardiovasculares.',
    doi: '10.2337/dc21-0456', journal: 'Diabetes Care', reliability: 'high',
    keywords: ['GLP-1', 'metaanálisis', 'diabetes', 'cardiovascular']
  },
  {
    id: 'sr5', title: 'Antibiotic prophylaxis in abdominal surgery: A systematic review',
    authors: 'Nelson RL, Gladman E, Barbateskovic M', year: 2020,
    source: 'Cochrane Database of Systematic Reviews', type: 'systematic_review',
    evidenceLevel: 1, abstract: 'Revisión Cochrane sobre antibioticoprofilaxis en cirugía abdominal, incluyendo duración óptima y selección de antimicrobianos.',
    doi: '10.1002/14651858.CD001929.pub4', journal: 'Cochrane', reliability: 'high',
    keywords: ['antibioticoprofilaxis', 'cirugía abdominal', 'Cochrane']
  },
  {
    id: 'sr6', title: 'High-sensitivity troponin and the HEART score for early rule-out of acute myocardial infarction',
    authors: 'Body R, Carlton E, Sperrin M', year: 2021,
    source: 'European Heart Journal', type: 'clinical_trial', evidenceLevel: 2,
    abstract: 'Ensayo prospectivo que evalúa la combinación de troponinas de alta sensibilidad con el score HEART para exclusión temprana de infarto agudo de miocardio.',
    doi: '10.1093/eurheartj/ehab234', journal: 'European Heart Journal', reliability: 'high',
    keywords: ['troponina', 'HEART score', 'dolor torácico', 'IAM']
  },
  {
    id: 'sr7', title: 'Clinical predictors of community-acquired pneumonia severity',
    authors: 'Lim WS, van der Eerden MM, Laing R', year: 2023,
    source: 'Thorax', type: 'article', evidenceLevel: 3,
    abstract: 'Estudio de cohorte que evalúa predictores clínicos de severidad en NAC, comparando CURB-65 con PSI.',
    doi: '10.1136/thoraxjnl-2023-218956', journal: 'Thorax', reliability: 'medium',
    keywords: ['NAC', 'CURB-65', 'PSI', 'severidad']
  },
  {
    id: 'sr8', title: 'Biomarkers in community-acquired pneumonia: Current evidence and future directions',
    authors: 'Krüger S, Ewig S, Papassotiriou J', year: 2022,
    source: 'Infection', type: 'article', evidenceLevel: 3,
    abstract: 'Revisión narrativa sobre biomarcadores en NAC, incluyendo procalcitonina, proADM y CRP.',
    journal: 'Infection', reliability: 'medium',
    keywords: ['biomarcadores', 'NAC', 'procalcitonina']
  },
  {
    id: 'sr9', title: 'Diabetes management guidelines comparison: ADA vs EASD 2024',
    authors: 'Davies MJ, Aroda VR, Collins BS', year: 2024,
    source: 'Diabetologia', type: 'clinical_guide', evidenceLevel: 1,
    abstract: 'Comparación de las guías ADA 2024 y EASD para el manejo de diabetes tipo 2, con enfoque en terapias basadas en evidencia.',
    doi: '10.1007/s00125-024-05678-3', journal: 'Diabetologia', reliability: 'high',
    keywords: ['diabetes', 'ADA', 'EASD', 'guías']
  },
  {
    id: 'sr10', title: 'Riesgo cardiovascular en diabetes: Actualización 2024',
    authors: 'Santiago AH, Rodríguez EM, Vega FL', year: 2024,
    source: 'Revista Española de Cardiología', type: 'article', evidenceLevel: 4,
    abstract: 'Revisión de la literatura sobre riesgo cardiovascular en pacientes con diabetes tipo 2 en población hispana.',
    url: 'https://revespcardiol.org/example', journal: 'Rev Esp Cardiol', reliability: 'medium',
    keywords: ['diabetes', 'cardiovascular', 'riesgo']
  },
];

const seedBibliography: BibliographyItem[] = [
  {
    id: 'bib1', type: 'article', author: 'Metlay JP, Waterer GW, Long AC',
    title: 'Diagnosis and Treatment of Adults with Community-Acquired Pneumonia',
    year: '2019', journal: 'American Journal of Respiratory and Critical Care Medicine',
    doi: '10.1164/rccm.201908-1581ST', userId: 'stud1', createdAt: '2025-06-01T10:00:00Z'
  },
  {
    id: 'bib2', type: 'book', author: 'Guyatt G, Rennie D, Meade MO',
    title: 'Users Guide to the Medical Literature: A Manual for Evidence-Based Clinical Practice',
    year: '2015', publisher: 'JAMA Evidence', userId: 'stud1', createdAt: '2025-06-01T10:05:00Z'
  },
];

const seedHedges: HedgeRule[] = [
  {
    id: 'hedge1', name: 'Filtro de metaanálisis',
    description: 'Limita búsqueda a metaanálisis y revisiones sistemáticas de alta calidad',
    category: 'search', active: true,
    examples: ['meta-analysis[pt] OR systematic review[pt]', 'meta-analysis Publication Type'],
    professorId: 'prof1', createdAt: '2025-04-01T00:00:00Z'
  },
  {
    id: 'hedge2', name: 'Criterio de autoría',
    description: 'Verificar que la fuente tenga autores identificables con afiliación institucional',
    category: 'verification', active: true,
    examples: ['Autor con afiliación a universidad reconocida', 'ORCID verificado'],
    professorId: 'prof1', createdAt: '2025-04-05T00:00:00Z'
  },
  {
    id: 'hedge3', name: 'Rúbrica de análisis crítico',
    description: 'Criterios para evaluar la capacidad de análisis crítico de fuentes',
    category: 'evaluation', active: true,
    examples: ['Identifica fortalezas y debilidades del estudio', 'Compara con otros estudios del tema'],
    professorId: 'prof1', createdAt: '2025-04-10T00:00:00Z'
  },
];

const seedAuditLogs: AuditLog[] = [
  { id: 'log1', userId: 'admin1', userName: 'Administrador General', action: 'LOGIN', resource: 'auth', ip: '192.168.1.1', timestamp: '2025-06-12T08:00:00Z' },
  { id: 'log2', userId: 'prof1', userName: 'Dra. María García', action: 'CREATE_CASE', resource: 'case', resourceId: 'case1', ip: '192.168.1.2', timestamp: '2025-05-01T10:00:00Z' },
  { id: 'log3', userId: 'stud1', userName: 'Ana Rodríguez', action: 'LOGIN', resource: 'auth', ip: '192.168.1.3', timestamp: '2025-06-12T14:00:00Z' },
  { id: 'log4', userId: 'prof1', userName: 'Dra. María García', action: 'EVALUATE', resource: 'evaluation', resourceId: 'eval1', ip: '192.168.1.2', timestamp: '2025-06-03T09:00:00Z' },
  { id: 'log5', userId: 'admin1', userName: 'Administrador General', action: 'UPDATE_SETTINGS', resource: 'system', ip: '192.168.1.1', timestamp: '2025-06-11T16:00:00Z' },
  { id: 'log6', userId: 'stud1', userName: 'Ana Rodríguez', action: 'SEARCH', resource: 'search', ip: '192.168.1.3', timestamp: '2025-06-10T11:00:00Z' },
  { id: 'log7', userId: 'stud1', userName: 'Ana Rodríguez', action: 'VERIFY_SOURCE', resource: 'verification', ip: '192.168.1.3', timestamp: '2025-06-10T11:30:00Z' },
  { id: 'log8', userId: 'prof1', userName: 'Dra. María García', action: 'CREATE_CASE', resource: 'case', resourceId: 'case2', ip: '192.168.1.2', timestamp: '2025-05-10T09:00:00Z' },
];

const seedTestCases: TestCase[] = [
  { id: 'test1', name: 'Autenticación de alumno', category: 'Alumno', status: 'passed', duration: 1.2, lastRun: '2025-06-12T10:00:00Z', logs: ['Login exitoso para student@edusearch.com', 'Redirección a /student correcta'] },
  { id: 'test2', name: 'Búsqueda académica', category: 'Alumno', status: 'passed', duration: 0.8, lastRun: '2025-06-12T10:01:00Z', logs: ['Búsqueda con filtros funcional', 'Resultados mostrados correctamente'] },
  { id: 'test3', name: 'Verificación de fuentes', category: 'Alumno', status: 'passed', duration: 1.5, lastRun: '2025-06-12T10:02:00Z', logs: ['Verificación URL completada', 'Semáforo mostrado correctamente'] },
  { id: 'test4', name: 'Crear caso clínico', category: 'Profesor', status: 'passed', duration: 2.1, lastRun: '2025-06-12T10:03:00Z', logs: ['Formulario validado correctamente', 'Caso creado en localStorage'] },
  { id: 'test5', name: 'Evaluar respuesta', category: 'Profesor', status: 'passed', duration: 1.8, lastRun: '2025-06-12T10:04:00Z', logs: ['Rúbrica cargada', 'Puntuación guardada'] },
  { id: 'test6', name: 'Gestión de usuarios', category: 'Admin', status: 'passed', duration: 1.3, lastRun: '2025-06-12T10:05:00Z', logs: ['CRUD de usuarios funcional', 'Filtros por rol correctos'] },
  { id: 'test7', name: 'Protección de rutas', category: 'Seguridad', status: 'passed', duration: 0.5, lastRun: '2025-06-12T10:06:00Z', logs: ['Alumno bloqueado de /admin', 'Profesor bloqueado de /admin'] },
  { id: 'test8', name: 'Persistencia de datos', category: 'Rendimiento', status: 'pending', logs: [] },
  { id: 'test9', name: 'Generación de bibliografía APA', category: 'Alumno', status: 'pending', logs: [] },
  { id: 'test10', name: 'Chat educativo', category: 'Alumno', status: 'pending', logs: [] },
];

const seedSystemConfig: SystemConfig = {
  platformName: 'EduSearch',
  maintenanceMode: false,
  userLimit: 500,
  searchConfig: { maxResults: 50, defaultFilter: 'article', enableAI: true },
  verificationConfig: { strictMode: false, autoVerify: false, minReliabilityScore: 60 },
  securityConfig: { maxLoginAttempts: 5, sessionTimeout: 30, twoFactorAuth: false },
};

const seedHealth: SystemHealth = {
  overall: 'healthy',
  services: [
    { name: 'API Principal', status: 'healthy', latency: 45, uptime: 99.98, lastChecked: new Date().toISOString() },
    { name: 'Base de Datos', status: 'healthy', latency: 12, uptime: 99.99, lastChecked: new Date().toISOString() },
    { name: 'Servicio de Búsqueda', status: 'healthy', latency: 120, uptime: 99.5, lastChecked: new Date().toISOString() },
    { name: 'Servicio de Verificación', status: 'warning', latency: 350, uptime: 97.2, lastChecked: new Date().toISOString(), message: 'Latencia elevada' },
    { name: 'Servidor de Correo', status: 'healthy', latency: 80, uptime: 99.9, lastChecked: new Date().toISOString() },
    { name: 'Servicio de IA', status: 'healthy', latency: 200, uptime: 98.5, lastChecked: new Date().toISOString() },
  ],
  lastUpdated: new Date().toISOString(),
  errorCount: 3,
  uptime: 99.7,
};

// ============ REPOSITORIES ============

export const userRepo = {
  getAll: (): User[] => getItem('users'),
  getById: (id: string): User | undefined => getItem<User>('users').find(u => u.id === id),
  getByEmail: (email: string): User | undefined => getItem<User>('users').find(u => u.email === email),
  getByRole: (role: UserRole): User[] => getItem<User>('users').filter(u => u.role === role),
  create: (user: Omit<User, 'id' | 'createdAt'>): User => {
    const users = getItem<User>('users');
    const newUser: User = { ...user, id: generateId(), createdAt: new Date().toISOString() };
    users.push(newUser);
    setItem('users', users);
    return newUser;
  },
  update: (id: string, data: Partial<User>): User | undefined => {
    const users = getItem<User>('users');
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    users[idx] = { ...users[idx], ...data };
    setItem('users', users);
    return users[idx];
  },
  delete: (id: string): boolean => {
    const users = getItem<User>('users');
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) return false;
    setItem('users', filtered);
    return true;
  },
};

export const caseRepo = {
  getAll: (): Case[] => getItem('cases'),
  getById: (id: string): Case | undefined => getItem<Case>('cases').find(c => c.id === id),
  getByProfessor: (professorId: string): Case[] => getItem<Case>('cases').filter(c => c.professorId === professorId),
  getByStudent: (studentId: string): Case[] => getItem<Case>('cases').filter(c => c.assignedTo.includes(studentId)),
  create: (c: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>): Case => {
    const cases = getItem<Case>('cases');
    const newCase: Case = { ...c, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    cases.push(newCase);
    setItem('cases', cases);
    return newCase;
  },
  update: (id: string, data: Partial<Case>): Case | undefined => {
    const cases = getItem<Case>('cases');
    const idx = cases.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    cases[idx] = { ...cases[idx], ...data, updatedAt: new Date().toISOString() };
    setItem('cases', cases);
    return cases[idx];
  },
  delete: (id: string): boolean => {
    const cases = getItem<Case>('cases');
    const filtered = cases.filter(c => c.id !== id);
    setItem('cases', filtered);
    return filtered.length < cases.length;
  },
};

export const assignmentRepo = {
  getAll: (): Assignment[] => getItem('assignments'),
  getByStudent: (studentId: string): Assignment[] => getItem<Assignment>('assignments').filter(a => a.studentId === studentId),
  getByCase: (caseId: string): Assignment[] => getItem<Assignment>('assignments').filter(a => a.caseId === caseId),
  getById: (id: string): Assignment | undefined => getItem<Assignment>('assignments').find(a => a.id === id),
  create: (a: Omit<Assignment, 'id'>): Assignment => {
    const assignments = getItem<Assignment>('assignments');
    const newAssignment: Assignment = { ...a, id: generateId() };
    assignments.push(newAssignment);
    setItem('assignments', assignments);
    return newAssignment;
  },
  update: (id: string, data: Partial<Assignment>): Assignment | undefined => {
    const assignments = getItem<Assignment>('assignments');
    const idx = assignments.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    assignments[idx] = { ...assignments[idx], ...data };
    setItem('assignments', assignments);
    return assignments[idx];
  },
};

export const evaluationRepo = {
  getAll: (): Evaluation[] => getItem('evaluations'),
  getByProfessor: (professorId: string): Evaluation[] => {
    const cases = getItem<Case>('cases').filter(c => c.professorId === professorId);
    const caseIds = cases.map(c => c.id);
    return getItem<Evaluation>('evaluations').filter(e => caseIds.includes(e.caseId));
  },
  getById: (id: string): Evaluation | undefined => getItem<Evaluation>('evaluations').find(e => e.id === id),
  getByStudent: (studentId: string): Evaluation[] => getItem<Evaluation>('evaluations').filter(e => e.studentId === studentId),
  create: (e: Omit<Evaluation, 'id'>): Evaluation => {
    const evaluations = getItem<Evaluation>('evaluations');
    const newEval: Evaluation = { ...e, id: generateId() };
    evaluations.push(newEval);
    setItem('evaluations', evaluations);
    return newEval;
  },
  update: (id: string, data: Partial<Evaluation>): Evaluation | undefined => {
    const evaluations = getItem<Evaluation>('evaluations');
    const idx = evaluations.findIndex(e => e.id === id);
    if (idx === -1) return undefined;
    evaluations[idx] = { ...evaluations[idx], ...data };
    setItem('evaluations', evaluations);
    return evaluations[idx];
  },
};

export const searchRepo = {
  getAll: (): SearchResult[] => getItem('searchResults'),
  search: (query: string, filters?: { type?: string; year?: number; evidenceLevel?: number }): SearchResult[] => {
    let results = getItem<SearchResult>('searchResults');
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.authors.toLowerCase().includes(q) ||
        r.abstract.toLowerCase().includes(q) ||
        r.keywords.some(k => k.toLowerCase().includes(q))
      );
    }
    if (filters?.type) results = results.filter(r => r.type === filters.type);
    if (filters?.year) results = results.filter(r => r.year === filters.year);
    if (filters?.evidenceLevel) results = results.filter(r => r.evidenceLevel <= filters.evidenceLevel!);
    return results;
  },
};

export const bibliographyRepo = {
  getByUser: (userId: string): BibliographyItem[] => getItem<BibliographyItem>('bibliography').filter(b => b.userId === userId),
  create: (b: Omit<BibliographyItem, 'id' | 'createdAt'>): BibliographyItem => {
    const items = getItem<BibliographyItem>('bibliography');
    const newItem: BibliographyItem = { ...b, id: generateId(), createdAt: new Date().toISOString() };
    items.push(newItem);
    setItem('bibliography', items);
    return newItem;
  },
  update: (id: string, data: Partial<BibliographyItem>): BibliographyItem | undefined => {
    const items = getItem<BibliographyItem>('bibliography');
    const idx = items.findIndex(b => b.id === id);
    if (idx === -1) return undefined;
    items[idx] = { ...items[idx], ...data };
    setItem('bibliography', items);
    return items[idx];
  },
  delete: (id: string): boolean => {
    const items = getItem<BibliographyItem>('bibliography');
    const filtered = items.filter(b => b.id !== id);
    setItem('bibliography', filtered);
    return filtered.length < items.length;
  },
};

export const verificationRepo = {
  getByUser: (userId: string): VerificationResult[] => getItem<VerificationResult>('verifications').filter(v => v.userId === userId),
  create: (v: Omit<VerificationResult, 'id'>): VerificationResult => {
    const items = getItem<VerificationResult>('verifications');
    const newV: VerificationResult = { ...v, id: generateId() };
    items.push(newV);
    setItem('verifications', items);
    return newV;
  },
};

export const auditRepo = {
  getAll: (): AuditLog[] => getItem('auditLogs'),
  create: (log: Omit<AuditLog, 'id'>): AuditLog => {
    const logs = getItem<AuditLog>('auditLogs');
    const newLog: AuditLog = { ...log, id: generateId() };
    logs.push(newLog);
    setItem('auditLogs', logs);
    return newLog;
  },
  clear: (): void => setItem('auditLogs', []),
};

export const hedgeRepo = {
  getByProfessor: (professorId: string): HedgeRule[] => getItem<HedgeRule>('hedges').filter(h => h.professorId === professorId),
  getAll: (): HedgeRule[] => getItem('hedges'),
  create: (h: Omit<HedgeRule, 'id' | 'createdAt'>): HedgeRule => {
    const items = getItem<HedgeRule>('hedges');
    const newH: HedgeRule = { ...h, id: generateId(), createdAt: new Date().toISOString() };
    items.push(newH);
    setItem('hedges', items);
    return newH;
  },
  update: (id: string, data: Partial<HedgeRule>): HedgeRule | undefined => {
    const items = getItem<HedgeRule>('hedges');
    const idx = items.findIndex(h => h.id === id);
    if (idx === -1) return undefined;
    items[idx] = { ...items[idx], ...data };
    setItem('hedges', items);
    return items[idx];
  },
  delete: (id: string): boolean => {
    const items = getItem<HedgeRule>('hedges');
    const filtered = items.filter(h => h.id !== id);
    setItem('hedges', filtered);
    return filtered.length < items.length;
  },
};

export const chatRepo = {
  getByUser: (userId: string, context: string): ChatMessage[] =>
    getItem<ChatMessage>('chats').filter(m => m.userId === userId && m.context === context),
  create: (msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage => {
    const messages = getItem<ChatMessage>('chats');
    const newMsg: ChatMessage = { ...msg, id: generateId(), timestamp: new Date().toISOString() };
    messages.push(newMsg);
    setItem('chats', messages);
    return newMsg;
  },
  clear: (userId: string, context: string): void => {
    const messages = getItem<ChatMessage>('chats').filter(m => !(m.userId === userId && m.context === context));
    setItem('chats', messages);
  },
};

export const favoriteRepo = {
  getByUser: (userId: string): FavoriteSource[] => getItem<FavoriteSource>('favorites').filter(f => f.userId === userId),
  add: (userId: string, searchResultId: string): FavoriteSource => {
    const favs = getItem<FavoriteSource>('favorites');
    const existing = favs.find(f => f.userId === userId && f.searchResultId === searchResultId);
    if (existing) return existing;
    const newFav: FavoriteSource = { id: generateId(), userId, searchResultId, addedAt: new Date().toISOString() };
    favs.push(newFav);
    setItem('favorites', favs);
    return newFav;
  },
  remove: (userId: string, searchResultId: string): void => {
    const favs = getItem<FavoriteSource>('favorites').filter(f => !(f.userId === userId && f.searchResultId === searchResultId));
    setItem('favorites', favs);
  },
  isFavorite: (userId: string, searchResultId: string): boolean => {
    return getItem<FavoriteSource>('favorites').some(f => f.userId === userId && f.searchResultId === searchResultId);
  },
};

export const configRepo = {
  get: (): SystemConfig => getSingle('config', seedSystemConfig),
  set: (config: SystemConfig): void => setSingle('config', config),
  reset: (): void => setSingle('config', seedSystemConfig),
};

export const healthRepo = {
  get: (): SystemHealth => getSingle('health', seedHealth),
  refresh: (): SystemHealth => {
    const health = getSingle<SystemHealth>('health', seedHealth);
    const updated: SystemHealth = {
      ...health,
      services: health.services.map(s => ({
        ...s,
        latency: s.latency + Math.floor(Math.random() * 50 - 25),
        lastChecked: new Date().toISOString(),
        status: (['healthy', 'healthy', 'healthy', 'warning'] as const)[Math.floor(Math.random() * 4)] as SystemHealth['services'][0]['status'],
      })),
      lastUpdated: new Date().toISOString(),
    };
    setSingle('health', updated);
    return updated;
  },
};

export const testRepo = {
  getAll: (): TestCase[] => getItem('testCases'),
  update: (id: string, data: Partial<TestCase>): TestCase | undefined => {
    const tests = getItem<TestCase>('testCases');
    const idx = tests.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    tests[idx] = { ...tests[idx], ...data };
    setItem('testCases', tests);
    return tests[idx];
  },
  runTest: (id: string): TestCase => {
    const tests = getItem<TestCase>('testCases');
    const idx = tests.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Test not found');
    tests[idx] = { ...tests[idx], status: 'running', lastRun: new Date().toISOString(), logs: ['Iniciando prueba...'] };
    setItem('testCases', tests);
    // Simulate async test completion (caller should call completeTest after delay)
    return tests[idx];
  },
  completeTest: (id: string, passed: boolean, duration: number): TestCase => {
    const tests = getItem<TestCase>('testCases');
    const idx = tests.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Test not found');
    tests[idx] = {
      ...tests[idx],
      status: passed ? 'passed' : 'failed',
      duration,
      lastRun: new Date().toISOString(),
      logs: [...tests[idx].logs, passed ? 'Prueba completada exitosamente' : 'Prueba fallida: error simulado', `Duración: ${duration}s`],
    };
    setItem('testCases', tests);
    return tests[idx];
  },
};

// ============ SEED ============

export function seedDatabase(): void {
  if (typeof window === 'undefined') return;
  const seeded = localStorage.getItem('edusearch_seeded');
  if (seeded) return;

  setItem('users', seedUsers);
  setItem('cases', seedCases);
  setItem('assignments', seedAssignments);
  setItem('evaluations', seedEvaluations);
  setItem('searchResults', seedSearchResults);
  setItem('bibliography', seedBibliography);
  setItem('hedges', seedHedges);
  setItem('auditLogs', seedAuditLogs);
  setItem('testCases', seedTestCases);
  setSingle('config', seedSystemConfig);
  setSingle('health', seedHealth);

  localStorage.setItem('edusearch_seeded', 'true');
}

export function resetDatabase(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('edusearch_seeded');
  seedDatabase();
}

// ============ BIBLIOGRAPHY FORMATTING ============

export function formatAPA(item: BibliographyItem): string {
  switch (item.type) {
    case 'book':
      return `${item.author} (${item.year}). ${item.title}. ${item.publisher || ''}.`.replace(/,\s*\./g, '.').replace(/\.\s*\./g, '.');
    case 'article':
      return `${item.author} (${item.year}). ${item.title}. ${item.journal || ''}, ${item.doi ? `https://doi.org/${item.doi}` : item.url || ''}`.replace(/,\s*$/gm, '');
    case 'journal':
      return `${item.author} (${item.year}). ${item.title}. ${item.journal || ''}. ${item.doi ? `https://doi.org/${item.doi}` : ''}`.replace(/,\s*$/gm, '');
    case 'web':
      return `${item.author} (${item.year}). ${item.title}. ${item.url || ''}`;
    case 'doi':
      return `${item.author} (${item.year}). ${item.title}. https://doi.org/${item.doi || ''}`;
    default:
      return `${item.author} (${item.year}). ${item.title}.`;
  }
}

export function formatVancouver(item: BibliographyItem): string {
  switch (item.type) {
    case 'book':
      return `${item.author}. ${item.title}. ${item.publisher ? item.publisher + ',' : ''} ${item.year}.`;
    case 'article':
    case 'journal':
      return `${item.author}. ${item.title}. ${item.journal || ''}. ${item.year};${item.doi ? ` doi: ${item.doi}` : ''}`;
    case 'web':
      return `${item.author}. ${item.title} [Internet]. ${item.year}. Available from: ${item.url || ''}`;
    case 'doi':
      return `${item.author}. ${item.title}. ${item.year}. doi: ${item.doi || ''}`;
    default:
      return `${item.author}. ${item.title}. ${item.year}.`;
  }
}

// ============ CHAT AI SIMULATION ============

const studentResponses: Record<string, string[]> = {
  default: [
    'Para realizar una búsqueda académica efectiva, te recomiendo usar términos MeSH y operadores booleanos (AND, OR, NOT). La combinación precisa de términos mejora la relevancia de los resultados.',
    'Recuerda que la pirámide de evidencia clasifica los estudios según su rigor metodológico. Las revisiones sistemáticas y metaanálisis están en la cima, seguidos por ensayos clínicos aleatorizados.',
    'Al evaluar una fuente, verifica: autoria con afiliación institucional, fecha de publicación reciente (idealmente <5 años), publicación en revista con peer review, y presencia de DOI.',
    'El formato APA 7ª edición requiere: Autor, A. A. (Año). Título del trabajo. Fuente. Para artículos: Autor, A. A. (Año). Título del artículo. Nombre de la Revista, volumen(número), páginas. https://doi.org/xxxxx',
  ],
  search: [
    'Para optimizar tu búsqueda, utiliza filtros por tipo de fuente. Las revisiones sistemáticas ofrecen el mayor nivel de evidencia, mientras que los artículos originales proporcionan datos primarios.',
    'Te sugiero combinar términos de búsqueda con operadores booleanos. Por ejemplo: "pneumonia AND (diagnosis OR diagnostic") AND (systematic review OR meta-analysis") para obtener resultados más precisos.',
  ],
  evidence: [
    'El nivel de evidencia 1 corresponde a revisiones sistemáticas y metaanálisis de ensayos clínicos aleatorizados. Son la fuente más confiable para tomar decisiones clínicas.',
    'Cuando evalúes la calidad de un ensayo clínico, revisa el método de aleatorización, el enmascaramiento (doble ciego), el tamaño de muestra y el seguimiento completo.',
  ],
  case: [
    'Para resolver este caso clínico, identifica primero la pregunta clínica usando el formato PICO: Paciente, Intervención, Comparación, Outcome.',
    'Al analizar un caso, busca primero guías de práctica clínica, luego revisiones sistemáticas, y finalmente estudios primarios. Esta estrategia sigue la pirámide de evidencia.',
  ],
  bibliography: [
    'Para generar una bibliografía en formato APA, asegúrate de incluir todos los campos obligatorios: autor, año, título y fuente. El DOI es obligatorio cuando está disponible.',
    'El formato Vancouver se usa principalmente en revistas médicas. La diferencia principal con APA es el estilo de citación: numérico vs autor-fecha.',
  ],
};

const professorResponses: Record<string, string[]> = {
  default: [
    'Para crear un caso clínico efectivo, defina claramente los objetivos de aprendizaje y los criterios de evaluación. Los casos deben reflejar escenarios clínicos reales.',
    'Al diseñar una rúbrica de evaluación, incluya criterios específicos y observables. Asigne pesos diferentes según la importancia de cada competencia.',
    'Recomiendo usar la taxonomía de Bloom para redactar los objetivos de aprendizaje. Verbos como "analizar", "evaluar" y "sintetizar" promueven pensamiento crítico.',
  ],
  case: [
    'Un buen caso clínico debe tener: presentación del paciente, datos clínicos relevantes, pregunta de investigación, y espacio para análisis. Incluya recursos sugeridos para guiar la búsqueda.',
    'Al asignar casos, considere el nivel de competencia de cada estudiante. Casos básicos para principiantes, avanzados para estudiantes con mayor progreso.',
  ],
  evaluation: [
    'Al evaluar una respuesta, use la rúbrica de manera consistente. Proporcione retroalimentación específica que el estudiante pueda usar para mejorar.',
    'Las evaluaciones formativas son más valiosas que las sumativas. Comente no solo qué falta, sino cómo mejorar la estrategia de búsqueda y análisis.',
  ],
};

const adminResponses: Record<string, string[]> = {
  default: [
    'El sistema se encuentra operativo. Puede consultar los detalles de salud en el panel de Health. Los servicios críticos están funcionando normalmente.',
    'Para gestionar usuarios eficientemente, use los filtros por rol y el buscador. Puede exportar la lista en CSV para análisis externos.',
    'Recomiendo revisar los logs de auditoría regularmente para identificar patrones de uso y posibles problemas de seguridad.',
  ],
  system: [
    'La configuración del sistema permite ajustar parámetros de seguridad, búsqueda y verificación. Los cambios se guardan inmediatamente.',
    'El modo mantenimiento debe activarse solo cuando sea necesario realizar cambios críticos. Esto bloqueará el acceso a todos los usuarios no administradores.',
  ],
  security: [
    'Para mejorar la seguridad, considere activar la autenticación de dos factores y reducir el tiempo de sesión. Puede configurar esto en Settings > Seguridad.',
    'Revise los intentos de acceso fallidos en los logs de auditoría. Un patrón de intentos fallidos puede indicar un problema de seguridad.',
  ],
};

export function getChatResponse(message: string, context: 'student' | 'professor' | 'admin'): string {
  const lower = message.toLowerCase();
  let responsePool: string[];

  switch (context) {
    case 'student': {
      if (lower.includes('buscar') || lower.includes('búsqueda') || lower.includes('search')) {
        responsePool = [...studentResponses.search, ...studentResponses.default];
      } else if (lower.includes('evidencia') || lower.includes('nivel') || lower.includes('pirámide')) {
        responsePool = [...studentResponses.evidence, ...studentResponses.default];
      } else if (lower.includes('caso') || lower.includes('clinical')) {
        responsePool = [...studentResponses.case, ...studentResponses.default];
      } else if (lower.includes('bibliograf') || lower.includes('apa') || lower.includes('vancouver')) {
        responsePool = [...studentResponses.bibliography, ...studentResponses.default];
      } else {
        responsePool = studentResponses.default;
      }
      break;
    }
    case 'professor': {
      if (lower.includes('caso') || lower.includes('create')) {
        responsePool = [...professorResponses.case, ...professorResponses.default];
      } else if (lower.includes('eval') || lower.includes('rúbrica') || lower.includes('rubric')) {
        responsePool = [...professorResponses.evaluation, ...professorResponses.default];
      } else {
        responsePool = professorResponses.default;
      }
      break;
    }
    case 'admin': {
      if (lower.includes('sistema') || lower.includes('config') || lower.includes('mantenimiento')) {
        responsePool = [...adminResponses.system, ...adminResponses.default];
      } else if (lower.includes('seguridad') || lower.includes('security') || lower.includes('log')) {
        responsePool = [...adminResponses.security, ...adminResponses.default];
      } else {
        responsePool = adminResponses.default;
      }
      break;
    }
  }

  return responsePool[Math.floor(Math.random() * responsePool.length)];
}

// ============ SOURCE VERIFICATION SIMULATION ============

export function simulateVerification(input: string, inputType: 'url' | 'title' | 'doi'): Omit<VerificationResult, 'id' | 'userId' | 'createdAt'> {
  const hasDoi = inputType === 'doi' || input.toLowerCase().includes('doi') || input.includes('10.');
  const hasUrl = inputType === 'url' || input.startsWith('http');
  const hasSpecialChars = /[^\w\s\-:/.@]/.test(input);
  const looksAcademic = input.toLowerCase().includes('journal') || input.toLowerCase().includes('revista') ||
    input.toLowerCase().includes('review') || input.toLowerCase().includes('clinical') ||
    input.toLowerCase().includes('systematic') || input.toLowerCase().includes('meta');

  const criteria: VerificationCriterion[] = [
    {
      name: 'Autoría verificable',
      passed: looksAcademic || hasDoi,
      weight: 20,
      detail: looksAcademic || hasDoi ? 'Se identifica autoría con afiliación institucional' : 'No se puede verificar la autoría de la fuente'
    },
    {
      name: 'Fecha de publicación',
      passed: !hasSpecialChars,
      weight: 15,
      detail: !hasSpecialChars ? 'La fuente tiene fecha de publicación identificable' : 'No se puede determinar la fecha de publicación'
    },
    {
      name: 'DOI o identificador',
      passed: hasDoi,
      weight: 20,
      detail: hasDoi ? 'La fuente cuenta con DOI verificado' : 'No se encontró DOI para esta fuente'
    },
    {
      name: 'Revista indexada',
      passed: looksAcademic,
      weight: 15,
      detail: looksAcademic ? 'Publicada en revista indexada en bases de datos reconocidas' : 'No se puede confirmar indexación en bases de datos'
    },
    {
      name: 'Institución respaldante',
      passed: looksAcademic || hasDoi,
      weight: 15,
      detail: (looksAcademic || hasDoi) ? 'Institución o universidad respalda la publicación' : 'No se identifica institución respaldante'
    },
    {
      name: 'Sesgo potencial',
      passed: !input.toLowerCase().includes('blog') && !input.toLowerCase().includes('opinión'),
      weight: 10,
      detail: !input.toLowerCase().includes('blog') ? 'Bajo riesgo de sesgo detectado' : 'Potencial sesgo: fuente de tipo blog u opinión'
    },
    {
      name: 'Nivel de evidencia',
      passed: looksAcademic && (hasDoi || hasUrl),
      weight: 5,
      detail: (looksAcademic && (hasDoi || hasUrl)) ? 'Fuente con nivel de evidencia apropiado' : 'Nivel de evidencia bajo o no determinable'
    },
  ];

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const passedWeight = criteria.filter(c => c.passed).reduce((sum, c) => sum + c.weight, 0);
  const overallScore = Math.round((passedWeight / totalWeight) * 100);

  const status: VerificationStatus = overallScore >= 70 ? 'reliable' : overallScore >= 40 ? 'caution' : 'unreliable';

  const recommendations: string[] = [];
  if (!hasDoi) recommendations.push('Buscar si la fuente tiene DOI asignado para mejorar su trazabilidad');
  if (!looksAcademic) recommendations.push('Verificar si existe una versión académica o revisada por pares de esta fuente');
  if (hasSpecialChars) recommendations.push('Verificar la URL o identificador - puede contener errores');
  if (!criteria.find(c => c.name === 'Sesgo potencial')?.passed) recommendations.push('Esta fuente puede tener sesgo - buscar fuentes complementarias');
  if (overallScore < 70) recommendations.push('Considerar buscar fuentes alternativas con mayor nivel de evidencia');
  if (overallScore >= 70) recommendations.push('Fuente confiable - puede ser utilizada como referencia académica');

  return { input, inputType, status, criteria, recommendations, overallScore };
}
