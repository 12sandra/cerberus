import {
  Case,
  UserOfficer,
  GraphNode,
  GraphEdge,
  ExtractionCandidate,
  EntityMatchCandidate,
  TimelineEvent,
  PatternAlert,
  NetworkAnalytics,
  EvidenceChunk,
  DocumentStatus
} from '../types';

export const CURRENT_OFFICER: UserOfficer = {
  id: 'off-0941',
  badgeNumber: 'CY-88219',
  name: 'Insp. Rajeshwar Rao',
  rank: 'Inspector of Police',
  department: 'Cyber Crime Police Station, Central Command',
  station: 'Cyberabad Police Commissionerate, Hyderabad',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
};

export const INITIAL_CASES: Case[] = [
  {
    id: 'FIR-284-2024',
    firNumber: 'FIR No. 284/2024',
    title: 'Operation Jamtara Multi-State SIM Swapping & Mule Account Racket',
    policeStation: 'PS Cyber Crime, Cyberabad',
    investigatingOfficer: 'Insp. Rajeshwar Rao',
    registrationDate: '2024-04-12',
    incidentDate: '2024-04-09',
    status: 'UNDER_INVESTIGATION',
    priority: 'CRITICAL',
    category: 'FINANCIAL_FRAUD',
    description: 'Targeted spear-phishing and unauthorized e-SIM cloning resulting in unauthorized fund siphoning of ₹48.5 Lakhs from high-net-worth victim into rapid layering mule accounts across 3 states.',
    sections: ['66C IT Act', '66D IT Act', '419 IPC', '420 IPC', '120B IPC'],
    victimCount: 1,
    accusedCount: 4,
    totalLossInr: 4850000,
    extractedEntityCount: 38,
    pendingMatchCount: 3,
    pendingExtractionCount: 5,
    documentsCount: 6
  },
  {
    id: 'FIR-112-2024',
    firNumber: 'FIR No. 112/2024',
    title: 'Cross-Border USDT Crypto Phishing & Digital Arrest Syndicate',
    policeStation: 'Cyber Police Station, BKC, Mumbai',
    investigatingOfficer: 'ACP Sunita Deshmukh',
    registrationDate: '2024-03-28',
    incidentDate: '2024-03-25',
    status: 'UNDER_INVESTIGATION',
    priority: 'HIGH',
    category: 'CRYPTO_CRIME',
    description: 'Syndicate impersonated Enforcement Directorate & CBI officers via Skype video calls, confining senior citizen under fake "Digital Arrest" and extorting ₹1.2 Crore transferred into decentralized TRC-20 USDT wallets.',
    sections: ['66D IT Act', '384 IPC', '419 IPC', '420 IPC', '120B IPC'],
    victimCount: 2,
    accusedCount: 6,
    totalLossInr: 12000000,
    extractedEntityCount: 44,
    pendingMatchCount: 2,
    pendingExtractionCount: 2,
    documentsCount: 8
  },
  {
    id: 'FIR-405-2024',
    firNumber: 'FIR No. 405/2024',
    title: 'Predatory Instant Loan App APK Malware & Extortion Ring',
    policeStation: 'Special Cell, IFSO Unit, Delhi Police',
    investigatingOfficer: 'Insp. Manoj Kulkarni',
    registrationDate: '2024-05-02',
    incidentDate: '2024-04-20',
    status: 'OPEN',
    priority: 'HIGH',
    category: 'MALWARE_SYNDICATE',
    description: 'Malicious Android APK disguised as "CashInstant-Loan" exfiltrated contacts, call logs, and private photos to command-and-control server, followed by relentless morphed photo harassment and extortion.',
    sections: ['66E IT Act', '67 IT Act', '385 IPC', '506 IPC'],
    victimCount: 14,
    accusedCount: 5,
    totalLossInr: 1650000,
    extractedEntityCount: 29,
    pendingMatchCount: 1,
    pendingExtractionCount: 4,
    documentsCount: 4
  }
];

export const INITIAL_DOCUMENTS: DocumentStatus[] = [
  {
    id: 'doc-001',
    caseId: 'FIR-284-2024',
    fileName: 'FIR_284_2024_Cyberabad_Complaint.pdf',
    fileSize: '2.4 MB',
    uploadTimestamp: '2024-04-12 10:15:00',
    status: 'COMPLETED',
    progressPercentage: 100,
    pageCount: 6,
    extractedCandidateCount: 14
  },
  {
    id: 'doc-002',
    caseId: 'FIR-284-2024',
    fileName: 'CDR_Analysis_9876543210_Jamtara_Tower.xlsx',
    fileSize: '8.1 MB',
    uploadTimestamp: '2024-04-13 14:30:22',
    status: 'COMPLETED',
    progressPercentage: 100,
    pageCount: 120,
    extractedCandidateCount: 18
  },
  {
    id: 'doc-003',
    caseId: 'FIR-284-2024',
    fileName: 'HDFC_Mule_Account_Statement_5010049281726.csv',
    fileSize: '1.2 MB',
    uploadTimestamp: '2024-04-14 09:05:14',
    status: 'COMPLETED',
    progressPercentage: 100,
    pageCount: 24,
    extractedCandidateCount: 12
  },
  {
    id: 'doc-004',
    caseId: 'FIR-284-2024',
    fileName: 'CCTV_ATM_Withdrawal_Shakarpur_Logs.pdf',
    fileSize: '4.8 MB',
    uploadTimestamp: '2024-04-15 16:45:10',
    status: 'RESOLVING_GRAPH',
    progressPercentage: 85,
    pageCount: 14,
    extractedCandidateCount: 6
  }
];

