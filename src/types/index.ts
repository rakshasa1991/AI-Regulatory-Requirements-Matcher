export type DocumentType = "SOP" | "Policy" | "Template" | "ICHGuideline";

export type Criticality = "Critical" | "High" | "Medium" | "Low";

export type RequirementCategory =
  | "Safety"
  | "Efficacy"
  | "Quality"
  | "Labeling"
  | "Administrative"
  | "Other";

export type CoverageStatus = "Covered" | "Partial" | "Gap" | "Unmapped";

export type GapType = "Missing" | "Contradictory" | "Partial" | "Outdated";

export type GapSeverity = "Critical" | "High" | "Medium" | "Low";

export type GapItemStatus = "Open" | "InProgress" | "Resolved";

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  category: string;
  version: string;
  content: string;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
}

export interface Requirement {
  id: string;
  setId: string;
  orderIndex: number;
  text: string;
  category: RequirementCategory;
  criticality: Criticality;
  status: CoverageStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequirementSet {
  id: string;
  title: string;
  source: string;
  rawText: string;
  status: string;
  importDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Mapping {
  id: string;
  requirementId: string;
  documentId: string;
  chunkId?: string;
  coverageStatus: CoverageStatus;
  matchScore: number;
  aiRationale?: string;
  createdAt: Date;
}

export interface GapReport {
  id: string;
  requirementSetId: string;
  executiveSummary?: string;
  createdAt: Date;
}

export interface GapItem {
  id: string;
  reportId: string;
  requirementId: string;
  gapType: GapType;
  severity: GapSeverity;
  recommendation?: string;
  draftResponseText?: string;
  status: GapItemStatus;
}

export interface MappingResponse {
  id: string;
  requirementId: string;
  requirementText: string;
  documentId: string;
  documentTitle: string;
  chunkId: string | null;
  chunkIndex: number | null;
  coverageStatus: CoverageStatus;
  matchScore: number;
  aiRationale: string | null;
  createdAt: Date;
  criticality: string;
}

export interface MappingApiResponse {
  data: MappingResponse[];
}

export interface GapReportData {
  id: string;
  requirementSetId: string;
  requirementSetTitle: string;
  executiveSummary: string | null;
  items: GapItemWithRequirement[];
  createdAt: Date;
}

export interface GapItemWithRequirement extends GapItem {
  requirementText: string;
}

export interface GapReportApiResponse {
  data: GapReportData;
}

export interface SearchResponse {
  data: SearchResult[];
}

export interface SearchResult {
  id: string;
  title: string;
  type: string;
  category: string;
  excerpt: string;
}

export interface DraftResponse {
  data: {
    draftResponseText: string;
  };
}

export interface MappingSummary {
  covered: number;
  partial: number;
  gap: number;
  unmapped: number;
  total: number;
}
