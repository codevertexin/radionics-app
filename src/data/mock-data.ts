// ============================================================
// RADIONICS Mock Data
// Phase 1 — No Supabase
// ============================================================

import type {
  Methodology, Tool, Client, Template, Session, Report,
  HawkinsLevel, ToolResult, SessionStage,
  Specialty, SpecialtyRequest, Certification, CertDocument, DocFileType,
} from '@/types';

// ─── HAWKINS SCALE ───────────────────────────────────────────
export const HAWKINS_LEVELS: HawkinsLevel[] = [
  { value: 20,  label: 'Vergonha',       description: 'Shame — Estado mais próximo da morte',         color: '#F8F8F8', bgColor: '#1A0A0A' },
  { value: 30,  label: 'Culpa',          description: 'Guilt — Autoagressão, destrutividade',          color: '#F0D0D0', bgColor: '#1E0B0B' },
  { value: 50,  label: 'Apatia',         description: 'Apathy — Desesperança e resignação',            color: '#B0A0B0', bgColor: '#1A1020' },
  { value: 75,  label: 'Luto',           description: 'Grief — Tristeza e perda',                      color: '#9090C0', bgColor: '#12122A' },
  { value: 100, label: 'Medo',           description: 'Fear — Ansiedade e retirada',                   color: '#8080D0', bgColor: '#0F1030' },
  { value: 125, label: 'Desejo',         description: 'Desire — Querer e adição',                      color: '#E07030', bgColor: '#2A1408' },
  { value: 150, label: 'Raiva',          description: 'Anger — Ódio e agressão',                       color: '#E03020', bgColor: '#2A0808' },
  { value: 175, label: 'Orgulho',        description: 'Pride — Arrogância e negação',                  color: '#E08030', bgColor: '#2A1800' },
  { value: 200, label: 'Coragem',        description: 'Courage — Affirmation e poder',                 color: '#3498DB', bgColor: '#0A1A2A' },
  { value: 250, label: 'Neutralidade',   description: 'Neutrality — Confiança e desapego',             color: '#27AE60', bgColor: '#0A1E10' },
  { value: 310, label: 'Vontade',        description: 'Willingness — Otimismo e intenção',             color: '#2ECC71', bgColor: '#0A2010' },
  { value: 350, label: 'Aceitação',      description: 'Acceptance — Perdão e harmonia',                color: '#1ABC9C', bgColor: '#081E18' },
  { value: 400, label: 'Razão',          description: 'Reason — Compreensão e clareza',                color: '#16A085', bgColor: '#061A14' },
  { value: 500, label: 'Amor',           description: 'Love — Revelação e benevolência',               color: '#F1C40F', bgColor: '#2A2000' },
  { value: 540, label: 'Alegria',        description: 'Joy — Transfiguração e serenidade',             color: '#F39C12', bgColor: '#2A1A00' },
  { value: 600, label: 'Paz',            description: 'Peace — Iluminação e perfeição',                color: '#ECF0F1', bgColor: '#1A1A2A' },
  { value: 700, label: 'Iluminação',     description: 'Enlightenment — Consciência pura',              color: '#FFFFFF', bgColor: '#0A0A1A' },
];

// ─── ESPECIALIDADES (formerly METHODOLOGIES) ─────────────────
// Internal key name kept as METHODOLOGIES for compatibility with sessions/templates.
// UI must always say "Especialidade(s)".
export const METHODOLOGIES: Methodology[] = [
  {
    id: 'meth-map',
    code: 'MAP',
    name: 'MAP',
    shortName: 'MAP',
    description: 'Método de Análise e Proteção. Especialidade radiônica completa para análise e harmonização energética profunda.',
    imageUrl: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=600&q=80',
    color: '#8B5CF6',
    requiresCertification: true,
    isActive: true,
    toolCount: 24,
    certificationStatus: 'approved',
  },
  {
    id: 'meth-rad35',
    code: 'RAD_35',
    name: 'Mesa dos 35 Gráficos Radiônicos',
    shortName: 'Mesa 35',
    description: 'Trabalho com 35 gráficos radiônicos para identificação e harmonização de padrões energéticos, emocionais e vibracionais.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    color: '#C9A84C',
    requiresCertification: true,
    isActive: true,
    toolCount: 35,
    certificationStatus: 'pending',
  },
  {
    id: 'meth-rad49',
    code: 'RAD_49',
    name: 'Mesa dos 49 Símbolos Angelicais',
    shortName: 'Mesa 49',
    description: 'Especialidade de trabalho com 49 símbolos angelicais para harmonização espiritual, proteção e elevação vibracional.',
    imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&q=80',
    color: '#4ECDC4',
    requiresCertification: true,
    isActive: true,
    toolCount: 49,
    certificationStatus: 'not_certified',
  },
  {
    // Requested specialty — not yet in the system, awaiting admin approval
    id: 'meth-floral',
    code: 'FLORAL',
    name: 'Terapia Floral',
    shortName: 'T. Floral',
    description: 'Terapia com florais de Bach e outros sistemas florais para reequilíbrio emocional e harmonização vibracional.',
    imageUrl: 'https://images.unsplash.com/photo-1490750967868-88df5691cc8f?w=600&q=80',
    color: '#F472B6',
    requiresCertification: true,
    isActive: false,
    toolCount: 0,
    certificationStatus: 'not_certified',
    isRequestedSpecialty: true,
    specialtyRequestStatus: 'pending_review',
  },
];

// ─── CERTIFICATION REQUESTS (therapist_methodology_certifications) ──────────
export interface CertRequest {
  id: string;
  methodologyId: string;
  methodologyCode: string;
  methodologyName: string;
  status: 'approved' | 'pending' | 'rejected' | 'expired';
  requestedAt: string;
  submittedAt?: string;          // submitted_at
  approvedAt?: string;
  rejectedAt?: string;
  expiredAt?: string;
  notes?: string;
  certificateNumber?: string;
  certifiedBy?: string;
  trainingInstitution?: string;  // training_institution
  trainingCompletedDate?: string; // training_completed_date
  yearsOfExperience?: number;    // years_of_experience (required at submission)
  experienceDescription?: string; // experience_description
  // Multiple certificate files per specialty
  certificateFiles?: CertificateFile[]; // maps to array of certificate attachments
  rejectionReason?: string;      // shown when status === 'rejected'
}

// CertificateFile — individual uploaded file attachment
export interface CertificateFile {
  id: string;
  fileName: string;     // certificate_file_name
  fileUrl: string;      // certificate_url (mock value)
  uploadedAt: string;   // submitted_at of this file
}