export const INITIAL_EXTRACTIONS: ExtractionCandidate[] = [
  {
    id: 'ext-01',
    caseId: 'FIR-284-2024',
    documentId: 'doc-001',
    documentName: 'FIR_284_2024_Cyberabad_Complaint.pdf',
    entityType: 'PERSON',
    extractedValue: 'Vikram Sharma alias Vicky',
    standardizedValue: 'Vikram Sharma',
    pageNumber: 2,
    chunkSnippet: '...the caller identified himself as bank compliance officer Vicky @ Vikram Sharma and instructed the complainant to verify eSIM registration request...',
    confidence: 0.94,
    reviewStatus: 'APPROVED',
    reviewedBy: 'Insp. Rajeshwar Rao',
    reviewedAt: '2024-04-12 14:20:00'
  },
  {
    id: 'ext-02',
    caseId: 'FIR-284-2024',
    documentId: 'doc-001',
    documentName: 'FIR_284_2024_Cyberabad_Complaint.pdf',
    entityType: 'PHONE',
    extractedValue: '+91 98765 43210',
    standardizedValue: '+919876543210',
    pageNumber: 1,
    chunkSnippet: '...complainant received multiple calls from mobile number 9876543210 claiming to be senior executive from telecom provider customer support desk...',
    confidence: 0.98,
    reviewStatus: 'APPROVED',
    reviewedBy: 'Insp. Rajeshwar Rao',
    reviewedAt: '2024-04-12 14:21:10'
  },
  {
    id: 'ext-03',
    caseId: 'FIR-284-2024',
    documentId: 'doc-003',
    documentName: 'HDFC_Mule_Account_Statement_5010049281726.csv',
    entityType: 'BANK_ACCOUNT',
    extractedValue: 'A/c No: 5010049281726 (HDFC Bank Jamtara Branch)',
    standardizedValue: '5010049281726',
    pageNumber: 1,
    chunkSnippet: '...IMPS Credit Reference 410928198271: Amount INR 9,50,000 transferred to Beneficiary Ramesh Yadav, HDFC A/c 5010049281726 IFSC HDFC0001298...',
    confidence: 0.97,
    reviewStatus: 'APPROVED',
    reviewedBy: 'Insp. Rajeshwar Rao',
    reviewedAt: '2024-04-14 11:15:00'
  },
  {
    id: 'ext-04',
    caseId: 'FIR-284-2024',
    documentId: 'doc-002',
    documentName: 'CDR_Analysis_9876543210_Jamtara_Tower.xlsx',
    entityType: 'DEVICE_IMEI',
    extractedValue: 'IMEI 864209041234567',
    standardizedValue: '864209041234567',
    pageNumber: 4,
    chunkSnippet: '...handset identifier associated with MSISDN 9876543210 logged on sector 2 as IMEI 864209041234567 (OnePlus Technology Co)...',
    confidence: 0.91,
    reviewStatus: 'PENDING'
  },
  {
    id: 'ext-05',
    caseId: 'FIR-284-2024',
    documentId: 'doc-004',
    documentName: 'CCTV_ATM_Withdrawal_Shakarpur_Logs.pdf',
    entityType: 'VEHICLE',
    extractedValue: 'White Maruti Swift DL 3C AS 4921',
    standardizedValue: 'DL-03C-AS-4921',
    pageNumber: 3,
    chunkSnippet: '...suspect arrived at the Shakarpur ATM booth in a white Swift bearing registration plate DL3CAS4921 and withdrew cash via 4 consecutive transactions...',
    confidence: 0.86,
    reviewStatus: 'PENDING'
  },
  {
    id: 'ext-06',
    caseId: 'FIR-284-2024',
    documentId: 'doc-001',
    documentName: 'FIR_284_2024_Cyberabad_Complaint.pdf',
    entityType: 'ORGANIZATION',
    extractedValue: 'Star Pay Fintech Solutions Pvt Ltd',
    standardizedValue: 'Star Pay Fintech Solutions',
    pageNumber: 3,
    chunkSnippet: '...payment gateway merchant ID indicates intermediary billing entity registered under Star Pay Fintech Solutions Pvt Ltd with registered office in Kolkata...',
    confidence: 0.79,
    reviewStatus: 'PENDING'
  },
  {
    id: 'ext-07',
    caseId: 'FIR-284-2024',
    documentId: 'doc-002',
    documentName: 'CDR_Analysis_9876543210_Jamtara_Tower.xlsx',
    entityType: 'LOCATION',
    extractedValue: 'Cell Tower ID JMT-042 (Karmatar Block)',
    standardizedValue: 'Karmatar Block, Jamtara',
    pageNumber: 1,
    chunkSnippet: '...tower azimuth logs place SIM activation and first outbound blast from coordinates 24.1678 N, 86.8421 E corresponding to Tower JMT-042...',
    confidence: 0.93,
    reviewStatus: 'PENDING'
  },
  {
    id: 'ext-08',
    caseId: 'FIR-284-2024',
    documentId: 'doc-003',
    documentName: 'HDFC_Mule_Account_Statement_5010049281726.csv',
    entityType: 'PERSON',
    extractedValue: 'Ramesh Yadav',
    standardizedValue: 'Ramesh Yadav',
    pageNumber: 2,
    chunkSnippet: '...account holder KYC record lists Ramesh Yadav s/o Ramkishan Yadav, resident of Deoghar, Jharkhand...',
    confidence: 0.95,
    reviewStatus: 'PENDING'
  }
];

