export interface StopSmokingLog {
  uid: string;
  intensity: number;
  nrtUsed: boolean;
  timestamp: Date;
}

export interface SupportContact {
  name: string;
  relation: string;
  phone: string;
}

export interface SafetyPlan {
  uid: string;
  warningSigns: string[];
  copingStrategies: string[];
  supportContacts: SupportContact[];
  environmentSafety: string;
  lastUpdated: Date;
  sharedWithCaseManager: boolean;
}