export const CERT_REQUESTS: CertRequest[] = [
  {
    // MAP — approved, 2 certificate files
    id: 'cert-001',
    methodologyId: 'meth-map',
    methodologyCode: 'MAP',
    methodologyName: 'MAP',
    status: 'approved',
    requestedAt: '2021-03-20T10:00:00Z',
    submittedAt: '2021-03-20T10:00:00Z',
    approvedAt: '2021-04-05T14:30:00Z',
    certificateNumber: 'MAP-2021-0347',
    certifiedBy: 'Instituto Radiônico Internacional',
    trainingInstitution: 'Instituto Radiônico Internacional',
    trainingCompletedDate: '2021-03-10',
    yearsOfExperience: 4,
    experienceDescription: 'Prática contínua desde 2021, com mais de 300 sessões realizadas.',
    notes: 'Certificação concluída com distinção. Formação presencial de 40h.',
    certificateFiles: [
      {
        id: 'cf-001',
        fileName: 'certificado_MAP_2021.pdf',
        fileUrl: 'mock://certifications/meth-map/certificado_MAP_2021.pdf',
        uploadedAt: '2021-03-20T10:00:00Z',
      },
      {
        id: 'cf-002',
        fileName: 'diploma_formacao_MAP.jpg',
        fileUrl: 'mock://certifications/meth-map/diploma_formacao_MAP.jpg',
        uploadedAt: '2021-03-20T10:05:00Z',
      },
    ],
  },
  {
    // Mesa 35 — pending, 1 certificate file
    id: 'cert-002',
    methodologyId: 'meth-rad35',
    methodologyCode: 'RAD_35',
    methodologyName: 'Mesa 35',
    status: 'pending',
    requestedAt: '2025-05-15T09:00:00Z',
    submittedAt: '2025-05-15T09:00:00Z',
    trainingInstitution: 'Escola de Radiônica do Porto',
    trainingCompletedDate: '2025-04-28',
    yearsOfExperience: 1,
    notes: 'Aguarda validação do certificado de conclusão do curso.',
    certificateFiles: [
      {
        id: 'cf-003',
        fileName: 'certificado_mesa35_2025.pdf',
        fileUrl: 'mock://certifications/meth-rad35/certificado_mesa35_2025.pdf',
        uploadedAt: '2025-05-15T09:00:00Z',
      },
    ],
  },
];

// ─── SPECIALTIES ─────────────────────────────────────────────
export const SPECIALTIES: Specialty[] = [
  {
    id: 'spec-map',
    name: 'MAP',
    slug: 'map',
    description: 'Metodologia de Alta Performance energética. Sistema radiônico de harmonização multidimensional.',
    category: 'Radiônica',
    requiresCertification: true,
    isActive: true,
    toolCount: 8,
    certificationStatus: 'approved',
  },
  {
    id: 'spec-rad35',
    name: 'Mesa 35',
    slug: 'mesa-35',
    description: 'Sistema de 35 gráficos radiônicos para harmonização energética profunda.',
    category: 'Radiônica',
    requiresCertification: true,
    isActive: true,
    toolCount: 8,
    certificationStatus: 'pending',
  },
  {
    id: 'spec-rad49',
    name: 'Mesa 49',
    slug: 'mesa-49',
    description: 'Sistema avançado de 49 gráficos com trabalho angélico e arquetípico.',
    category: 'Radiônica Avançada',
    requiresCertification: true,
    isActive: true,
    toolCount: 5,
    certificationStatus: 'not_certified',
  },
];

// ─── SPECIALTY REQUESTS ───────────────────────────────────────
export const SPECIALTY_REQUESTS: SpecialtyRequest[] = [
  {
    id: 'sreq-001',
    therapistId: 'therapist-001',
    proposedName: 'Terapia Floral de Bach',
    proposedSlug: 'terapia-floral-bach',
    description: 'Uso terapêutico dos florais de Bach para harmonização emocional e espiritual. Sistema desenvolvido pelo Dr. Edward Bach com 38 flores essenciais.',
    category: 'Terapias Florais',
    notes: 'Prática consolidada internacionalmente, com vasta literatura científica e centros de formação certificados em Portugal.',
    status: 'pending_review',
    submittedAt: '2025-05-20T09:30:00Z',
  },
];

// ─── CERTIFICATIONS ───────────────────────────────────────────
export const CERTIFICATIONS: Certification[] = [
  {
    id: 'cert-spec-001',
    therapistId: 'therapist-001',
    specialtyId: 'spec-map',
    status: 'approved',
    yearsOfExperience: 4,
    experienceDescription: 'Prática contínua desde 2021, com mais de 300 sessões realizadas.',
    trainingInstitution: 'Instituto Radiônico Internacional',
    trainingCompletedDate: '2021-03-10',
    certificateNumber: 'MAP-2021-0347',
    certifiedBy: 'Instituto Radiônico Internacional',
    notes: 'Certificação concluída com distinção. Formação presencial de 40h.',
    submittedAt: '2021-03-20T10:00:00Z',
    reviewedAt: '2021-04-05T14:30:00Z',
    expiresAt: '2026-04-05T00:00:00Z',
    documents: [
      {
        id: 'cdoc-001',
        certificationId: 'cert-spec-001',
        fileUrl: 'mock://certifications/spec-map/certificado_MAP_2021.pdf',
        fileName: 'certificado_MAP_2021.pdf',
        fileType: 'pdf',
        fileSize: 245000,
        uploadedAt: '2021-03-20T10:00:00Z',
      },
      {
        id: 'cdoc-002',
        certificationId: 'cert-spec-001',
        fileUrl: 'mock://certifications/spec-map/diploma_formacao_MAP.jpg',
        fileName: 'diploma_formacao_MAP.jpg',
        fileType: 'jpg',
        fileSize: 189000,
        uploadedAt: '2021-03-20T10:05:00Z',
      },
    ],
  },
  {
    id: 'cert-spec-002',
    therapistId: 'therapist-001',
    specialtyId: 'spec-rad35',
    status: 'approved',
    yearsOfExperience: 1,
    trainingInstitution: 'Escola de Radiônica do Porto',
    trainingCompletedDate: '2025-04-28',
    notes: 'Certificação Mesa 35 aprovada.',
    submittedAt: '2025-05-15T09:00:00Z',
    reviewedAt: '2025-05-20T10:00:00Z',
    documents: [
      {
        id: 'cdoc-003',
        certificationId: 'cert-spec-002',
        fileUrl: 'mock://certifications/spec-rad35/certificado_mesa35_2025.pdf',
        fileName: 'certificado_mesa35_2025.pdf',
        fileType: 'pdf',
        fileSize: 312000,
        uploadedAt: '2025-05-15T09:00:00Z',
      },
    ],
  },
  {
    id: 'cert-spec-003',
    therapistId: 'therapist-001',
    specialtyId: 'spec-rad49',
    status: 'approved',
    yearsOfExperience: 2,
    trainingInstitution: 'Escola de Radiônica do Porto',
    trainingCompletedDate: '2024-06-15',
    notes: 'Certificação Mesa 49 — símbolos angelicais.',
    submittedAt: '2024-07-01T09:00:00Z',
    reviewedAt: '2024-07-10T14:00:00Z',
    documents: [],
  },
];