export const INITIAL_MATCHES: EntityMatchCandidate[] = [
  {
    id: 'match-01',
    caseId: 'FIR-284-2024',
    sourceEntity: {
      id: 'node-imei-1',
      type: 'DEVICE_IMEI',
      label: 'IMEI 864209041234567 (OnePlus)',
      caseId: 'FIR-284-2024',
      details: {
        'IMEI Number': '864209041234567',
        'Device Make': 'OnePlus Nord 2',
        'Case FIR': 'FIR No. 284/2024 Cyberabad'
      }
    },
    candidateEntity: {
      id: 'cross-imei-112',
      type: 'DEVICE_IMEI',
      label: 'IMEI 864209041234567 in FIR 112/2024',
      caseId: 'FIR-112-2024',
      caseFir: 'FIR No. 112/2024 BKC Mumbai',
      details: {
        'IMEI Number': '864209041234567',
        'Device Make': 'OnePlus Nord 2 5G',
        'Linked Accused': 'Pradeep Mandal',
        'Seized Status': 'Active / Wanted'
      }
    },
    confidence: 0.99,
    sharedIdentifiers: [
      { identifierType: 'Exact IMEI 15-Digit Match', value: '864209041234567' },
      { identifierType: 'Device TAC / Model Code', value: '86420904 (OnePlus Nord)' }
    ],
    similarityReasons: [
      'Exact 15-digit TAC hardware IMEI match across Cyberabad and Mumbai Cyber PS jurisdictions.',
      'Active concurrent cellular pings recorded within 72 hours of both financial offenses.',
      'Same SIM slot 2 IMSI telemetry pattern observed in both cases.'
    ],
    status: 'PENDING'
  },
  {
    id: 'match-02',
    caseId: 'FIR-284-2024',
    sourceEntity: {
      id: 'node-suspect-1',
      type: 'PERSON',
      label: 'Vikram Sharma @ Vicky',
      caseId: 'FIR-284-2024',
      details: {
        'Full Name': 'Vikram Sharma',
        'Known Alias': 'Vicky Jamtara',
        'Phone': '+91 98765 43210',
        'Role': 'Suspected Handler'
      }
    },
    candidateEntity: {
      id: 'cross-person-405',
      type: 'PERSON',
      label: 'Vikram Kumar (Alias: Vicky)',
      caseId: 'FIR-405-2024',
      caseFir: 'FIR No. 405/2024 IFSO Delhi',
      details: {
        'Full Name': 'Vikram Kumar Sharma',
        'Known Alias': 'Vicky Bhai',
        'Phone': '+91 98765 43210',
        'Role': 'Tele-caller Lead'
      }
    },
    confidence: 0.92,
    sharedIdentifiers: [
      { identifierType: 'Phone Number', value: '+91 98765 43210' },
      { identifierType: 'Common Street Alias', value: 'Vicky' },
      { identifierType: 'Father\'s Name in Bank KYC', value: 'Om Prakash Sharma' }
    ],
    similarityReasons: [
      'Identical secondary contact number recorded in Delhi Police IFSO records.',
      'Jaro-Winkler phonetic similarity score of 0.94 on full name and aliases.',
      'Common Telegram recovery identifier discovered in digital extraction logs.'
    ],
    status: 'PENDING'
  },
  {
    id: 'match-03',
    caseId: 'FIR-284-2024',
    sourceEntity: {
      id: 'node-bank-1',
      type: 'BANK_ACCOUNT',
      label: 'HDFC A/c 5010049281726',
      caseId: 'FIR-284-2024',
      details: {
        'Account Number': '5010049281726',
        'Account Holder': 'Ramesh Yadav',
        'IFSC': 'HDFC0001298'
      }
    },
    candidateEntity: {
      id: 'cross-bank-delhi',
      type: 'BANK_ACCOUNT',
      label: 'HDFC A/c 5010049281726 (Flagged Mule)',
      caseId: 'FIR-405-2024',
      caseFir: 'FIR No. 405/2024 IFSO Delhi',
      details: {
        'Account Number': '5010049281726',
        'Account Holder': 'Ramesh Yadav',
        'CFCFRMS Freeze Status': 'Under Lien Notice'
      }
    },
    confidence: 0.98,
    sharedIdentifiers: [
      { identifierType: 'Bank Account Number', value: '5010049281726' },
      { identifierType: 'PAN Card Linked', value: 'ABQPY1024K' }
    ],
    similarityReasons: [
      'Exact account number matched on Citizen Financial Cyber Fraud Reporting & Management System (CFCFRMS).',
      'Rapid disbursement pattern matching syndicate modus operandi.'
    ],
    status: 'PENDING'
  }
];

export const INITIAL_GRAPH_NODES: GraphNode[] = [
  {
    id: 'node-case-284',
    caseId: 'FIR-284-2024',
    label: 'FIR No. 284/2024',
    type: 'CASE',
    subType: 'PRIMARY_ROOT',
    confidence: 1.0,
    riskScore: 90,
    isRoot: true,
    expanded: true,
    metadata: {
      firNumber: 'FIR No. 284/2024',
      notes: 'Investigative root FIR regarding SIM Swapping & ₹48.5L siphoning.',
      firstSeen: '2024-04-09'
    }
  },
  {
    id: 'node-victim-1',
    caseId: 'FIR-284-2024',
    label: 'Dr. K. Ramanathan',
    type: 'PERSON',
    subType: 'VICTIM',
    confidence: 1.0,
    riskScore: 10,
    metadata: {
      role: 'Complainant / Senior Physician',
      phoneNumber: '+91 94401 23456',
      notes: 'Victim of SIM-swap attack; lost ₹48.5 Lakhs across 3 transactions.'
    }
  },
  {
    id: 'node-suspect-1',
    caseId: 'FIR-284-2024',
    label: 'Vikram Sharma @ Vicky',
    type: 'PERSON',
    subType: 'ACCUSED',
    confidence: 0.95,
    riskScore: 92,
    expandableCount: 4,
    metadata: {
      role: 'Prime Suspect / Tele-phisher & SIM Swap Coordinator',
      phoneNumber: '+91 98765 43210',
      address: 'Near Kali Mandir, Karmatar, Jamtara, Jharkhand',
      linkedCases: ['FIR No. 284/2024', 'FIR No. 405/2024'],
      notes: 'Identified through CDR triangulation and voice analysis.'
    }
  },
  {
    id: 'node-phone-1',
    caseId: 'FIR-284-2024',
    label: '+91 98765 43210',
    type: 'PHONE',
    confidence: 0.98,
    riskScore: 88,
    expandableCount: 2,
    metadata: {
      phoneNumber: '+91 98765 43210',
      notes: 'Used to initiate spoofed customer support call and eSIM swap authorization.'
    }
  },
  {
    id: 'node-bank-1',
    caseId: 'FIR-284-2024',
    label: 'HDFC A/c 5010049281726',
    type: 'BANK_ACCOUNT',
    confidence: 0.97,
    riskScore: 85,
    expandableCount: 3,
    metadata: {
      accountNumber: '5010049281726',
      bankName: 'HDFC Bank, Jamtara Branch',
      ifsc: 'HDFC0001298',
      notes: 'Primary 1st-layer mule account receiving ₹18 Lakhs.'
    }
  },
  {
    id: 'node-suspect-2',
    caseId: 'FIR-284-2024',
    label: 'Ramesh Yadav',
    type: 'PERSON',
    subType: 'MULE',
    confidence: 0.94,
    riskScore: 78,
    metadata: {
      role: 'Mule Account Provider',
      address: 'Deoghar, Jharkhand',
      notes: 'Sold bank credentials and debit card for ₹25,000 commission.'
    }
  },
  {
    id: 'node-loc-1',
    caseId: 'FIR-284-2024',
    label: 'Tower JMT-042 (Karmatar)',
    type: 'LOCATION',
    confidence: 0.92,
    riskScore: 65,
    metadata: {
      address: 'Sector 2, Karmatar, Jamtara District, Jharkhand',
      notes: 'Base transceiver station where offending SIM was connected.'
    }
  },
  {
    id: 'node-vehicle-1',
    caseId: 'FIR-284-2024',
    label: 'Swift DL-03C-AS-4921',
    type: 'VEHICLE',
    confidence: 0.88,
    riskScore: 70,
    metadata: {
      vehiclePlate: 'DL-03C-AS-4921',
      notes: 'White Swift captured on CCTV withdrawing cash from Shakarpur ATM.'
    }
  },
  {
    id: 'node-org-1',
    caseId: 'FIR-284-2024',
    label: 'Star Pay Fintech Solutions',
    type: 'ORGANIZATION',
    confidence: 0.82,
    riskScore: 75,
    metadata: {
      notes: 'Shell aggregator used to mask merchant payment gateway routing.'
    }
  }
];

