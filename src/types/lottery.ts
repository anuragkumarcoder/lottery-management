// Data Dictionary Types corresponding to FR-1 through FR-5 and Stores D1 through D5

export type UserRole = 'Participant' | 'Administrator';
export type UserStatus = 'Active' | 'Suspended';

// User Master Table (D1)
export interface UserRecord {
  User_ID: string;
  Name: string;
  Email: string;
  Phone: string;
  Password_Hash: string;
  Role: UserRole;
  Status: UserStatus;
  CreatedAt: string;
}

export type EventStatus = 'Upcoming' | 'Active' | 'Locked' | 'Closed' | 'Drawn';

export interface PrizeTier {
  rank: number;
  title: string;
  amount: number;
  winnersCount: number;
}

// Lottery Event Master (D2)
export interface LotteryEventRecord {
  Event_ID: string;
  Title: string;
  Price: number;
  Pool_Limit: number;
  Sold_Count: number;
  Status: EventStatus;
  Opening_Time: string; // ISO
  Closing_Time: string; // ISO
  Prize_Breakdown: PrizeTier[];
  Description?: string;
  CreatedAt: string;
}

export type TicketStatus = 'Valid' | 'Winner' | 'Expired' | 'Void';

// Ticket Master Table (D3)
export interface TicketRecord {
  Ticket_ID: string;
  Event_ID: string;
  Event_Title: string;
  User_ID: string;
  User_Name: string;
  Ticket_Number: string; // Unique Serial Number
  Purchase_Price: number;
  Txn_ID: string;
  Status: TicketStatus;
  PurchasedAt: string;
}

// Transaction Log (D4)
export interface TransactionRecord {
  Txn_ID: string;
  User_ID: string;
  User_Name: string;
  Event_ID: string;
  Event_Title: string;
  Ticket_Count: number;
  Amount: number;
  Method: string;
  Status: 'Success' | 'Failed';
  Timestamp: string;
}

export type ClaimStatus = 'Unclaimed' | 'Pending' | 'Approved' | 'Rejected' | 'Paid Out';

export interface AuditLogEntry {
  action: string;
  adminId: string;
  adminName: string;
  timestamp: string;
  note?: string;
}

export interface IdentityDoc {
  fileName: string;
  fileSize: string;
  fileType: string;
  docType?: string;
  fileData: string; // Base64 data URL
  uploadedAt: string;
}

// Winner Master Table (D5)
export interface WinnerRecord {
  Winner_ID: string;
  Event_ID: string;
  Event_Title: string;
  Ticket_ID: string;
  Ticket_Number: string;
  User_ID: string;
  User_Name: string;
  User_Email: string;
  User_Phone: string;
  Prize: string;
  Prize_Amount: number;
  Draw_Timestamp: string;
  Claim_Status: ClaimStatus;
  Claim_Submitted_At?: string;
  Identity_Doc?: IdentityDoc;
  Admin_Notes?: string;
  Audit_Log: AuditLogEntry[];
}

// Data Flow Types
export interface TicketPurchaseRequest {
  User_ID: string;
  Event_ID: string;
  Count: number;
  Method: string;
}

export interface PaymentConfirmation {
  Txn_ID: string;
  Status: 'Success' | 'Failed';
  Amount: number;
  Timestamp: string;
}

export interface DrawTriggerCommand {
  Event_ID: string;
  Admin_ID: string;
  Timestamp: string;
}
