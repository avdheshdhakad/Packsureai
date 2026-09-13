export type UserRole = 'admin' | 'officer' | 'inspector' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  badgeNumber: string;
  avatar?: string;
}

export interface BoundingBox {
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  width: number; // percentage (0 - 100)
  height: number; // percentage (0 - 100)
}

export interface OCRBlock {
  id: string;
  text: string;
  confidence: number;
  boundingBox: BoundingBox;
  blockType?: 'line' | 'paragraph' | 'block' | 'word';
  declarationType?: DeclarationType;
}

export interface OCRResult {
  fullText: string;
  confidence: number;
  blocks: OCRBlock[];
  language?: string;
  qualityScore?: number;
}

export type DeclarationType =
  | 'mrp'
  | 'net_quantity'
  | 'manufacturer'
  | 'importer'
  | 'consumer_care'
  | 'country_of_origin'
  | 'mfg_date'
  | 'unit_sale_price'
  | 'commodity_name'
  | 'ingredients';

export type DeclarationStatus = 'detected' | 'low_confidence' | 'missing' | 'invalid';

export interface ProductImage {
  id: string;
  url: string;
  panelType?: 'front' | 'back' | 'side' | 'bottom' | 'nutrition' | 'other' | string;
  label?: string;
  rotation?: number;
  isEnhanced?: boolean;
}

export interface Declaration {
  id: string;
  type: DeclarationType;
  label: string;
  detectedValue: string;
  confidence: number;
  status: DeclarationStatus;
  boundingBox?: BoundingBox;
  locationOnPackage?: string;
  panelName?: string;
  ruleId: string;
  ruleCode: string;
  remarks?: string;
  officerOverride?: {
    value: string;
    status: DeclarationStatus;
    by: string;
    at: string;
    remarks: string;
  };
}

export type ViolationSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface ComplianceRule {
  id: string;
  ruleCode: string;
  declarationName: string;
  declarationType: DeclarationType;
  required: boolean;
  validationType: 'presence' | 'format' | 'unit' | 'date_validity' | 'pattern';
  expectedFormat: string;
  severity: ViolationSeverity;
  description: string;
  legalMetrologyReference: string; // e.g. "Rule 6(1)(e) - Legal Metrology (Packaged Commodities) Rules, 2011"
  active: boolean;
}

export interface Violation {
  id: string;
  scanId: string;
  ruleId: string;
  ruleCode: string;
  title: string;
  severity: ViolationSeverity;
  detectedValue: string;
  expectedValue: string;
  confidence: number;
  recommendedAction: string;
  legalReference: string;
  boundingBox?: BoundingBox;
  locationOnPackage?: string; // e.g. "Back Panel — Bottom Right (Mandatory Information Box)"
  panelName?: string; // e.g. "Back Panel", "Principal Display Panel (PDP)", "Side Flange"
  inspectionLocation?: string; // e.g. "Retail Inspection: Sector 18 Market, Noida, UP"
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface ImageQualityCheck {
  status: 'passed' | 'warning' | 'failed';
  blurScore: number; // 0 - 100
  lightingScore: number;
  angleScore: number;
  resolutionScore: number;
  overallScore: number;
  warnings: string[];
  suggestions: string[];
}

export type ScanStatus =
  | 'uploaded'
  | 'quality_check'
  | 'ocr_processing'
  | 'extracting'
  | 'validating'
  | 'completed'
  | 'failed';

export type ComplianceVerdict = 'COMPLIANT' | 'NON-COMPLIANT' | 'NEEDS MANUAL REVIEW';

export interface ComplianceBreakdown {
  declarationCompleteness: number; // 0-100
  ocrConfidence: number; // 0-100
  formatValidity: number; // 0-100
  readability: number; // 0-100
  mandatoryFieldCompliance: number; // 0-100
}

export interface StatutoryAuditCheckItem {
  clauseCode: string;
  ruleName: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  statutoryRequirement: string;
  detectedContent: string;
  legalSection: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  penaltyClause: string;
  statutoryNotes: string;
}

export interface StatutoryAuditResult {
  productName: string;
  brand: string;
  overallVerdict: 'COMPLIANT' | 'NON-COMPLIANT' | 'ACTION_REQUIRED';
  complianceScore: number;
  legalActReference: string;
  statutoryNotices: string[];
  checklist: StatutoryAuditCheckItem[];
  officerSummary: string;
  auditedAt: string;
  engineUsed: string;
}

export interface Scan {
  id: string;
  productName: string;
  brand: string;
  barcode?: string;
  category: string;
  packagingType: string;
  imageUrl: string;
  images?: ProductImage[];
  thumbnailUrl?: string;
  inspectorId: string;
  inspectorName: string;
  inspectorRole: UserRole;
  inspectorBadge: string;
  scanDate: string;
  status: ScanStatus;
  mode: 'demo' | 'live';
  complianceScore: number;
  verdict: ComplianceVerdict;
  requiresManualReview: boolean;
  breakdown: ComplianceBreakdown;
  declarations: Declaration[];
  violations: Violation[];
  ocrResult?: OCRResult;
  imageQuality?: ImageQualityCheck;
  officerRemarks?: string;
  officerDecision?: 'accepted' | 'rejected' | 'pending' | 'flagged_for_hearing';
  evidenceNotes?: string;
  statutoryAudit?: StatutoryAuditResult;
  inspectorSignOff?: {
    signed: boolean;
    signedBy: string;
    signedAt: string;
    badgeNumber: string;
    department?: string;
    signatureDataUrl?: string;
    signatureType: 'draw' | 'typed';
    sealPlaced: boolean;
    sealPlacement: 'bottom_center' | 'bottom_right' | 'top_right';
    sealType: string;
    notes?: string;
  };
}

export interface InspectionReport {
  id: string;
  scanId: string;
  reportNumber: string;
  issuedAt: string;
  inspector: {
    name: string;
    badge: string;
    department: string;
    signatureDataUrl?: string;
  };
  product: {
    name: string;
    brand: string;
    category: string;
    packagingType: string;
  };
  complianceScore: number;
  verdict: ComplianceVerdict;
  ocrConfidence: number;
  declarations: Declaration[];
  violations: Violation[];
  summaryRemarks: string;
  legalNotices: string[];
  inspectorSignOff?: {
    signed: boolean;
    signedBy: string;
    signedAt: string;
    badgeNumber: string;
    department?: string;
    signatureDataUrl?: string;
    sealPlaced: boolean;
    sealPlacement: string;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
}

export interface SystemConfig {
  mode: 'demo' | 'live';
  ocrConfidenceThreshold: number;
  manualReviewThreshold: number;
  autoFlagViolations: boolean;
  visionApiConfigured?: boolean;
  geminiApiConfigured?: boolean;
  demoModeActive?: boolean;
  minConfidenceThreshold?: number; // default 80
  ocrProvider?: 'google_cloud_vision' | 'gemini_vision' | 'demo_engine';
}
