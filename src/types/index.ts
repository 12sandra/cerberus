export type EntityType = 
  | 'CASE'
  | 'PERSON'
  | 'PHONE'
  | 'BANK_ACCOUNT'
  | 'LOCATION'
  | 'VEHICLE'
  | 'ORGANIZATION'
  | 'DEVICE_IMEI'
  | 'IP_ADDRESS'
  | 'CRYPTO_WALLET';

export type RelationType =
  | 'TRANSFERRED_FUNDS'
  | 'COMMUNICATED_WITH'
  | 'REGISTERED_OWNER'
  | 'LOCATED_AT'
  | 'LINKED_TO_CASE'
  | 'USED_DEVICE'
  | 'ASSOCIATED_WITH'
  | 'ADMIN_OF'
  | 'MULE_RECRUITER'
  | 'RECEIVED_OTP';

export interface UserOfficer {
  id: string;
  badgeNumber: string;
  name: string;
  rank: string;
  department: string;
  station: string;
  avatarUrl?: string;
}

export interface Case {
  id: string;
  firNumber: string;
  title: string;
  policeStation: string;
  investigatingOfficer: string;
  registrationDate: string;
  incidentDate: string;
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'CHARGE_SHEETED' | 'CLOSED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'FINANCIAL_FRAUD' | 'IDENTITY_THEFT' | 'EXTORTION' | 'CRYPTO_CRIME' | 'MALWARE_SYNDICATE';
  description: string;
  sections: string[]; // e.g. ['66C IT Act', '66D IT Act', '420 IPC']
  victimCount: number;
  accusedCount: number;
  totalLossInr: number;
  extractedEntityCount: number;
  pendingMatchCount: number;
  pendingExtractionCount: number;
  documentsCount: number;
}

export interface DocumentStatus {
  id: string;
  caseId: string;
  fileName: string;
  fileSize: string;
  uploadTimestamp: string;
  status: 'PENDING' | 'OCR_PROCESSING' | 'EXTRACTING_ENTITIES' | 'RESOLVING_GRAPH' | 'COMPLETED' | 'FAILED';
  progressPercentage: number;
  pageCount: number;
  extractedCandidateCount: number;
  errorMessage?: string;
}

export interface ExtractionCandidate {
  id: string;
  caseId: string;
  documentId: string;
  documentName: string;
  entityType: EntityType;
  extractedValue: string;
  standardizedValue: string;
  pageNumber: number;
  chunkSnippet: string;
  confidence: number; // 0.0 - 1.0
  reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EDITED';
  editedValue?: string;
  rejectionReason?: string;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface EntityMatchCandidate {
  id: string;
  caseId: string;
  sourceEntity: {
    id: string;
    type: EntityType;
    label: string;
    caseId: string;
    details: Record<string, string>;
  };
  candidateEntity: {
    id: string;
    type: EntityType;
    label: string;
    caseId: string;
    caseFir: string;
    details: Record<string, string>;
  };
  confidence: number; // 0.0 - 1.0
  sharedIdentifiers: {
    identifierType: string;
    value: string;
  }[];
  similarityReasons: string[];
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  decidedAt?: string;
  decidedBy?: string;
}

export interface GraphNode {
  id: string;
  caseId: string;
  label: string;
  type: EntityType;
  subType?: 'ACCUSED' | 'VICTIM' | 'SUSPECT' | 'MULE' | 'WITNESS' | 'PRIMARY_ROOT' | 'CROSS_CASE';
  confidence: number;
  riskScore: number; // 0 - 100
  isRoot?: boolean;
  expanded?: boolean;
  expandableCount?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  metadata: {
    phoneNumber?: string;
    imei?: string;
    accountNumber?: string;
    bankName?: string;
    ifsc?: string;
    address?: string;
    vehiclePlate?: string;
    ipAddress?: string;
    walletAddress?: string;
    firNumber?: string;
    linkedCases?: string[];
    role?: string;
    notes?: string;
    firstSeen?: string;
    lastSeen?: string;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationType: RelationType;
  label: string;
  confidence: number;
  evidenceId: string;
  evidenceSnippet: string;
  amount?: number;
  transactionCount?: number;
  callDurationSeconds?: number;
  dateRange: {
    firstSeen: string;
    lastSeen: string;
  };
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  timestamp: string;
  title: string;
  description: string;
  eventType: 'FINANCIAL' | 'COMMUNICATION' | 'MOVEMENT' | 'LEGAL' | 'DIGITAL_TRACE';
  relatedNodeIds: string[];
  evidenceId: string;
  evidenceDocumentName: string;
  evidenceSnippet: string;
  confidence: number;
  highlighted?: boolean;
}

export interface PatternAlert {
  id: string;
  caseId: string;
  patternType: 
    | 'SHARED_IDENTIFIER'
    | 'FREQUENT_LOCATION'
    | 'DENSE_COMMUNICATION_CLUSTER'
    | 'TRANSACTION_BURST'
    | 'CROSS_CASE_REUSE'
    | 'POTENTIAL_CONNECTOR';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  description: string;
  affectedNodeIds: string[];
  detectionConfidence: number;
  suggestedAction: string;
  evidenceIds: string[];
  detectedAt: string;
}

export interface NetworkAnalytics {
  caseId: string;
  totalNodes: number;
  totalEdges: number;
  highConnectivityEntities: {
    nodeId: string;
    label: string;
    type: EntityType;
    degreeCentrality: number;
    betweennessCentrality: number;
    investigativeLabel: 'High Connectivity' | 'Potential Connector' | 'Central Hub' | 'Bridge Disseminator';
    caseParticipationCount: number;
    connectedIdentifiersCount: number;
    communityClusterId: number;
  }[];
  densityScore: number;
  clusteringCoefficient: number;
  bridgeNodesCount: number;
}

export interface EvidenceChunk {
  id: string;
  caseId: string;
  documentId: string;
  documentTitle: string;
  documentType: 'FIR_REPORT' | 'CDR_ANALYSIS' | 'BANK_STATEMENT' | 'IPDR_LOG' | 'SEIZURE_MEMO' | 'WHATSAPP_FORENSIC';
  chainOfCustody: string;
  ingestionDate: string;
  pageNumber: number;
  chunkSnippet: string;
  verifiedStatus: boolean;
  associatedNodeIds: string[];
  tags: string[];
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  content: string;
  queryClassification?: 'RELATIONSHIP_PATH' | 'TEXTUAL_EVIDENCE' | 'SUMMARY' | 'UNSUPPORTED';
  citations?: {
    evidenceId: string;
    documentTitle: string;
    page: number;
    snippet: string;
  }[];
  pathNodes?: string[];
  insufficientEvidence?: boolean;
  actions?: {
    type: 'HIGHLIGHT_PATH' | 'VIEW_EVIDENCE' | 'EXPAND_NODE' | 'RESET_GRAPH';
    payload: any;
    label: string;
  }[];
}