export const INITIAL_GRAPH_EDGES: GraphEdge[] = [
  {
    id: 'edge-case-victim',
    source: 'node-case-284',
    target: 'node-victim-1',
    relationType: 'LINKED_TO_CASE',
    label: 'Complainant',
    confidence: 1.0,
    evidenceId: 'ev-001',
    evidenceSnippet: 'Original FIR complaint registered by Dr. K. Ramanathan on 12-04-2024.',
    dateRange: { firstSeen: '2024-04-09', lastSeen: '2024-04-12' }
  },
  {
    id: 'edge-case-suspect1',
    source: 'node-case-284',
    target: 'node-suspect-1',
    relationType: 'LINKED_TO_CASE',
    label: 'Primary Accused',
    confidence: 0.95,
    evidenceId: 'ev-002',
    evidenceSnippet: 'Voice recognition match and CDR tower correlation report.',
    dateRange: { firstSeen: '2024-04-09', lastSeen: '2024-04-14' }
  },
  {
    id: 'edge-suspect1-phone',
    source: 'node-suspect-1',
    target: 'node-phone-1',
    relationType: 'USED_DEVICE',
    label: 'Used Caller MSISDN',
    confidence: 0.98,
    evidenceId: 'ev-003',
    evidenceSnippet: 'CAF record & mobile handset telemetry linking Vicky to +91 98765 43210.',
    callDurationSeconds: 420,
    dateRange: { firstSeen: '2024-04-08', lastSeen: '2024-04-10' }
  },
  {
    id: 'edge-phone-victim',
    source: 'node-phone-1',
    target: 'node-victim-1',
    relationType: 'COMMUNICATED_WITH',
    label: 'Phishing Call (420s)',
    confidence: 0.99,
    evidenceId: 'ev-004',
    evidenceSnippet: 'CDR entry showing 7-minute inbound call to victim prior to SIM deactivation.',
    callDurationSeconds: 420,
    dateRange: { firstSeen: '2024-04-09 11:23:10', lastSeen: '2024-04-09 11:30:10' }
  },
  {
    id: 'edge-victim-bank',
    source: 'node-victim-1',
    target: 'node-bank-1',
    relationType: 'TRANSFERRED_FUNDS',
    label: 'Fraud Transfer ₹18,00,000',
    confidence: 0.99,
    evidenceId: 'ev-005',
    evidenceSnippet: 'NetBanking IMPS Txn 410928198271 debited from victim account into HDFC mule.',
    amount: 1800000,
    transactionCount: 2,
    dateRange: { firstSeen: '2024-04-09 12:05:00', lastSeen: '2024-04-09 12:12:00' }
  },
  {
    id: 'edge-bank-mule',
    source: 'node-bank-1',
    target: 'node-suspect-2',
    relationType: 'REGISTERED_OWNER',
    label: 'KYC Account Holder',
    confidence: 0.98,
    evidenceId: 'ev-006',
    evidenceSnippet: 'Bank KYC documents identifying Ramesh Yadav as legal account owner.',
    dateRange: { firstSeen: '2024-01-15', lastSeen: '2024-04-14' }
  },
  {
    id: 'edge-suspect1-loc',
    source: 'node-suspect-1',
    target: 'node-loc-1',
    relationType: 'LOCATED_AT',
    label: 'Tower Ping Cluster',
    confidence: 0.94,
    evidenceId: 'ev-007',
    evidenceSnippet: 'Cell tower JMT-042 recorded 14 pings during the period of fund exfiltration.',
    dateRange: { firstSeen: '2024-04-09 11:00:00', lastSeen: '2024-04-09 14:00:00' }
  },
  {
    id: 'edge-suspect2-vehicle',
    source: 'node-suspect-2',
    target: 'node-vehicle-1',
    relationType: 'ASSOCIATED_WITH',
    label: 'ATM Cash Withdrawal Run',
    confidence: 0.88,
    evidenceId: 'ev-008',
    evidenceSnippet: 'CCTV footage matching Swift vehicle with suspect withdrawing ₹2.5L cash.',
    dateRange: { firstSeen: '2024-04-09 14:20:00', lastSeen: '2024-04-09 15:10:00' }
  },
  {
    id: 'edge-bank-org',
    source: 'node-bank-1',
    target: 'node-org-1',
    relationType: 'TRANSFERRED_FUNDS',
    label: 'Routing Layer ₹8,50,000',
    confidence: 0.91,
    evidenceId: 'ev-009',
    evidenceSnippet: 'Internal settlement logs of Star Pay Fintech receiving layer funds.',
    amount: 850000,
    transactionCount: 3,
    dateRange: { firstSeen: '2024-04-09 13:40:00', lastSeen: '2024-04-09 14:15:00' }
  }
];