// ─── TOOLS (Mesa 35) ────────────────────────────────────────
export const TOOLS_RAD35: Tool[] = [
  { id: 't35-01', code: 'anti_magia',       name: 'Anti Magia',          description: 'Proteção contra interferências mágicas e energéticas negativas externas.', whatItDoes: 'Neutraliza e dissolve influências mágicas, feitiços e trabalhos energéticos negativos direcionados ao cliente.', example: 'Cliente com bloqueios inexplicáveis em múltiplas áreas da vida.', suggestedActivation: 'Ativar com intenção clara de proteção e dissolução.', imageUrl: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=400&q=80', methodologyId: 'meth-rad35', sortOrder: 1 },
  { id: 't35-02', code: 'luxor',             name: 'Luxor',               description: 'Reforço energético e reorganização vibracional de alta frequência.', whatItDoes: 'Eleva o campo vibracional do cliente, promovendo reequilíbrio energético profundo.', example: 'Cliente com baixa energia persistente e dificuldade de recuperação.', suggestedActivation: 'Aplicar com visualização de luz dourada.', imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80', methodologyId: 'meth-rad35', sortOrder: 2 },
  { id: 't35-03', code: 'anti_possessao',    name: 'Anti Possessão',      description: 'Libertação de entidades e influências externas no campo energético.', whatItDoes: 'Identifica e remove presenças energéticas negativas que interferem com a autonomia do cliente.', example: 'Mudanças súbitas de personalidade ou comportamento inexplicável.', suggestedActivation: 'Ativar em sequência com Anti Magia quando necessário.', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', methodologyId: 'meth-rad35', sortOrder: 3 },
  { id: 't35-04', code: 'desobsessao',       name: 'Desobsessão',         description: 'Libertação de padrões obsessivos e pensamentos repetitivos limitantes.', whatItDoes: 'Dissolve padrões mentais e emocionais que aprisionam o cliente em ciclos repetitivos.', example: 'Pensamentos obsessivos, medos repetitivos, padrões relacionais destrutivos.', suggestedActivation: 'Combinado com trabalho emocional.', imageUrl: 'https://images.unsplash.com/photo-1513001900722-370f803f498d?w=400&q=80', methodologyId: 'meth-rad35', sortOrder: 4 },
  { id: 't35-05', code: 'prosperidade',      name: 'Prosperidade',        description: 'Abertura de fluxos de abundância e desbloqueio de padrões limitantes financeiros.', whatItDoes: 'Harmoniza o campo energético para receber e manifestar abundância em todas as dimensões.', example: 'Bloqueios financeiros recorrentes, dificuldade em avançar profissionalmente.', suggestedActivation: 'Ativar com gratidão e abertura.', imageUrl: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=400&q=80', methodologyId: 'meth-rad35', sortOrder: 5 },
  { id: 't35-06', code: 'amor',              name: 'Amor',                description: 'Abertura e harmonização do centro cardíaco e das relações afetivas.', whatItDoes: 'Dissolve barreiras emocionais que impedem a conexão e o amor próprio e pelos outros.', example: 'Dificuldades nos relacionamentos, isolamento afetivo.', suggestedActivation: 'Intenção de abertura e receptividade.', imageUrl: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400&q=80', methodologyId: 'meth-rad35', sortOrder: 6 },
  { id: 't35-07', code: 'saude',             name: 'Saúde',               description: 'Harmonização do campo energético associado à saúde física e vitalidade.', whatItDoes: 'Suporte energético ao sistema imune e aos processos naturais de cura do organismo.', example: 'Fadiga crónica, recuperação lenta, baixa vitalidade.', suggestedActivation: 'Combinado com hidratação e repouso recomendados.', imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80', methodologyId: 'meth-rad35', sortOrder: 7 },
  { id: 't35-08', code: 'karma',             name: 'Karma',               description: 'Dissolução de padrões kármicos e libertação de contratos energéticos de vidas passadas.', whatItDoes: 'Trabalho com padrões repetitivos que transcendem a vida atual, libertando o cliente de ciclos kármicos.', example: 'Padrões que se repetem de forma inexplicável através de gerações.', suggestedActivation: 'Intenção clara de libertação e perdão.', imageUrl: 'https://images.unsplash.com/photo-1446329813274-7c9036bd9a1f?w=400&q=80', methodologyId: 'meth-rad35', sortOrder: 8 },
];

// ─── TOOLS (Mesa 49) ────────────────────────────────────────
export const TOOLS_RAD49: Tool[] = [
  { id: 't49-01', code: 'anjo_miguel',      name: 'Arcanjo Miguel',      description: 'Proteção divina e força espiritual.', whatItDoes: 'Proteção energética de alta frequência e corte de laços negativos.', example: 'Situações de vulnerabilidade espiritual.', suggestedActivation: 'Invocação com intenção de proteção.', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', methodologyId: 'meth-rad49', sortOrder: 1 },
  { id: 't49-02', code: 'anjo_rafael',      name: 'Arcanjo Rafael',      description: 'Cura e restauração energética.', whatItDoes: 'Canalização de energia de cura para o campo físico, emocional e espiritual.', example: 'Processos de recuperação e cura.', suggestedActivation: 'Intenção de cura e restauração.', imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80', methodologyId: 'meth-rad49', sortOrder: 2 },
  { id: 't49-03', code: 'anjo_gabriel',     name: 'Arcanjo Gabriel',     description: 'Comunicação e revelação divina.', whatItDoes: 'Abertura de canais de comunicação e clareza na receção de orientação espiritual.', example: 'Confusão e falta de clareza no caminho.', suggestedActivation: 'Silêncio interior e receptividade.', imageUrl: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=400&q=80', methodologyId: 'meth-rad49', sortOrder: 3 },
  { id: 't49-04', code: 'anjo_uriel',       name: 'Arcanjo Uriel',       description: 'Sabedoria e luz divina.', whatItDoes: 'Iluminação de situações complexas e apoio na tomada de decisões.', example: 'Decisões importantes e encruzilhadas de vida.', suggestedActivation: 'Intenção de clareza e sabedoria.', imageUrl: 'https://images.unsplash.com/photo-1446329813274-7c9036bd9a1f?w=400&q=80', methodologyId: 'meth-rad49', sortOrder: 4 },
  { id: 't49-05', code: 'anjo_metatron',    name: 'Arcanjo Metatron',    description: 'Transformação e ascensão espiritual.', whatItDoes: 'Apoio em processos de transformação profunda e elevação da consciência.', example: 'Momentos de grande transformação de vida.', suggestedActivation: 'Abertura total à transformação.', imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80', methodologyId: 'meth-rad49', sortOrder: 5 },
];

// ─── CLIENTS ─────────────────────────────────────────────────
export const CLIENTS: Client[] = [
  {
    id: 'client-001',
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    whatsapp: '+351 912 345 678',
    clientType: 'hub_user',
    birthDate: '1985-03-15',
    notes: 'Cliente assídua. Foco principal em equilíbrio emocional e profissional.',
    createdAt: '2024-01-10',
    lastSessionDate: '2025-05-20',
    sessionCount: 8,
  },
  {
    id: 'client-002',
    name: 'João Ferreira',
    email: 'joao.ferreira@gmail.com',
    whatsapp: '+351 923 456 789',
    clientType: 'contact_with_email',
    birthDate: '1979-07-22',
    notes: 'Trabalho recorrente com padrões kármicos e relações familiares.',
    createdAt: '2024-03-05',
    lastSessionDate: '2025-05-15',
    sessionCount: 4,
  },
  {
    id: 'client-003',
    name: 'Ana Rodrigues',
    whatsapp: '+351 934 567 890',
    telegram: '@anarod',
    clientType: 'contact_only',
    notes: 'Prefere contacto via Telegram. Questões de saúde e vitalidade.',
    createdAt: '2024-06-12',
    lastSessionDate: '2025-05-28',
    sessionCount: 2,
  },
  {
    id: 'client-004',
    name: 'Pedro Santos',
    email: 'pedro@businessmail.com',
    whatsapp: '+351 945 678 901',
    clientType: 'contact_with_email',
    birthDate: '1990-11-08',
    createdAt: '2025-01-20',
    lastSessionDate: '2025-05-22',
    sessionCount: 3,
  },
  {
    id: 'client-005',
    name: 'Sofia Martins',
    email: 'sofia.martins@email.pt',
    clientType: 'hub_user',
    birthDate: '1993-05-30',
    notes: 'Cliente muito sensível. Trabalho com proteção energética.',
    createdAt: '2025-02-14',
    lastSessionDate: '2025-05-18',
    sessionCount: 5,
  },
  {
    id: 'client-006',
    name: 'Carlos Oliveira',
    whatsapp: '+351 956 789 012',
    clientType: 'contact_only',
    notes: 'Sessão à distância. Não tem email.',
    createdAt: '2025-03-01',
    sessionCount: 1,
  },
];

// ─── TEMPLATES ───────────────────────────────────────────────
export const TEMPLATES: Template[] = [
  {
    id: 'tmpl-map-official',
    name: 'MAP — Template Oficial',
    description: 'Template oficial MAP. Identificação, intenção, diagnóstico e encerramento.',
    methodologyId: 'meth-map',
    methodologyName: 'MAP',
    specialtySlugs: ['map'],
    specialtyIds: ['spec-map'],
    isBaseTemplate: true,
    templateType: 'official',
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    blocks: [
      { id: 'blk-map-01', blockCode: 'client_id', stageCode: 'preparation', title: 'Identificação do Cliente', orderIndex: 0, isRequired: true, showInSession: true, showInReport: true, showInHub: true, isPrivate: false, fields: [
        { id: 'fld-map-01', fieldCode: 'full_name', label: 'Nome Completo', fieldType: 'short_text', orderIndex: 0, isRequired: true, placeholder: 'Nome completo do cliente' },
        { id: 'fld-map-02', fieldCode: 'birth_date', label: 'Data de Nascimento', fieldType: 'date', orderIndex: 1, isRequired: false },
      ]},
      { id: 'blk-map-02', blockCode: 'session_intent', stageCode: 'preparation', title: 'Objetivo da Sessão', orderIndex: 1, isRequired: true, showInSession: true, showInReport: true, showInHub: true, isPrivate: false, fields: [
        { id: 'fld-map-03', fieldCode: 'intention', label: 'Intenção Terapêutica', fieldType: 'long_text', orderIndex: 0, isRequired: true, placeholder: 'Descreva o objetivo principal desta sessão MAP...' },
      ]},
      { id: 'blk-map-03', blockCode: 'map_analysis', stageCode: 'diagnosis', title: 'Análise MAP', orderIndex: 2, isRequired: false, showInSession: true, showInReport: true, showInHub: false, isPrivate: false, fields: [
        { id: 'fld-map-04', fieldCode: 'analysis_notes', label: 'Notas de Análise', fieldType: 'long_text', orderIndex: 0, isRequired: false, placeholder: 'Observações do diagnóstico energético...' },
      ]},
      { id: 'blk-map-04', blockCode: 'recommendations', stageCode: 'closing', title: 'Recomendações', orderIndex: 3, isRequired: false, showInSession: true, showInReport: true, showInHub: true, isPrivate: false, fields: [
        { id: 'fld-map-05', fieldCode: 'recommendations', label: 'Recomendações', fieldType: 'long_text', orderIndex: 0, isRequired: false },
        { id: 'fld-map-06', fieldCode: 'reverberation_days', label: 'Dias de Reverberação', fieldType: 'number', orderIndex: 1, isRequired: false, placeholder: '21' },
      ]},
    ],
  },
  {
    id: 'tmpl-rad35-official',
    name: 'Mesa 35 — Template Oficial',
    description: 'Template oficial da Mesa dos 35 Gráficos Radiônicos. Inclui todos os blocos recomendados.',
    methodologyId: 'meth-rad35',
    methodologyName: 'Mesa dos 35 Gráficos Radiônicos',
    specialtySlugs: ['mesa-35'],
    specialtyIds: ['spec-rad35'],
    isBaseTemplate: true,
    templateType: 'official',
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    blocks: [
      { id: 'blk-01', blockCode: 'client_id', stageCode: 'preparation', title: 'Identificação do Cliente', description: 'Dados de identificação do cliente', orderIndex: 0, isRequired: true, showInSession: true, showInReport: true, showInHub: true, isPrivate: false, fields: [
        { id: 'fld-01', fieldCode: 'full_name', label: 'Nome Completo', fieldType: 'short_text', orderIndex: 0, isRequired: true, placeholder: 'Nome completo do cliente' },
        { id: 'fld-02', fieldCode: 'birth_date', label: 'Data de Nascimento', fieldType: 'date', orderIndex: 1, isRequired: false },
        { id: 'fld-03', fieldCode: 'location', label: 'Localização Atual', fieldType: 'short_text', orderIndex: 2, isRequired: false, placeholder: 'Cidade, País' },
      ]},
      { id: 'blk-02', blockCode: 'session_intent', stageCode: 'preparation', title: 'Objetivo da Sessão', orderIndex: 1, isRequired: true, showInSession: true, showInReport: true, showInHub: true, isPrivate: false, fields: [
        { id: 'fld-04', fieldCode: 'intention', label: 'Intenção Terapêutica', fieldType: 'long_text', orderIndex: 0, isRequired: true, placeholder: 'Descreva o objetivo principal desta sessão...' },
      ]},
      { id: 'blk-03', blockCode: 'hawkins', stageCode: 'diagnosis', title: 'Escala de Hawkins', orderIndex: 2, isRequired: false, showInSession: true, showInReport: true, showInHub: false, isPrivate: false, fields: [
        { id: 'fld-05', fieldCode: 'hawkins_initial', label: 'Nível Inicial', fieldType: 'hawkins_selector', orderIndex: 0, isRequired: false },
        { id: 'fld-06', fieldCode: 'hawkins_final', label: 'Nível Final', fieldType: 'hawkins_selector', orderIndex: 1, isRequired: false },
      ]},
      { id: 'blk-04', blockCode: 'graphics', stageCode: 'diagnosis', title: 'Gráficos Identificados', orderIndex: 3, isRequired: false, showInSession: true, showInReport: true, showInHub: false, isPrivate: false, fields: [
        { id: 'fld-07', fieldCode: 'selected_tools', label: 'Gráficos', fieldType: 'tool_selector', orderIndex: 0, isRequired: false },
      ]},
      { id: 'blk-05', blockCode: 'interpretation', stageCode: 'closing', title: 'Interpretação Final', orderIndex: 4, isRequired: false, showInSession: true, showInReport: true, showInHub: true, isPrivate: false, fields: [
        { id: 'fld-08', fieldCode: 'interpretation', label: 'Interpretação do Terapeuta', fieldType: 'long_text', orderIndex: 0, isRequired: false, placeholder: 'Interpretação e observações finais...' },
      ]},
      { id: 'blk-06', blockCode: 'recommendations', stageCode: 'closing', title: 'Recomendações', orderIndex: 5, isRequired: false, showInSession: true, showInReport: true, showInHub: true, isPrivate: false, fields: [
        { id: 'fld-09', fieldCode: 'recommendations', label: 'Recomendações', fieldType: 'long_text', orderIndex: 0, isRequired: false, placeholder: 'Hidratação, meditação, observações...' },
        { id: 'fld-10', fieldCode: 'reverberation_days', label: 'Dias de Reverberação', fieldType: 'number', orderIndex: 1, isRequired: false, placeholder: '21' },
      ]},
      { id: 'blk-07', blockCode: 'private_notes', stageCode: 'closing', title: 'Notas Privadas', description: 'Notas apenas visíveis para o terapeuta', orderIndex: 6, isRequired: false, showInSession: true, showInReport: false, showInHub: false, isPrivate: true, fields: [
        { id: 'fld-11', fieldCode: 'private_notes', label: 'Notas do Terapeuta', fieldType: 'long_text', orderIndex: 0, isRequired: false, placeholder: 'Observações internas...' },
      ]},
    ],
  },
  {
    id: 'tmpl-rad49-official',
    name: 'Mesa 49 — Template Oficial',
    description: 'Template oficial da Mesa dos 49 Símbolos Angelicais.',
    methodologyId: 'meth-rad49',
    methodologyName: 'Mesa dos 49 Símbolos Angelicais',
    specialtySlugs: ['mesa-49'],
    specialtyIds: ['spec-rad49'],
    isBaseTemplate: true,
    templateType: 'official',
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    blocks: [
      { id: 'blk-49-01', blockCode: 'client_id', stageCode: 'preparation', title: 'Identificação do Cliente', orderIndex: 0, isRequired: true, showInSession: true, showInReport: true, showInHub: true, isPrivate: false, fields: [
        { id: 'fld-49-01', fieldCode: 'full_name', label: 'Nome Completo', fieldType: 'short_text', orderIndex: 0, isRequired: true },
      ]},
      { id: 'blk-49-02', blockCode: 'session_intent', stageCode: 'preparation', title: 'Intenção Espiritual', orderIndex: 1, isRequired: true, showInSession: true, showInReport: true, showInHub: true, isPrivate: false, fields: [
        { id: 'fld-49-02', fieldCode: 'intention', label: 'Intenção da Sessão', fieldType: 'long_text', orderIndex: 0, isRequired: true },
      ]},
      { id: 'blk-49-03', blockCode: 'symbols', stageCode: 'diagnosis', title: 'Símbolos Identificados', orderIndex: 2, isRequired: false, showInSession: true, showInReport: true, showInHub: false, isPrivate: false, fields: [
        { id: 'fld-49-03', fieldCode: 'selected_tools', label: 'Símbolos', fieldType: 'tool_selector', orderIndex: 0, isRequired: false },
      ]},
    ],
  },
  {
    id: 'tmpl-rad35-express',
    name: 'Mesa 35 — Sessão Express',
    description: 'Template simplificado para sessões mais rápidas. Foco nos gráficos e recomendações essenciais.',
    methodologyId: 'meth-rad35',
    methodologyName: 'Mesa dos 35 Gráficos Radiônicos',
    specialtySlugs: ['mesa-35'],
    specialtyIds: ['spec-rad35'],
    isBaseTemplate: false,
    templateType: 'custom',
    status: 'active',
    createdAt: '2024-06-15',
    updatedAt: '2025-01-10',
    blocks: [
      { id: 'blk-ex-01', blockCode: 'client_id', stageCode: 'preparation', title: 'Identificação', orderIndex: 0, isRequired: true, showInSession: true, showInReport: true, showInHub: true, isPrivate: false, fields: [
        { id: 'fld-ex-01', fieldCode: 'full_name', label: 'Nome', fieldType: 'short_text', orderIndex: 0, isRequired: true },
      ]},
      { id: 'blk-ex-02', blockCode: 'graphics', stageCode: 'diagnosis', title: 'Gráficos', orderIndex: 1, isRequired: false, showInSession: true, showInReport: true, showInHub: false, isPrivate: false, fields: [
        { id: 'fld-ex-02', fieldCode: 'selected_tools', label: 'Gráficos Identificados', fieldType: 'tool_selector', orderIndex: 0, isRequired: false },
      ]},
      { id: 'blk-ex-03', blockCode: 'recommendations', stageCode: 'closing', title: 'Recomendações', orderIndex: 2, isRequired: false, showInSession: true, showInReport: true, showInHub: true, isPrivate: false, fields: [
        { id: 'fld-ex-03', fieldCode: 'recommendations', label: 'Recomendações', fieldType: 'long_text', orderIndex: 0, isRequired: false },
      ]},
    ],
  },
];

// ─── SESSIONS ────────────────────────────────────────────────
const buildRad35Session = (overrides: Partial<Session>): Session => ({
  id: overrides.id ?? 'sess-001',
  clientId: 'client-001',
  clientName: 'Maria Silva',
  therapistId: 'therapist-001',
  specialtyId: 'spec-rad35',
  specialtyName: 'Mesa dos 35 Gráficos',
  specialtySlug: 'mesa-35',
  methodologyId: 'meth-rad35',
  methodologyName: 'Mesa dos 35 Gráficos',
  methodologyCode: 'RAD_35',
  templateId: 'tmpl-rad35-official',
  templateName: 'Mesa 35 — Template Oficial',
  status: 'in_progress',
  sessionMode: 'distance',
  intention: 'Equilíbrio emocional e libertação de bloqueios associados ao contexto profissional.',
  hawkinsInitial: 150,
  currentStageCode: 'diagnosis',
  currentStepCode: 'select_graphics',
  createdAt: '2025-05-30T09:00:00Z',
  updatedAt: '2025-05-30T09:45:00Z',
  scheduledAt: '2025-05-30T09:00:00Z',
  stages: [
    {
      code: 'preparation', label: 'Preparação', status: 'completed',
      steps: [
        { code: 'setup_testimony', label: 'Preparação do Testemunho', type: 'information', status: 'completed', notes: 'Testemunho preparado com fotografia e dados do cliente.' },
        { code: 'opening_prayer', label: 'Oração de Abertura', type: 'activation', status: 'completed' },
      ]
    },
    {
      code: 'connection', label: 'Conexão', status: 'completed',
      steps: [
        { code: 'activate_table', label: 'Ativar Mesa', type: 'activation', status: 'completed', notes: 'Mesa ativada. Resposta imediata.' },
        { code: 'client_connection', label: 'Conexão com o Cliente', type: 'activation', status: 'completed' },
      ]
    },
    {
      code: 'diagnosis', label: 'Diagnóstico', status: 'in_progress',
      steps: [
        {
          code: 'hawkins_initial', label: 'Hawkins Inicial', type: 'input', status: 'completed',
          notes: 'Percebe-se forte frustração relacionada com ambiente profissional e sensação de injustiça.'
        },
        {
          code: 'select_graphics', label: 'Selecionar Gráficos', type: 'options', status: 'in_progress',
          selectedTools: ['t35-01', 't35-02', 't35-05'],
          toolResults: [
            { toolId: 't35-01', toolName: 'Anti Magia', toolImageUrl: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=400&q=80', status: 'identified', notes: 'Identificada influência energética externa.' },
            { toolId: 't35-02', toolName: 'Luxor', toolImageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80', status: 'identified' },
            { toolId: 't35-05', toolName: 'Prosperidade', toolImageUrl: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=400&q=80', status: 'in_analysis' },
          ]
        },
      ]
    },
    {
      code: 'activations', label: 'Ativações', status: 'not_started',
      steps: []
    },
    {
      code: 'closing', label: 'Encerramento', status: 'not_started',
      steps: [
        { code: 'hawkins_final', label: 'Hawkins Final', type: 'input', status: 'not_started' },
        { code: 'reverberation', label: 'Reverberação', type: 'input', status: 'not_started' },
        { code: 'closing_prayer', label: 'Oração de Encerramento', type: 'activation', status: 'not_started' },
      ]
    },
  ],
  ...overrides,
});

export const SESSIONS: Session[] = [
  buildRad35Session({ id: 'sess-001', status: 'in_progress', scheduledAt: '2025-05-30T09:00:00Z' }),
  buildRad35Session({
    id: 'sess-002',
    clientId: 'client-002',
    clientName: 'João Ferreira',
    status: 'paused',
    intention: 'Trabalho com padrões kármicos familiares e libertação de heranças emocionais.',
    hawkinsInitial: 100,
    scheduledAt: '2025-05-30T11:00:00Z',
    updatedAt: '2025-05-29T14:30:00Z',
    currentStageCode: 'diagnosis',
    stages: [
      { code: 'preparation', label: 'Preparação', status: 'completed', steps: [] },
      { code: 'connection', label: 'Conexão', status: 'completed', steps: [] },
      { code: 'diagnosis', label: 'Diagnóstico', status: 'in_progress', steps: [] },
      { code: 'activations', label: 'Ativações', status: 'not_started', steps: [] },
      { code: 'closing', label: 'Encerramento', status: 'not_started', steps: [] },
    ],
  }),
  {
    id: 'sess-003',
    clientId: 'client-003',
    clientName: 'Ana Rodrigues',
    therapistId: 'therapist-001',
    specialtyId: 'spec-rad49',
    specialtyName: 'Mesa dos 49 Símbolos Angelicais',
    specialtySlug: 'mesa-49',
    methodologyId: 'meth-rad49',
    methodologyName: 'Mesa dos 49 Símbolos',
    methodologyCode: 'RAD_49',
    templateId: 'tmpl-rad49-official',
    templateName: 'Mesa 49 — Template Oficial',
    status: 'completed',
    sessionMode: 'distance',
    intention: 'Proteção espiritual e abertura de caminhos.',
    hawkinsInitial: 175,
    hawkinsFinal: 350,
    reverberationDays: 14,
    currentStageCode: 'closing',
    createdAt: '2025-05-28T10:00:00Z',
    updatedAt: '2025-05-28T12:00:00Z',
    scheduledAt: '2025-05-28T10:00:00Z',
    completedAt: '2025-05-28T12:00:00Z',
    stages: [],
  },
  buildRad35Session({
    id: 'sess-004',
    clientId: 'client-004',
    clientName: 'Pedro Santos',
    status: 'draft',
    intention: 'Alinhamento profissional e clareza de propósito.',
    scheduledAt: '2025-05-30T14:00:00Z',
    currentStageCode: undefined,
    stages: [
      { code: 'preparation', label: 'Preparação', status: 'not_started', steps: [] },
      { code: 'connection', label: 'Conexão', status: 'not_started', steps: [] },
      { code: 'diagnosis', label: 'Diagnóstico', status: 'not_started', steps: [] },
      { code: 'activations', label: 'Ativações', status: 'not_started', steps: [] },
      { code: 'closing', label: 'Encerramento', status: 'not_started', steps: [] },
    ],
  }),
  buildRad35Session({
    id: 'sess-005',
    clientId: 'client-005',
    clientName: 'Sofia Martins',
    status: 'reported',
    intention: 'Harmonização energética e proteção.',
    hawkinsInitial: 125,
    hawkinsFinal: 310,
    reverberationDays: 21,
    scheduledAt: '2025-05-22T09:00:00Z',
    completedAt: '2025-05-22T11:00:00Z',
    stages: [],
  }),
];

// ─── REPORTS ─────────────────────────────────────────────────
export const REPORTS: Report[] = [
  {
    id: 'rep-001',
    sessionId: 'sess-005',
    clientId: 'client-005',
    clientName: 'Sofia Martins',
    methodologyName: 'Mesa dos 35 Gráficos',
    methodologyCode: 'RAD_35',
    therapistId: 'therapist-001',
    status: 'shared',
    sessionDate: '2025-05-22',
    intention: 'Harmonização energética e proteção.',
    summary: 'Sessão de harmonização energética realizada com sucesso. Identificados e ativados gráficos de proteção e equilíbrio vibracional.',
    hawkinsInitial: 125,
    hawkinsFinal: 310,
    toolsIdentified: ['Anti Magia', 'Luxor', 'Karma'],
    toolsActivated: ['Anti Magia', 'Luxor'],
    interpretations: [
      'Identificada necessidade de proteção energética devido a ambiente externo desafiante.',
      'Campo vibracional apresentou resposta positiva às ativações realizadas.',
      'Padrão kármico relacionado com relacionamentos identificado para trabalho futuro.',
    ],
    recommendations: [
      'Hidratação reforçada nos próximos 21 dias',
      'Meditação diária de 10 minutos',
      'Observação de padrões relacionais',
    ],
    reverberationDays: 21,
    nextSteps: 'Nova sessão após o período de reverberação para acompanhar estabilização.',
    createdAt: '2025-05-22T12:00:00Z',
    approvedAt: '2025-05-22T14:00:00Z',
    sharedAt: '2025-05-22T14:30:00Z',
  },
  {
    id: 'rep-002',
    sessionId: 'sess-003',
    clientId: 'client-003',
    clientName: 'Ana Rodrigues',
    methodologyName: 'Mesa dos 49 Símbolos',
    methodologyCode: 'RAD_49',
    therapistId: 'therapist-001',
    status: 'approved',
    sessionDate: '2025-05-28',
    intention: 'Proteção espiritual e abertura de caminhos.',
    summary: 'Trabalho angelical realizado com profundidade. Múltiplos símbolos identificados para proteção e orientação.',
    hawkinsInitial: 175,
    hawkinsFinal: 350,
    toolsIdentified: ['Arcanjo Miguel', 'Arcanjo Rafael', 'Arcanjo Uriel'],
    toolsActivated: ['Arcanjo Miguel', 'Arcanjo Rafael', 'Arcanjo Uriel'],
    interpretations: [
      'Campo espiritual aberto e receptivo.',
      'Proteção angelical reforçada após intervenção.',
    ],
    recommendations: ['Oração diária', 'Leitura espiritual'],
    reverberationDays: 14,
    createdAt: '2025-05-28T13:00:00Z',
    approvedAt: '2025-05-28T15:00:00Z',
  },
  {
    id: 'rep-003',
    sessionId: 'sess-001',
    clientId: 'client-001',
    clientName: 'Maria Silva',
    methodologyName: 'Mesa dos 35 Gráficos',
    methodologyCode: 'RAD_35',
    therapistId: 'therapist-001',
    status: 'draft',
    sessionDate: '2025-05-30',
    intention: 'Equilíbrio emocional e libertação de bloqueios profissionais.',
    toolsIdentified: ['Anti Magia', 'Luxor', 'Prosperidade'],
    toolsActivated: [],
    interpretations: [],
    recommendations: [],
    createdAt: '2025-05-30T09:00:00Z',
  },
  {
    id: 'rep-004',
    sessionId: 'sess-002',
    clientId: 'client-002',
    clientName: 'João Ferreira',
    methodologyName: 'Mesa dos 35 Gráficos',
    methodologyCode: 'RAD_35',
    therapistId: 'therapist-001',
    status: 'in_review',
    sessionDate: '2025-05-29',
    intention: 'Trabalho com padrões kármicos familiares.',
    toolsIdentified: ['Karma', 'Amor', 'Desobsessão'],
    toolsActivated: ['Karma', 'Amor'],
    interpretations: ['Padrão repetitivo identificado na linhagem paterna.'],
    recommendations: ['Perdão ativo', 'Diário emocional'],
    reverberationDays: 21,
    createdAt: '2025-05-29T16:00:00Z',
  },
];

// ─── DASHBOARD DATA ───────────────────────────────────────────
export const getDashboardData = () => ({
  sessionsInProgress: SESSIONS.filter(s => s.status === 'in_progress' || s.status === 'paused'),
  sessionsToday: SESSIONS.filter(s => s.scheduledAt?.startsWith('2025-05-30')),
  pendingReports: REPORTS.filter(r => r.status === 'draft' || r.status === 'in_review'),
  recentClients: CLIENTS.slice(0, 4),
});

// ─── HELPERS ─────────────────────────────────────────────────
export const getSessionById = (id: string) => SESSIONS.find(s => s.id === id);
export const getClientById = (id: string) => CLIENTS.find(c => c.id === id);
export const getMethodologyById = (id: string) => METHODOLOGIES.find(m => m.id === id);
export const getTemplateById = (id: string) => TEMPLATES.find(t => t.id === id);
export const getReportById = (id: string) => REPORTS.find(r => r.id === id);
export const getHawkinsLevel = (value: number) => HAWKINS_LEVELS.find(h => h.value === value) || HAWKINS_LEVELS.find(h => h.value <= value && value < (HAWKINS_LEVELS[HAWKINS_LEVELS.indexOf(HAWKINS_LEVELS.find(h2 => h2.value <= value)!) + 1]?.value ?? 999));
export const getToolsByMethodology = (methodologyId: string) => {
  if (methodologyId === 'meth-rad35') return TOOLS_RAD35;
  if (methodologyId === 'meth-rad49') return TOOLS_RAD49;
  return [];
};

// ─── SESSION SNAPSHOTS ───────────────────────────────────────
import type { SessionSnapshot, ReportV2, ReportSection, VoiceNote } from '@/types';

export const SESSION_SNAPSHOTS: SessionSnapshot[] = [
  {
    session_id: 'sess-005',
    client_id: 'client-005',
    client_name: 'Sofia Martins',
    client_email: 'sofia.martins@email.pt',
    client_type: 'hub_user',
    methodology_name: 'Mesa dos 35 Gráficos',
    methodology_code: 'RAD_35',
    session_date: '2025-05-22',
    intention: 'Harmonização energética e proteção.',
    hawkins_initial: 125,
    hawkins_final: 310,
    reverberation_days: 21,
    tool_results: [
      { toolId: 't35-01', toolName: 'Anti Magia', toolImageUrl: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=400&q=80', status: 'activated', notes: 'Identificada influência energética externa. Neutralizada com sucesso.' },
      { toolId: 't35-02', toolName: 'Luxor', toolImageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80', status: 'activated', notes: 'Reforço vibracional aplicado.' },
      { toolId: 't35-08', toolName: 'Karma', toolImageUrl: 'https://images.unsplash.com/photo-1446329813274-7c9036bd9a1f?w=400&q=80', status: 'identified', notes: 'Padrão kármico identificado para trabalho futuro.' },
    ],
    identified_tool_names: ['Anti Magia', 'Luxor', 'Karma'],
    activated_tool_names: ['Anti Magia', 'Luxor'],
    therapist_notes: 'Cliente apresentou sensibilidade elevada durante a sessão. Resposta positiva às ativações.',
    voice_notes: [
      {
        id: 'vn-mock-001',
        transcript: 'Campo apresenta resistência na área emocional, possivelmente relacionada com relacionamentos próximos.',
        durationSeconds: 12,
        createdAt: '2025-05-22T11:30:00Z',
        toolId: 't35-08',
        toolName: 'Karma',
      } satisfies VoiceNote,
    ],
    created_at: '2025-05-22T12:00:00Z',
  },
  {
    session_id: 'sess-003',
    client_id: 'client-003',
    client_name: 'Ana Rodrigues',
    client_whatsapp: '+351 934 567 890',
    client_telegram: '@anarod',
    client_type: 'contact_only',
    methodology_name: 'Mesa dos 49 Símbolos',
    methodology_code: 'RAD_49',
    session_date: '2025-05-28',
    intention: 'Proteção espiritual e abertura de caminhos.',
    hawkins_initial: 175,
    hawkins_final: 350,
    reverberation_days: 14,
    tool_results: [
      { toolId: 't49-01', toolName: 'Arcanjo Miguel', toolImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', status: 'activated' },
      { toolId: 't49-02', toolName: 'Arcanjo Rafael', toolImageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80', status: 'activated' },
      { toolId: 't49-04', toolName: 'Arcanjo Uriel', toolImageUrl: 'https://images.unsplash.com/photo-1446329813274-7c9036bd9a1f?w=400&q=80', status: 'activated' },
    ],
    identified_tool_names: ['Arcanjo Miguel', 'Arcanjo Rafael', 'Arcanjo Uriel'],
    activated_tool_names: ['Arcanjo Miguel', 'Arcanjo Rafael', 'Arcanjo Uriel'],
    therapist_notes: 'Campo espiritual muito aberto e receptivo.',
    created_at: '2025-05-28T13:00:00Z',
  },
  {
    session_id: 'sess-001',
    client_id: 'client-001',
    client_name: 'Maria Silva',
    client_email: 'maria.silva@email.com',
    client_type: 'hub_user',
    methodology_name: 'Mesa dos 35 Gráficos',
    methodology_code: 'RAD_35',
    session_date: '2025-05-30',
    intention: 'Equilíbrio emocional e libertação de bloqueios profissionais.',
    hawkins_initial: 150,
    hawkins_final: null,
    reverberation_days: null,
    tool_results: [
      { toolId: 't35-01', toolName: 'Anti Magia', toolImageUrl: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=400&q=80', status: 'identified' },
      { toolId: 't35-02', toolName: 'Luxor', toolImageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80', status: 'identified' },
      { toolId: 't35-05', toolName: 'Prosperidade', toolImageUrl: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=400&q=80', status: 'in_analysis' },
    ],
    identified_tool_names: ['Anti Magia', 'Luxor', 'Prosperidade'],
    activated_tool_names: [],
    created_at: '2025-05-30T09:00:00Z',
  },
  {
    session_id: 'sess-002',
    client_id: 'client-002',
    client_name: 'João Ferreira',
    client_email: 'joao.ferreira@gmail.com',
    client_type: 'contact_with_email',
    methodology_name: 'Mesa dos 35 Gráficos',
    methodology_code: 'RAD_35',
    session_date: '2025-05-29',
    intention: 'Trabalho com padrões kármicos familiares.',
    hawkins_initial: 100,
    hawkins_final: 250,
    reverberation_days: 21,
    tool_results: [
      { toolId: 't35-08', toolName: 'Karma', toolImageUrl: 'https://images.unsplash.com/photo-1446329813274-7c9036bd9a1f?w=400&q=80', status: 'activated', notes: 'Padrão repetitivo na linhagem paterna.' },
      { toolId: 't35-06', toolName: 'Amor', toolImageUrl: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400&q=80', status: 'activated' },
      { toolId: 't35-04', toolName: 'Desobsessão', toolImageUrl: 'https://images.unsplash.com/photo-1513001900722-370f803f498d?w=400&q=80', status: 'identified' },
    ],
    identified_tool_names: ['Karma', 'Amor', 'Desobsessão'],
    activated_tool_names: ['Karma', 'Amor'],
    created_at: '2025-05-29T16:00:00Z',
  },
];

export const getSnapshotBySessionId = (sessionId: string) =>
  SESSION_SNAPSHOTS.find(s => s.session_id === sessionId);

// ─── BUILD DEFAULT SECTIONS FROM SNAPSHOT ──────────────────
export const buildReportSections = (snapshot: SessionSnapshot): ReportSection[] => [
  {
    code: 'client',
    title: 'Cliente',
    content: `${snapshot.client_name}${snapshot.client_email ? '\n' + snapshot.client_email : ''}${snapshot.client_whatsapp ? '\n' + snapshot.client_whatsapp : ''}`,
    isReadOnly: true,
    sourceTrace: 'session_field',
    visibility: 'included',
    structuredData: {
      client_id: snapshot.client_id,
      client_name: snapshot.client_name,
      client_email: snapshot.client_email,
      client_whatsapp: snapshot.client_whatsapp,
      client_telegram: snapshot.client_telegram,
      client_type: snapshot.client_type,
    },
  },
  {
    code: 'session_objective',
    title: 'Objetivo da Sessão',
    content: snapshot.intention || '',
    isReadOnly: false,
    sourceTrace: 'session_field',
    visibility: 'included',
  },
  {
    code: 'hawkins_evolution',
    title: 'Evolução de Hawkins',
    content: snapshot.hawkins_initial !== null
      ? `Nível inicial: ${snapshot.hawkins_initial}\nNível final: ${snapshot.hawkins_final ?? 'Não registado'}`
      : 'Não registado',
    isReadOnly: true,
    sourceTrace: 'session_field',
    visibility: 'included',
    structuredData: {
      hawkins_initial: snapshot.hawkins_initial,
      hawkins_final: snapshot.hawkins_final,
    },
  },
  {
    code: 'identified_tools',
    title: 'Gráficos Identificados',
    content: snapshot.identified_tool_names.length
      ? snapshot.identified_tool_names.join('\n')
      : 'Nenhum gráfico identificado',
    isReadOnly: true,
    sourceTrace: 'session_field',
    visibility: 'included',
    structuredData: {
      tool_results: snapshot.tool_results.filter(r =>
        r.status === 'identified' || r.status === 'activated'
      ),
      identified_tool_names: snapshot.identified_tool_names,
    },
  },
  {
    code: 'activated_tools',
    title: 'Gráficos Ativados',
    content: snapshot.activated_tool_names.length
      ? snapshot.activated_tool_names.join('\n')
      : 'Nenhum gráfico ativado',
    isReadOnly: true,
    sourceTrace: 'session_field',
    visibility: 'included',
    structuredData: {
      tool_results: snapshot.tool_results.filter(r => r.status === 'activated'),
      activated_tool_names: snapshot.activated_tool_names,
    },
  },
  {
    code: 'therapist_notes',
    title: 'Notas do Terapeuta',
    content: snapshot.therapist_notes || '',
    isReadOnly: false,
    sourceTrace: 'therapist_edit',
    visibility: 'private',
  },
  {
    code: 'final_interpretation',
    title: 'Interpretação Final',
    content: '',
    isReadOnly: false,
    sourceTrace: 'therapist_edit',
    visibility: 'included',
    aiDraft: snapshot.intention
      ? `Com base na intenção terapêutica — "${snapshot.intention}" — e nos gráficos ativados (${snapshot.activated_tool_names.join(', ') || 'nenhum'}), a sessão evidenciou padrões energéticos que requerem atenção continuada. O campo respondeu positivamente às ativações realizadas.`
      : undefined,
  },
  {
    code: 'recommendations',
    title: 'Recomendações',
    content: '',
    isReadOnly: false,
    sourceTrace: 'therapist_edit',
    visibility: 'included',
    aiDraft: `Hidratação reforçada nos próximos ${snapshot.reverberation_days ?? 21} dias.\nMeditação diária de 10 minutos ao acordar.\nObservar sonhos e sincronicidades durante o período de reverberação.`,
  },
  {
    code: 'reverberation',
    title: 'Reverberação',
    content: snapshot.reverberation_days !== null
      ? `Período de reverberação: ${snapshot.reverberation_days} dias`
      : '',
    isReadOnly: false,
    sourceTrace: 'session_field',
    visibility: 'included',
  },
  {
    code: 'next_steps',
    title: 'Próximos Passos',
    content: '',
    isReadOnly: false,
    sourceTrace: 'therapist_edit',
    visibility: 'included',
    aiDraft: `Nova sessão recomendada após o período de reverberação${snapshot.reverberation_days ? ` (${snapshot.reverberation_days} dias)` : ''} para acompanhar a estabilização do campo energético.`,
  },
];

export const getReportV2ById = (id: string): ReportV2 | undefined => {
  const base = REPORTS.find(r => r.id === id);
  if (!base) return undefined;
  const snapshot = SESSION_SNAPSHOTS.find(s => s.session_id === base.sessionId);
  const sections = snapshot ? buildReportSections(snapshot) : [];
  // populate existing content into sections
  if (base.summary && sections.find(s => s.code === 'session_objective')) {
    const s = sections.find(s => s.code === 'session_objective')!;
    if (!s.content) s.content = base.summary;
  }
  if (base.interpretations?.length && sections.find(s => s.code === 'final_interpretation')) {
    sections.find(s => s.code === 'final_interpretation')!.content = base.interpretations.join('\n');
    sections.find(s => s.code === 'final_interpretation')!.sourceTrace = 'therapist_edit';
  }
  if (base.recommendations?.length && sections.find(s => s.code === 'recommendations')) {
    sections.find(s => s.code === 'recommendations')!.content = base.recommendations.join('\n');
    sections.find(s => s.code === 'recommendations')!.sourceTrace = 'therapist_edit';
  }
  if (base.nextSteps && sections.find(s => s.code === 'next_steps')) {
    sections.find(s => s.code === 'next_steps')!.content = base.nextSteps;
    sections.find(s => s.code === 'next_steps')!.sourceTrace = 'therapist_edit';
  }
  return {
    ...base,
    sections,
    snapshot,
    portalLink: base.status === 'shared' ? {
      id: `portal-${base.id}`,
      report_id: base.id,
      client_id: base.clientId,
      token: `tok_${base.id}`,
      url: `https://app.radionics.io/report/${base.id}/view`,
      created_at: base.sharedAt || base.createdAt,
    } : undefined,
  };
};
