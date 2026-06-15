// ============================================================
// RADIONICS Type Definitions
// ============================================================

export type SessionStatus = 'draft' | 'in_progress' | 'paused' | 'completed' | 'reported';
export type StageStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';
export type StepType = 'information' | 'input' | 'options' | 'activation' | 'review';
export type ToolStatus = 'not_analyzed' | 'in_analysis' | 'identified' | 'activated' | 'skipped';
export type ReportStatus = 'draft' | 'in_review' | 'approved' | 'shared';
export type ClientType = 'contact_only' | 'contact_with_email' | 'hub_user';
export type TemplateType = 'official' | 'custom';
export type SessionMode = 'presential' | 'online' | 'distance';
export type FieldType = 'short_text' | 'long_text' | 'number' | 'date' | 'single_select' | 'multi_select' | 'checkbox' | 'image' | 'audio' | 'tool_selector' | 'hawkins_selector';

// FieldValue — discriminated union so consumers can narrow without casting
export type FieldValue =
  | { type: 'short_text';        value: string }
  | { type: 'long_text';         value: string }
  | { type: 'number';            value: number }
  | { type: 'date';              value: string }          // ISO date string
  | { type: 'single_select';     value: string }
  | { type: 'multi_select';      value: string[] }
  | { type: 'checkbox';          value: boolean }
  | { type: 'image';             value: string }          // URL or data URI
  | { type: 'audio';             value: string }          // URL
  | { type: 'tool_selector';     value: string[] }        // toolIds
  | { type: 'hawkins_selector';  value: number };