// Progressive expansion pool: Nodes that are unlocked when investigator clicks "Expand"
export const EXPANSION_NODES_POOL: Record<string, { nodes: GraphNode[]; edges: GraphEdge[] }> = {
  'node-suspect-1': {
    nodes: [
      {
        id: 'node-imei-1',
        caseId: 'FIR-284-2024',
        label: 'IMEI 864209041234567',
        type: 'DEVICE_IMEI',
        confidence: 0.96,
        riskScore: 94,
        metadata: {
          imei: '864209041234567',
          notes: 'OnePlus device used for active SIM swap; multi-case cross hit.'
        }
      },
      {
        id: 'node-ip-1',
        caseId: 'FIR-284-2024',
        label: 'IP 103.212.43.19 (VPN)',
        type: 'IP_ADDRESS',
        confidence: 0.89,
        riskScore: 72,
        metadata: {
          ipAddress: '103.212.43.19',
          notes: 'ProtonVPN exit node logged on telecom self-service portal during eSIM request.'
        }
      },
      {
        id: 'node-accomplice-1',
        caseId: 'FIR-284-2024',
        label: 'Amit Mondal @ Chhotu',
        type: 'PERSON',
        subType: 'SUSPECT',
        confidence: 0.87,
        riskScore: 82,
        metadata: {
          role: 'SIM Runner & Distributor',
          notes: 'Procured pre-activated Airtel SIM cards using forged tribal KYC documents.'
        }
      }
    ],
    edges: [
      {
        id: 'edge-exp-s1-imei',
        source: 'node-suspect-1',
        target: 'node-imei-1',
        relationType: 'USED_DEVICE',
        label: 'Primary Handset',
        confidence: 0.96,
        evidenceId: 'ev-010',
        evidenceSnippet: 'IMEI-MSISDN pairing analysis from telecom gateway logs.',
        dateRange: { firstSeen: '2024-04-01', lastSeen: '2024-04-12' }
      },
      {
        id: 'edge-exp-s1-ip',
        source: 'node-suspect-1',
        target: 'node-ip-1',
        relationType: 'USED_DEVICE',
        label: 'Login Portal IP',
        confidence: 0.89,
        evidenceId: 'ev-011',
        evidenceSnippet: 'Web server access log for self-care portal eSIM switch API.',
        dateRange: { firstSeen: '2024-04-09 11:32:00', lastSeen: '2024-04-09 11:35:00' }
      },
      {
        id: 'edge-exp-s1-accom',
        source: 'node-suspect-1',
        target: 'node-accomplice-1',
        relationType: 'ASSOCIATED_WITH',
        label: 'SIM Procure Channel',
        confidence: 0.87,
        evidenceId: 'ev-012',
        evidenceSnippet: 'Frequent WhatsApp voice calls and encrypted Telegram channel logs.',
        dateRange: { firstSeen: '2024-03-20', lastSeen: '2024-04-10' }
      }
    ]
  },
  'node-bank-1': {
    nodes: [
      {
        id: 'node-crypto-1',
        caseId: 'FIR-284-2024',
        label: 'TRC20: TKb9xL...7q9P',
        type: 'CRYPTO_WALLET',
        confidence: 0.93,
        riskScore: 96,
        metadata: {
          walletAddress: 'TKb9xL3kM17wZ8P2vQ1A9b4n6C7q9P',
          notes: 'Decentralized USDT wallet used for P2P off-ramping into cryptocurrency.'
        }
      },
      {
        id: 'node-bank-layer2',
        caseId: 'FIR-284-2024',
        label: 'ICICI A/c 003101567822',
        type: 'BANK_ACCOUNT',
        confidence: 0.94,
        riskScore: 88,
        metadata: {
          accountNumber: '003101567822',
          bankName: 'ICICI Bank, Asansol',
          notes: 'Layer 2 mule account receiving rapid split payments.'
        }
      }
    ],
    edges: [
      {
        id: 'edge-exp-b1-crypto',
        source: 'node-bank-1',
        target: 'node-crypto-1',
        relationType: 'TRANSFERRED_FUNDS',
        label: 'P2P USDT Buy ₹6,50,000',
        confidence: 0.93,
        evidenceId: 'ev-013',
        evidenceSnippet: 'Binance P2P escrow transaction ID linked to HDFC IMPS transfer reference.',
        amount: 650000,
        dateRange: { firstSeen: '2024-04-09 14:45:00', lastSeen: '2024-04-09 15:00:00' }
      },
      {
        id: 'edge-exp-b1-b2',
        source: 'node-bank-1',
        target: 'node-bank-layer2',
        relationType: 'TRANSFERRED_FUNDS',
        label: 'Layer Split ₹4,00,000',
        confidence: 0.94,
        evidenceId: 'ev-014',
        evidenceSnippet: 'Immediate RTGS payment to second-tier account.',
        amount: 400000,
        dateRange: { firstSeen: '2024-04-09 13:10:00', lastSeen: '2024-04-09 13:15:00' }
      }
    ]
  },
  'node-phone-1': {
    nodes: [
      {
        id: 'node-upi-1',
        caseId: 'FIR-284-2024',
        label: 'vicky99@okaxis',
        type: 'BANK_ACCOUNT',
        confidence: 0.91,
        riskScore: 84,
        metadata: {
          accountNumber: 'vicky99@okaxis',
          notes: 'Virtual Payment Address tied to secondary phone number.'
        }
      }
    ],
    edges: [
      {
        id: 'edge-exp-p1-upi',
        source: 'node-phone-1',
        target: 'node-upi-1',
        relationType: 'ASSOCIATED_WITH',
        label: 'Linked UPI Handle',
        confidence: 0.91,
        evidenceId: 'ev-015',
        evidenceSnippet: 'NPCI UPI resolution table matching phone to VPA.',
        dateRange: { firstSeen: '2024-02-01', lastSeen: '2024-04-10' }
      }
    ]
  }
};

export const INITIAL_TIMELINE: TimelineEvent[] = [
  {
    id: 'tl-01',
    caseId: 'FIR-284-2024',
    timestamp: '2024-04-09 11:23:10',
    title: 'Spoofed Phishing Call Initiated',
    description: 'Suspect calling from +91 98765 43210 engages complainant Dr. Ramanathan posing as Telecom Compliance Officer requesting eSIM validation.',
    eventType: 'COMMUNICATION',
    relatedNodeIds: ['node-suspect-1', 'node-phone-1', 'node-victim-1'],
    evidenceId: 'ev-004',
    evidenceDocumentName: 'CDR_Analysis_9876543210_Jamtara_Tower.xlsx',
    evidenceSnippet: 'CDR Entry Call ID 994821: Duration 420 seconds. Calling MSISDN 9876543210 to 9440123456.',
    confidence: 0.99
  },
  {
    id: 'tl-02',
    caseId: 'FIR-284-2024',
    timestamp: '2024-04-09 11:34:00',
    title: 'Unauthorized eSIM Profile Download',
    description: 'eSIM profile activated on handset IMEI 864209041234567 connected to Tower JMT-042 in Karmatar. Victim original SIM deactivated.',
    eventType: 'DIGITAL_TRACE',
    relatedNodeIds: ['node-suspect-1', 'node-loc-1', 'node-victim-1'],
    evidenceId: 'ev-007',
    evidenceDocumentName: 'CDR_Analysis_9876543210_Jamtara_Tower.xlsx',
    evidenceSnippet: 'HLR de-registration event logged at 11:34:22 UTC+5:30. Over-the-air profile pushed to IMEI 864209041234567.',
    confidence: 0.98
  },
  {
    id: 'tl-03',
    caseId: 'FIR-284-2024',
    timestamp: '2024-04-09 12:05:00',
    title: 'First Fraud IMPS Transaction (₹9,50,000)',
    description: 'Unauthorized NetBanking access using intercepted OTP transferred ₹9.5 Lakhs into HDFC A/c 5010049281726 (Ramesh Yadav).',
    eventType: 'FINANCIAL',
    relatedNodeIds: ['node-victim-1', 'node-bank-1', 'node-suspect-2'],
    evidenceId: 'ev-005',
    evidenceDocumentName: 'HDFC_Mule_Account_Statement_5010049281726.csv',
    evidenceSnippet: 'IMPS Ref 410928198271: Amount ₹9,50,000 credited to Ramesh Yadav.',
    confidence: 1.0
  },
  {
    id: 'tl-04',
    caseId: 'FIR-284-2024',
    timestamp: '2024-04-09 12:12:00',
    title: 'Second Fraud IMPS Transaction (₹8,50,000)',
    description: 'Second consecutive transfer debited to same mule account. Total loss reaches ₹18 Lakhs within 7 minutes.',
    eventType: 'FINANCIAL',
    relatedNodeIds: ['node-victim-1', 'node-bank-1'],
    evidenceId: 'ev-005',
    evidenceDocumentName: 'HDFC_Mule_Account_Statement_5010049281726.csv',
    evidenceSnippet: 'IMPS Ref 410928198902: Amount ₹8,50,000 credited to Ramesh Yadav.',
    confidence: 1.0
  },
  {
    id: 'tl-05',
    caseId: 'FIR-284-2024',
    timestamp: '2024-04-09 13:40:00',
    title: 'Layering to Shell FinTech Gateway',
    description: '₹8.5 Lakhs diverted into Star Pay Fintech merchant pool for rapid laundering.',
    eventType: 'FINANCIAL',
    relatedNodeIds: ['node-bank-1', 'node-org-1'],
    evidenceId: 'ev-009',
    evidenceDocumentName: 'HDFC_Mule_Account_Statement_5010049281726.csv',
    evidenceSnippet: 'Txn STAR-99214: Settlement payout requested to merchant Star Pay Fintech Solutions.',
    confidence: 0.91
  },
  {
    id: 'tl-06',
    caseId: 'FIR-284-2024',
    timestamp: '2024-04-09 14:35:00',
    title: 'Cash Withdrawal at Shakarpur ATM',
    description: 'Suspect spotted arriving in Swift DL-03C-AS-4921 making back-to-back ATM cash withdrawals totaling ₹2,50,000.',
    eventType: 'MOVEMENT',
    relatedNodeIds: ['node-suspect-2', 'node-vehicle-1'],
    evidenceId: 'ev-008',
    evidenceDocumentName: 'CCTV_ATM_Withdrawal_Shakarpur_Logs.pdf',
    evidenceSnippet: 'ATM Booth CCTV Camera 01: Suspect wearing dark cap matching vehicle plate DL-03C-AS-4921.',
    confidence: 0.88
  },
  {
    id: 'tl-07',
    caseId: 'FIR-284-2024',
    timestamp: '2024-04-12 10:15:00',
    title: 'Formal FIR Registered at Cyber Crime PS',
    description: 'Complainant files formal complaint after discovering mobile network disconnection and account depletion.',
    eventType: 'LEGAL',
    relatedNodeIds: ['node-case-284', 'node-victim-1'],
    evidenceId: 'ev-001',
    evidenceDocumentName: 'FIR_284_2024_Cyberabad_Complaint.pdf',
    evidenceSnippet: 'Formal First Information Report signed by Station House Officer under Sec 66C/66D IT Act & 420 IPC.',
    confidence: 1.0
  }
];