// Hawkins Level
export interface HawkinsLevel {
  value: number;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

// ─── SPECIALTY DOMAIN TYPES ──────────────────────────────────
// Maps to: radionics_specialties
export interface Specialty {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  color?: string;
  category?: string;
  requiresCertification: boolean;
  isActive: boolean;
  toolCount: number;
  // derived for the authenticated therapist
  certificationStatus?: CertStatus;
  certificationId?: string;  // id of the therapist_specialty_certification row if exists
  status?: 'active' | 'inactive';
  createdAt?: string;
}

// Maps to: radionics_specialty_requests
export type SpecialtyRequestStatus = 'pending_review' | 'approved' | 'rejected';
export interface SpecialtyRequest {
  id: string;
  therapistId: string;
  proposedName: string;
  proposedSlug?: string;
  description?: string;
  category?: string;
  notes?: string;
  status: SpecialtyRequestStatus;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt: string;
  createdAt?: string;
  /** Admin UI only — from HUB/Auth Core or auth.users RPC; not stored in RADIONICS. */
  requesterName?: string;
  requesterEmail?: string;
}

// Maps to: therapist_specialty_certifications
export type CertStatus = 'approved' | 'pending' | 'rejected' | 'expired' | 'not_certified';
export interface Certification {
  id: string;
  therapistId: string;
  specialtyId: string;
  status: CertStatus;
  yearsOfExperience: number;           // required
  experienceDescription?: string;
  trainingInstitution?: string;
  trainingCompletedDate?: string;      // date string YYYY-MM-DD
  trainingCompletedAt?: string;        // legacy alias
  certificateNumber?: string;
  certifiedBy?: string;
  notes?: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt: string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
  documents: CertDocument[];           // one-to-many
  /** Admin UI only — from HUB/Auth Core or auth.users RPC; not stored in RADIONICS. */
  requesterName?: string;
  requesterEmail?: string;
}

// Maps to: therapist_specialty_documents
export type DocFileType = 'pdf' | 'jpg' | 'jpeg' | 'png';
export interface CertDocument {
  id: string;
  certificationId: string;
  fileUrl: string;      // certificate_url (mock in phase 1)
  fileName: string;     // certificate_file_name
  fileType: DocFileType;
  fileSize?: number;
  uploadedAt: string;
}

// Methodology (radionics_tables)
// NOTE: kept for compatibility with sessions/templates layer
export interface Methodology {
  id: string;
  code: string;
  name: string;
  shortName: string;
  description: string;
  imageUrl: string;
  color: string;
  requiresCertification: boolean;
  isActive: boolean;
  toolCount: number;
  // derived from Certification.status for the authenticated therapist
  certificationStatus?: CertStatus;
  // for therapist-proposed specialties not yet in catalog
  isRequestedSpecialty?: boolean;
  specialtyRequestStatus?: SpecialtyRequestStatus;
}

// Tool
export interface Tool {
  id: string;
  code: string;
  name: string;
  description: string;
  whatItDoes: string;
  example: string;
  suggestedActivation: string;
  imageUrl: string;
  methodologyId: string;
  sortOrder: number;
}

// Client
export interface Client {
  id: string;
  name: string;
  email?: string;
  whatsapp?: string;
  telegram?: string;
  phone?: string;
  birthDate?: string;
  clientType: ClientType;
  notes?: string;
  createdAt: string;
  lastSessionDate?: string;
  sessionCount: number;
  avatarUrl?: string;
}

// Template Block — maps to radionics_template_blocks
export interface TemplateBlock {
  id: string;
  blockCode: string;
  title: string;
  description?: string;
  orderIndex: number;
  stageCode?: string; // which stage this block belongs to
  isRequired: boolean;
  showInSession: boolean;
  showInReport: boolean;
  showInHub: boolean;
  isPrivate: boolean;
  fields: TemplateField[];
}

// Template Field — maps to radionics_template_fields
export interface TemplateField {
  id: string;
  fieldCode: string;
  label: string;
  fieldType: FieldType;
  orderIndex: number;
  isRequired: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  showInSession?: boolean;
  showInReport?: boolean;
  showInHub?: boolean;
}

// Template — maps to radionics_session_templates
export interface Template {
  id: string;
  name: string;
  description?: string;
  methodologyId: string;
  methodologyName: string;
  /** Ligação explícita ao catálogo (UUID Supabase ou spec-* mock). */
  specialtyIds?: string[];
  /** Fallback estável entre ambientes (seed slugs: map, mesa-35, mesa-49). */
  specialtySlugs?: string[];
  isBaseTemplate: boolean;
  templateType: TemplateType;
  status: 'active' | 'archived';
  blocks: TemplateBlock[];
  createdAt: string;
  updatedAt: string;
  version?: number;          // radionics_template_versions
  parentTemplateId?: string; // when duplicated from another
}

// Block Library item (pre-defined blocks to add)
export type BlockCategory = 'common' | 'therapeutic' | 'report' | 'private';
export interface BlockLibraryItem {
  id: string;
  category: BlockCategory;
  title: string;
  description: string;
  defaultFields: Omit<TemplateField, 'id'>[];
  suggestedStages?: string[];
}

// Save state for auto-save
export type SaveState = 'saved' | 'unsaved' | 'saving';

// Wizard step for template creation
export type TemplateWizardStep = 'methodology' | 'starting_point' | 'basics' | 'builder';

// Session Stage
export interface SessionStage {
  code: string;
  label: string;
  status: StageStatus;
  steps: SessionStep[];
}

// Session Step
export interface SessionStep {
  code: string;
  label: string;
  type: StepType;
  status: StageStatus;
  content?: string;
  selectedTools?: string[];
  toolResults?: ToolResult[];
  notes?: string;
  transcript?: string;
}

// Tool Intensity
export type ToolIntensity = 'low' | 'medium' | 'high';

// Voice Note
export interface VoiceNote {
  id: string;
  transcript: string;
  durationSeconds: number;
  createdAt: string;
  /** The tool this note was recorded against, if any */
  toolId?: string;
  toolName?: string;
  /** Recorded audio blob URL or remote URL */
  audioUrl?: string;
}

// Tool Result
// NOTE: `found` is derived — use `status === 'identified' || status === 'activated'` instead.
export interface ToolResult {
  toolId: string;
  toolName: string;
  toolImageUrl: string;
  status: ToolStatus;
  intensity?: ToolIntensity;
  notes?: string;
  transcript?: string;
  voiceNotes?: VoiceNote[];
  activatedAt?: string;
}

// Session State Snapshot — field names match future `radionics_session_details` DB columns
export interface SessionStateSnapshot {
  session_id: string;
  hawkins_initial: number | null;
  hawkins_final: number | null;
  reverberation_days: number | null;
  tool_results: ToolResult[];
  identified_tool_ids: string[];
  activated_tool_ids: string[];
  /** fieldCode → FieldValue map; persisted alongside tool results */
  field_values: Record<string, FieldValue>;
  stage_completion: Record<string, boolean>;
  updated_at: string;
}

// Session
export interface Session {
  id: string;
  clientId: string;
  clientName: string;
  therapistId: string;
  /** Catálogo de especialidades (UUID Supabase ou spec-* mock). */
  specialtyId: string;
  specialtyName: string;
  specialtySlug: string;
  /** Chave interna de ferramentas/templates legado (meth-map, meth-rad35, …). */
  methodologyId: string;
  methodologyName: string;
  methodologyCode: string;
  templateId: string;
  templateName: string;
  status: SessionStatus;
  sessionMode: SessionMode;
  intention?: string;
  hawkinsInitial?: number;
  hawkinsFinal?: number;
  reverberationDays?: number;
  currentStageCode?: string;
  currentStepCode?: string;
  stages: SessionStage[];
  /** Estado vivo do workspace (diagnóstico / ativações). */
  toolResults?: ToolResult[];
  fieldValues?: Record<string, FieldValue>;
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  completedAt?: string;
}

// Report
export interface Report {
  id: string;
  sessionId: string;
  clientId: string;
  clientName: string;
  methodologyName: string;
  methodologyCode: string;
  therapistId: string;
  status: ReportStatus;
  sessionDate: string;
  intention?: string;
  summary?: string;
  hawkinsInitial?: number;
  hawkinsFinal?: number;
  toolsIdentified: string[];
  toolsActivated: string[];
  interpretations: string[];
  recommendations: string[];
  reverberationDays?: number;
  nextSteps?: string;
  createdAt: string;
  approvedAt?: string;
  sharedAt?: string;
}

// Dashboard Stats
export interface DashboardStats {
  sessionsInProgress: Session[];
  sessionsToday: Session[];
  pendingReports: Report[];
  recentClients: Client[];
}

// ─── REPORT V2 ─────────────────────────────────────────────────

// Source trace — where the data in each section came from
export type SourceTrace = 'session_field' | 'tool_note' | 'voice_transcript' | 'therapist_edit' | 'ai_draft';

export type ReportSectionCode =
  | 'client'
  | 'session_objective'
  | 'hawkins_evolution'
  | 'identified_tools'
  | 'activated_tools'
  | 'therapist_notes'
  | 'final_interpretation'
  | 'recommendations'
  | 'reverberation'
  | 'next_steps';

export type SectionVisibility = 'included' | 'hidden_from_client' | 'private';

export interface ReportSection {
  code: ReportSectionCode;
  title: string;
  content: string;            // editable rich-ish text
  isReadOnly: boolean;        // true for session facts (hawkins, tools)
  sourceTrace: SourceTrace;
  visibility: SectionVisibility;
  aiDraft?: string;           // AI generated placeholder
  isDirty?: boolean;          // unsaved edits
  /** Structured session data backing this read-only section; set only when isReadOnly === true */
  structuredData?: unknown;
}

// Session Snapshot — Supabase-ready (maps to radionics_session_snapshots)
export interface SessionSnapshot {
  session_id: string;
  client_id: string;
  client_name: string;
  client_email?: string;
  client_whatsapp?: string;
  client_telegram?: string;
  client_type: ClientType;
  methodology_name: string;
  methodology_code: string;
  session_date: string;
  intention?: string;
  hawkins_initial: number | null;
  hawkins_final: number | null;
  reverberation_days: number | null;
  tool_results: ToolResult[];
  identified_tool_names: string[];
  activated_tool_names: string[];
  therapist_notes?: string;
  /** Replaces voice_transcripts — full VoiceNote objects with optional toolId/toolName/audioUrl */
  voice_notes?: VoiceNote[];
  created_at: string;
}

// Client Portal Link — maps to radionics_client_portal_links
export interface ClientPortalLink {
  id: string;
  report_id: string;
  client_id: string;
  token: string;
  url: string;
  expires_at?: string;
  created_at: string;
}

// Report v2 — extends base Report with sections
export interface ReportV2 extends Report {
  sections: ReportSection[];
  snapshot?: SessionSnapshot;
  portalLink?: ClientPortalLink;
  finalInterpretation?: string;
  therapistNotes?: string;
}

export type {
  MethodologyTool,
  MethodologyAsset,
  MethodologyAssetMedia,
  SpecialtyToolLink,
  SpecialtyAssetContent,
  SpecialtyMethodologyContext,
  MethodologyToolType,
  MethodologyAssetType,
  MethodologyUsageMode,
  MethodologyCatalogStatus,
  MediaType,
  MediaStorageProvider,
  MediaSourceType,
  MediaQualityStatus,
  MethodologyProtocol,
  MethodologyProtocolDetail,
  ProtocolStep,
  ProtocolAssetLink,
  ActivationScriptResource,
  ResourceAssetView,
  SpecialtyResourceSummary,
  ResourceSearchResult,
  ResourceSearchField,
  ResourceSearchResultKind,
  ActivationScriptType,
  MethodologyProtocolStatus,
} from '@/types/methodology-engine';

export type {
  LibraryMaterial,
  LibraryMaterialLink,
  LibraryMaterialBundle,
  LibraryMaterialType,
  LibraryMaterialVisibility,
  LibraryMaterialStatus,
  LibraryMaterialTargetType,
  LibraryMaterialSourceType,
  MaterialTypeGroup,
  SearchMaterialsOptions,
} from '@/types/materials-library';

export type {
  WorkflowTemplate,
  WorkflowStep,
  WorkflowTemplateBundle,
  WorkflowStepType,
  WorkflowTemplateStatus,
  WorkflowStepStatus,
  WorkflowStepConfig,
  WorkflowCondition,
  WorkflowMeasurementConfig,
  WorkflowMeasurementMode,
  WorkflowAssetPickerConfig,
  WorkflowProtocolConfig,
} from '@/types/workflow-engine';