export const INITIAL_PATTERNS: PatternAlert[] = [
  {
    id: 'pat-01',
    caseId: 'FIR-284-2024',
    patternType: 'CROSS_CASE_REUSE',
    severity: 'CRITICAL',
    title: 'Hardware IMEI Reused Across 2 Police Jurisdictions',
    description: 'Handset IMEI 864209041234567 active in this case was also logged in Mumbai BKC Cyber PS FIR No. 112/2024 (USDT Digital Arrest case). Strong indication of a centralized syndicated call-center device.',
    affectedNodeIds: ['node-suspect-1', 'node-imei-1'],
    detectionConfidence: 0.98,
    suggestedAction: 'Issue coordinate warrant with BKC Mumbai Cyber PS and request cell tower triangulation on IMEI.',
    evidenceIds: ['ev-003', 'ev-010'],
    detectedAt: '2024-04-13 16:30:00'
  },
  {
    id: 'pat-02',
    caseId: 'FIR-284-2024',
    patternType: 'TRANSACTION_BURST',
    severity: 'HIGH',
    title: 'Rapid Layering & ATM Dispersion Within 120 Minutes',
    description: '₹18,00,000 received was split into 4 outbound transfers within 35 minutes, followed immediately by ATM withdrawals in Delhi-NCR. Classic burst layering pattern designed to evade bank lien freezes.',
    affectedNodeIds: ['node-bank-1', 'node-org-1', 'node-vehicle-1'],
    detectionConfidence: 0.95,
    suggestedAction: 'Dispatch emergency section 91 CrPC notice to Star Pay gateway to freeze merchant settlement account.',
    evidenceIds: ['ev-005', 'ev-008', 'ev-009'],
    detectedAt: '2024-04-13 18:00:00'
  },
  {
    id: 'pat-03',
    caseId: 'FIR-284-2024',
    patternType: 'FREQUENT_LOCATION',
    severity: 'MEDIUM',
    title: 'Nocturnal Communication Cluster at Karmatar Cell Tower',
    description: '87% of all outbound phishing calls and SMS blasts originated from a 500-meter radius around Tower JMT-042 between 10:00 AM and 02:00 PM on weekdays.',
    affectedNodeIds: ['node-suspect-1', 'node-phone-1', 'node-loc-1'],
    detectionConfidence: 0.91,
    suggestedAction: 'Coordinate ground raid with Jharkhand Cyber Cell at Karmatar coordinates 24.1678 N, 86.8421 E.',
    evidenceIds: ['ev-004', 'ev-007'],
    detectedAt: '2024-04-14 09:15:00'
  },
  {
    id: 'pat-04',
    caseId: 'FIR-284-2024',
    patternType: 'POTENTIAL_CONNECTOR',
    severity: 'HIGH',
    title: 'Potential Connector Node Identified (Vikram Sharma)',
    description: 'Graph connectivity indicates Vikram Sharma acts as a structural bridge connecting the telecom phishing cell in Jamtara with the NCR mule cash-out network.',
    affectedNodeIds: ['node-suspect-1', 'node-bank-1', 'node-phone-1'],
    detectionConfidence: 0.92,
    suggestedAction: 'Prioritize physical interception of Vikram Sharma to dismantle both operations concurrently.',
    evidenceIds: ['ev-002', 'ev-003'],
    detectedAt: '2024-04-14 12:40:00'
  }
];

export const INITIAL_ANALYTICS: NetworkAnalytics = {
  caseId: 'FIR-284-2024',
  totalNodes: 9,
  totalEdges: 9,
  densityScore: 0.22,
  clusteringCoefficient: 0.38,
  bridgeNodesCount: 2,
  highConnectivityEntities: [
    {
      nodeId: 'node-suspect-1',
      label: 'Vikram Sharma @ Vicky',
      type: 'PERSON',
      degreeCentrality: 0.78,
      betweennessCentrality: 0.86,
      investigativeLabel: 'Potential Connector',
      caseParticipationCount: 2,
      connectedIdentifiersCount: 4,
      communityClusterId: 1
    },
    {
      nodeId: 'node-bank-1',
      label: 'HDFC A/c 5010049281726',
      type: 'BANK_ACCOUNT',
      degreeCentrality: 0.67,
      betweennessCentrality: 0.72,
      investigativeLabel: 'High Connectivity',
      caseParticipationCount: 2,
      connectedIdentifiersCount: 3,
      communityClusterId: 1
    },
    {
      nodeId: 'node-phone-1',
      label: '+91 98765 43210',
      type: 'PHONE',
      degreeCentrality: 0.55,
      betweennessCentrality: 0.45,
      investigativeLabel: 'Central Hub',
      caseParticipationCount: 2,
      connectedIdentifiersCount: 2,
      communityClusterId: 2
    },
    {
      nodeId: 'node-victim-1',
      label: 'Dr. K. Ramanathan',
      type: 'PERSON',
      degreeCentrality: 0.44,
      betweennessCentrality: 0.31,
      investigativeLabel: 'Bridge Disseminator',
      caseParticipationCount: 1,
      connectedIdentifiersCount: 2,
      communityClusterId: 2
    }
  ]
};

export const INITIAL_EVIDENCE: EvidenceChunk[] = [
  {
    id: 'ev-001',
    caseId: 'FIR-284-2024',
    documentId: 'doc-001',
    documentTitle: 'FIR_284_2024_Cyberabad_Complaint.pdf',
    documentType: 'FIR_REPORT',
    chainOfCustody: 'Seized by IO Rajeshwar Rao on 12-04-2024; Hash SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    ingestionDate: '2024-04-12',
    pageNumber: 1,
    chunkSnippet: 'Complainant Dr. K. Ramanathan states that on 09-04-2024 at approx 11:20 AM, an incoming call was received on his official number +91 94401 23456 from an individual claiming to represent Airtel KYC division (+91 98765 43210). The individual warned that complainant SIM card would be blocked in 2 hours unless eSIM confirmation code was shared.',
    verifiedStatus: true,
    associatedNodeIds: ['node-case-284', 'node-victim-1', 'node-phone-1'],
    tags: ['FIR', 'Complaint', 'eSIM Phishing']
  },
  {
    id: 'ev-002',
    caseId: 'FIR-284-2024',
    documentId: 'doc-001',
    documentTitle: 'FIR_284_2024_Cyberabad_Complaint.pdf',
    documentType: 'FIR_REPORT',
    chainOfCustody: 'Verified by Cyber Forensics Lab, Cyberabad; Forensic Certificate Form 65B attached.',
    ingestionDate: '2024-04-12',
    pageNumber: 2,
    chunkSnippet: 'Audio analysis of recorded customer helpline call reveals voice patterns matching suspect Vikram Sharma alias Vicky (earlier booked in Jamtara PS Cr. No. 44/2022). Suspect instructed victim to forward a 32-digit confirmation code.',
    verifiedStatus: true,
    associatedNodeIds: ['node-suspect-1', 'node-case-284'],
    tags: ['Voice Forensics', 'Accused Identification']
  },
  {
    id: 'ev-003',
    caseId: 'FIR-284-2024',
    documentId: 'doc-002',
    documentTitle: 'CDR_Analysis_9876543210_Jamtara_Tower.xlsx',
    documentType: 'CDR_ANALYSIS',
    chainOfCustody: 'Extracted directly from Telecom Service Provider LIMS Server under Sec 91 CrPC mandate.',
    ingestionDate: '2024-04-13',
    pageNumber: 4,
    chunkSnippet: 'MSISDN +91 98765 43210 CDR Log: Handset IMEI recorded as 864209041234567. Cell ID 404-45-1042-2481 located in Karmatar block, Jamtara.',
    verifiedStatus: true,
    associatedNodeIds: ['node-suspect-1', 'node-phone-1', 'node-loc-1'],
    tags: ['CDR', 'IMEI', 'Tower Location']
  },
  {
    id: 'ev-004',
    caseId: 'FIR-284-2024',
    documentId: 'doc-002',
    documentTitle: 'CDR_Analysis_9876543210_Jamtara_Tower.xlsx',
    documentType: 'CDR_ANALYSIS',
    chainOfCustody: 'Verified by Sub-Inspector N. Reddy, CDR Analysis Wing.',
    ingestionDate: '2024-04-13',
    pageNumber: 6,
    chunkSnippet: 'Call record confirms 420 seconds call duration between 9876543210 and 9440123456 from 11:23:10 to 11:30:10. Immediately followed by IMSI handover request.',
    verifiedStatus: true,
    associatedNodeIds: ['node-phone-1', 'node-victim-1'],
    tags: ['CDR', 'Call Duration']
  },
  {
    id: 'ev-005',
    caseId: 'FIR-284-2024',
    documentId: 'doc-003',
    documentTitle: 'HDFC_Mule_Account_Statement_5010049281726.csv',
    documentType: 'BANK_STATEMENT',
    chainOfCustody: 'Received via FIU-IND / LEA Portal from HDFC Bank Nodal Officer.',
    ingestionDate: '2024-04-14',
    pageNumber: 1,
    chunkSnippet: 'Txn Date: 09-04-2024 12:05:14. IMPS INWARD 410928198271: Amount ₹9,50,000.00 from Dr. K. Ramanathan (SBI A/c ...8921) to HDFC A/c 5010049281726. Second transfer of ₹8,50,000 received at 12:12:02.',
    verifiedStatus: true,
    associatedNodeIds: ['node-victim-1', 'node-bank-1'],
    tags: ['Financial Fraud', 'IMPS Statement']
  },
  {
    id: 'ev-006',
    caseId: 'FIR-284-2024',
    documentId: 'doc-003',
    documentTitle: 'HDFC_Mule_Account_Statement_5010049281726.csv',
    documentType: 'BANK_STATEMENT',
    chainOfCustody: 'Certified under Bankers Books Evidence Act, 1891.',
    ingestionDate: '2024-04-14',
    pageNumber: 2,
    chunkSnippet: 'Account opening KYC dated 15-01-2024: Name: Ramesh Yadav, Resident: Village Sarath, Deoghar, Jharkhand. Aadhaar: XXXX-XXXX-4019.',
    verifiedStatus: true,
    associatedNodeIds: ['node-bank-1', 'node-suspect-2'],
    tags: ['KYC', 'Mule Account']
  },
  {
    id: 'ev-007',
    caseId: 'FIR-284-2024',
    documentId: 'doc-002',
    documentTitle: 'CDR_Analysis_9876543210_Jamtara_Tower.xlsx',
    documentType: 'CDR_ANALYSIS',
    chainOfCustody: 'Certified by Telecom Service Provider Nodal Officer.',
    ingestionDate: '2024-04-13',
    pageNumber: 8,
    chunkSnippet: 'BTS Lat/Long coordinates: 24.1678° N, 86.8421° E (Tower JMT-042). All 14 data sessions during OTP interception logged under Sector 2 antenna azimuth 120°.',
    verifiedStatus: true,
    associatedNodeIds: ['node-loc-1', 'node-suspect-1'],
    tags: ['Cell Tower', 'GPS Coordinates']
  },
  {
    id: 'ev-008',
    caseId: 'FIR-284-2024',
    documentId: 'doc-004',
    documentTitle: 'CCTV_ATM_Withdrawal_Shakarpur_Logs.pdf',
    documentType: 'SEIZURE_MEMO',
    chainOfCustody: 'Seized hard disk footage under Section 102 CrPC from Axis Bank ATM Shakarpur Delhi.',
    ingestionDate: '2024-04-15',
    pageNumber: 3,
    chunkSnippet: 'Footage timestamp 09-04-2024 14:22:15: A white Maruti Suzuki Swift bearing registration plate DL-03C-AS-4921 pulls over. Individual matching Ramesh Yadav enters kiosk with debit card.',
    verifiedStatus: false,
    associatedNodeIds: ['node-suspect-2', 'node-vehicle-1'],
    tags: ['CCTV', 'ATM Cash-out', 'Vehicle']
  },
  {
    id: 'ev-009',
    caseId: 'FIR-284-2024',
    documentId: 'doc-003',
    documentTitle: 'HDFC_Mule_Account_Statement_5010049281726.csv',
    documentType: 'BANK_STATEMENT',
    chainOfCustody: 'Certified bank extract.',
    ingestionDate: '2024-04-14',
    pageNumber: 3,
    chunkSnippet: 'Outward transfer of ₹8,50,000 sent to Star Pay Fintech Solutions (Merchant MID: STARPAY99214) via Payment Aggregator gateway.',
    verifiedStatus: true,
    associatedNodeIds: ['node-bank-1', 'node-org-1'],
    tags: ['FinTech Layering', 'Gateway Transfer']
  },
  {
    id: 'ev-010',
    caseId: 'FIR-284-2024',
    documentId: 'doc-002',
    documentTitle: 'CDR_Analysis_9876543210_Jamtara_Tower.xlsx',
    documentType: 'CDR_ANALYSIS',
    chainOfCustody: 'Cross-jurisdiction match request via National Cybercrime Reporting Portal (NCRP).',
    ingestionDate: '2024-04-13',
    pageNumber: 12,
    chunkSnippet: 'Cross-reference query: IMEI 864209041234567 matches active hardware in FIR 112/2024 BKC Mumbai with 99% telemetry correlation.',
    verifiedStatus: true,
    associatedNodeIds: ['node-imei-1'],
    tags: ['Cross-Case', 'IMEI Match']
  }
];
