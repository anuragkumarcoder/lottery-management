import {
  UserRecord,
  LotteryEventRecord,
  TicketRecord,
  TransactionRecord,
  WinnerRecord,
  ClaimStatus,
  IdentityDoc
} from '../types/lottery';

const STORAGE_KEYS = {
  D1_USERS: 'lms_d1_users',
  D2_EVENTS: 'lms_d2_events',
  D3_TICKETS: 'lms_d3_tickets',
  D4_TRANSACTIONS: 'lms_d4_transactions',
  D5_WINNERS: 'lms_d5_winners',
  INITIALIZED: 'lms_initialized_v2'
};

// Initial Seed Data for Demo & Evaluation
const SEED_USERS: UserRecord[] = [
  {
    User_ID: 'USR-1001',
    Name: 'Anurag Kumar (Admin)',
    Email: 'admin@lottery.com',
    Phone: '+91 9876543210',
    Password_Hash: 'admin123', // In demo, plain hashed check
    Role: 'Administrator',
    Status: 'Active',
    CreatedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
  },
  {
    User_ID: 'USR-2001',
    Name: 'Rahul Sharma',
    Email: 'rahul@example.com',
    Phone: '+91 9123456780',
    Password_Hash: 'password123',
    Role: 'Participant',
    Status: 'Active',
    CreatedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
  },
  {
    User_ID: 'USR-2002',
    Name: 'Priya Patel',
    Email: 'priya@example.com',
    Phone: '+91 9876501234',
    Password_Hash: 'password123',
    Role: 'Participant',
    Status: 'Active',
    CreatedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
  }
];

const SEED_EVENTS: LotteryEventRecord[] = [
  {
    Event_ID: 'EVT-101',
    Title: 'Mega Gold Jackpot 2026',
    Price: 50,
    Pool_Limit: 500,
    Sold_Count: 142,
    Status: 'Active',
    Opening_Time: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    Closing_Time: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    Prize_Breakdown: [
      { rank: 1, title: '1st Prize (Grand)', amount: 15000, winnersCount: 1 },
      { rank: 2, title: '2nd Prize (Gold)', amount: 5000, winnersCount: 2 },
      { rank: 3, title: '3rd Prize (Silver)', amount: 1000, winnersCount: 5 }
    ],
    Description: 'Our flagship monthly mega draw with guaranteed gold prizes and transparent selection.',
    CreatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  },
  {
    Event_ID: 'EVT-102',
    Title: 'Weekend Express Bonanza',
    Price: 20,
    Pool_Limit: 200,
    Sold_Count: 48,
    Status: 'Active',
    Opening_Time: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    Closing_Time: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
    Prize_Breakdown: [
      { rank: 1, title: '1st Prize (Cash Jackpot)', amount: 3000, winnersCount: 1 },
      { rank: 2, title: '2nd Prize (Runner Up)', amount: 1000, winnersCount: 2 }
    ],
    Description: 'Fast weekend draw with high winning odds and instant claim processing.',
    CreatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    Event_ID: 'EVT-103',
    Title: 'Midnight Special Draw (Closed - Ready for Draw Execution)',
    Price: 25,
    Pool_Limit: 100,
    Sold_Count: 100,
    Status: 'Closed', // Explicitly closed for testing FR-4 (Admin Draw Trigger)
    Opening_Time: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    Closing_Time: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), // Ended 1 hr ago
    Prize_Breakdown: [
      { rank: 1, title: 'Grand Jackpot', amount: 2000, winnersCount: 1 },
      { rank: 2, title: 'Consolation Prize', amount: 500, winnersCount: 2 }
    ],
    Description: 'This event reached its closing threshold and is ready for the Administrator to trigger the random draw.',
    CreatedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
  }
];

const SEED_TICKETS: TicketRecord[] = [
  // Seed some tickets for the closed event EVT-103 so Admin can immediately trigger the draw
  {
    Ticket_ID: 'TKT-9001',
    Event_ID: 'EVT-103',
    Event_Title: 'Midnight Special Draw (Closed - Ready for Draw Execution)',
    User_ID: 'USR-2001',
    User_Name: 'Rahul Sharma',
    Ticket_Number: 'LOTTO-EVT103-882190',
    Purchase_Price: 25,
    Txn_ID: 'TXN-8001',
    Status: 'Valid',
    PurchasedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    Ticket_ID: 'TKT-9002',
    Event_ID: 'EVT-103',
    Event_Title: 'Midnight Special Draw (Closed - Ready for Draw Execution)',
    User_ID: 'USR-2001',
    User_Name: 'Rahul Sharma',
    Ticket_Number: 'LOTTO-EVT103-882191',
    Purchase_Price: 25,
    Txn_ID: 'TXN-8001',
    Status: 'Valid',
    PurchasedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    Ticket_ID: 'TKT-9003',
    Event_ID: 'EVT-103',
    Event_Title: 'Midnight Special Draw (Closed - Ready for Draw Execution)',
    User_ID: 'USR-2002',
    User_Name: 'Priya Patel',
    Ticket_Number: 'LOTTO-EVT103-914302',
    Purchase_Price: 25,
    Txn_ID: 'TXN-8002',
    Status: 'Valid',
    PurchasedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    Ticket_ID: 'TKT-9004',
    Event_ID: 'EVT-103',
    Event_Title: 'Midnight Special Draw (Closed - Ready for Draw Execution)',
    User_ID: 'USR-2002',
    User_Name: 'Priya Patel',
    Ticket_Number: 'LOTTO-EVT103-914303',
    Purchase_Price: 25,
    Txn_ID: 'TXN-8002',
    Status: 'Valid',
    PurchasedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  }
];

const SEED_TRANSACTIONS: TransactionRecord[] = [
  {
    Txn_ID: 'TXN-8001',
    User_ID: 'USR-2001',
    User_Name: 'Rahul Sharma',
    Event_ID: 'EVT-103',
    Event_Title: 'Midnight Special Draw (Closed - Ready for Draw Execution)',
    Ticket_Count: 2,
    Amount: 50,
    Method: 'Simulated Gateway / Digital Card',
    Status: 'Success',
    Timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    Txn_ID: 'TXN-8002',
    User_ID: 'USR-2002',
    User_Name: 'Priya Patel',
    Event_ID: 'EVT-103',
    Event_Title: 'Midnight Special Draw (Closed - Ready for Draw Execution)',
    Ticket_Count: 2,
    Amount: 50,
    Method: 'Simulated Gateway / Digital Card',
    Status: 'Success',
    Timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  }
];

class StorageService {
  constructor() {
    this.initDatabase();
    this.enforceAutomaticExpiry();
  }

  public initDatabase(forceReset: boolean = false): void {
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      localStorage.setItem(STORAGE_KEYS.D1_USERS, JSON.stringify(SEED_USERS));
      localStorage.setItem(STORAGE_KEYS.D2_EVENTS, JSON.stringify(SEED_EVENTS));
      localStorage.setItem(STORAGE_KEYS.D3_TICKETS, JSON.stringify(SEED_TICKETS));
      localStorage.setItem(STORAGE_KEYS.D4_TRANSACTIONS, JSON.stringify(SEED_TRANSACTIONS));
      localStorage.setItem(STORAGE_KEYS.D5_WINNERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  // FR-2.4: Automatic Expiry & Locking:
  // The system shall automatically lock ticket purchases for any event whose
  // current timestamp exceeds its defined closing threshold, updating its state in D2.
  public enforceAutomaticExpiry(): void {
    const events = this.getEvents();
    const now = new Date().getTime();
    let updated = false;

    const modified = events.map(evt => {
      if (evt.Status === 'Active' || evt.Status === 'Upcoming') {
        const closingTime = new Date(evt.Closing_Time).getTime();
        const openingTime = new Date(evt.Opening_Time).getTime();

        if (now >= closingTime) {
          updated = true;
          return { ...evt, Status: 'Closed' as const };
        } else if (now < openingTime && evt.Status !== 'Upcoming') {
          updated = true;
          return { ...evt, Status: 'Upcoming' as const };
        } else if (now >= openingTime && now < closingTime && evt.Status === 'Upcoming') {
          updated = true;
          return { ...evt, Status: 'Active' as const };
        }
      }
      return evt;
    });

    if (updated) {
      this.saveEvents(modified);
    }
  }

  // --- D1: USER MASTER TABLE ---
  public getUsers(): UserRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.D1_USERS);
    return data ? JSON.parse(data) : [];
  }

  public saveUsers(users: UserRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.D1_USERS, JSON.stringify(users));
  }

  public findUserByEmail(email: string): UserRecord | undefined {
    return this.getUsers().find(u => u.Email.toLowerCase() === email.trim().toLowerCase());
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.getUsers().find(u => u.User_ID === id);
  }

  public createUser(user: Omit<UserRecord, 'User_ID' | 'CreatedAt'>): UserRecord {
    const users = this.getUsers();
    const nextNum = 2000 + users.length + 1;
    const newUser: UserRecord = {
      ...user,
      User_ID: `USR-${nextNum}`,
      CreatedAt: new Date().toISOString()
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  public updateUser(userId: string, updates: Partial<UserRecord>): UserRecord | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.User_ID === userId);
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates };
    this.saveUsers(users);
    return users[index];
  }

  // --- D2: LOTTERY EVENT MASTER ---
  public getEvents(): LotteryEventRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.D2_EVENTS);
    return data ? JSON.parse(data) : [];
  }

  public saveEvents(events: LotteryEventRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.D2_EVENTS, JSON.stringify(events));
  }

  public getEventById(id: string): LotteryEventRecord | undefined {
    this.enforceAutomaticExpiry();
    return this.getEvents().find(e => e.Event_ID === id);
  }

  public createEvent(data: Omit<LotteryEventRecord, 'Event_ID' | 'Sold_Count' | 'CreatedAt'>): LotteryEventRecord {
    const events = this.getEvents();
    const nextId = `EVT-${100 + events.length + 1}`;
    const newEvent: LotteryEventRecord = {
      ...data,
      Event_ID: nextId,
      Sold_Count: 0,
      CreatedAt: new Date().toISOString()
    };
    events.unshift(newEvent);
    this.saveEvents(events);
    return newEvent;
  }

  public updateEvent(eventId: string, updates: Partial<LotteryEventRecord>): LotteryEventRecord | null {
    const events = this.getEvents();
    const idx = events.findIndex(e => e.Event_ID === eventId);
    if (idx === -1) return null;
    events[idx] = { ...events[idx], ...updates };
    this.saveEvents(events);
    return events[idx];
  }

  // --- D3: TICKET MASTER TABLE ---
  public getTickets(): TicketRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.D3_TICKETS);
    return data ? JSON.parse(data) : [];
  }

  public saveTickets(tickets: TicketRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.D3_TICKETS, JSON.stringify(tickets));
  }

  public getTicketsByUser(userId: string): TicketRecord[] {
    return this.getTickets().filter(t => t.User_ID === userId);
  }

  public getTicketsByEvent(eventId: string): TicketRecord[] {
    return this.getTickets().filter(t => t.Event_ID === eventId && t.Status !== 'Void');
  }

  // --- D4: TRANSACTION LOG ---
  public getTransactions(): TransactionRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.D4_TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  }

  public createTransaction(txn: Omit<TransactionRecord, 'Txn_ID' | 'Timestamp'>): TransactionRecord {
    const txns = this.getTransactions();
    const newTxn: TransactionRecord = {
      ...txn,
      Txn_ID: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      Timestamp: new Date().toISOString()
    };
    txns.unshift(newTxn);
    localStorage.setItem(STORAGE_KEYS.D4_TRANSACTIONS, JSON.stringify(txns));
    return newTxn;
  }

  // FR-3.2, FR-3.4, FR-3.5: Execute Purchase & Ticket Generation
  public purchaseTickets(
    userId: string,
    userName: string,
    eventId: string,
    count: number,
    method: string = 'Simulated Instant Gateway'
  ): { success: boolean; message: string; tickets: TicketRecord[]; txn?: TransactionRecord } {
    this.enforceAutomaticExpiry();
    const event = this.getEventById(eventId);
    if (!event) return { success: false, message: 'Event not found.', tickets: [] };
    if (event.Status !== 'Active') {
      return { success: false, message: `Cannot purchase tickets: Event is ${event.Status}.`, tickets: [] };
    }

    // FR-3.2: Inventory & Availability Check
    const remaining = event.Pool_Limit - event.Sold_Count;
    if (count > remaining) {
      return {
        success: false,
        message: `Requested quantity (${count}) exceeds remaining ticket pool (${remaining}).`,
        tickets: []
      };
    }

    const totalAmount = event.Price * count;

    // FR-3.4: Transaction Logging
    const txn = this.createTransaction({
      User_ID: userId,
      User_Name: userName,
      Event_ID: eventId,
      Event_Title: event.Title,
      Ticket_Count: count,
      Amount: totalAmount,
      Method: method,
      Status: 'Success'
    });

    // FR-3.5: Ticket Generation & Assignment
    const allTickets = this.getTickets();
    const newTickets: TicketRecord[] = [];

    for (let i = 0; i < count; i++) {
      // Secure unique serial number
      const randomSeq = Math.floor(100000 + Math.random() * 900000);
      const ticketNum = `LOTTO-${event.Event_ID.replace('-', '')}-${randomSeq}`;
      const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

      const tkt: TicketRecord = {
        Ticket_ID: ticketId,
        Event_ID: event.Event_ID,
        Event_Title: event.Title,
        User_ID: userId,
        User_Name: userName,
        Ticket_Number: ticketNum,
        Purchase_Price: event.Price,
        Txn_ID: txn.Txn_ID,
        Status: 'Valid',
        PurchasedAt: new Date().toISOString()
      };
      newTickets.push(tkt);
      allTickets.push(tkt);
    }

    this.saveTickets(allTickets);

    // Update D2 sold count & lock if full
    const newSoldCount = event.Sold_Count + count;
    this.updateEvent(eventId, {
      Sold_Count: newSoldCount,
      Status: newSoldCount >= event.Pool_Limit ? 'Locked' : event.Status
    });

    return {
      success: true,
      message: 'Tickets successfully purchased and confirmed!',
      tickets: newTickets,
      txn
    };
  }

  // --- D5: WINNER MASTER TABLE & FR-4 DRAW EXECUTION ---
  public getWinners(): WinnerRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.D5_WINNERS);
    return data ? JSON.parse(data) : [];
  }

  public saveWinners(winners: WinnerRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.D5_WINNERS, JSON.stringify(winners));
  }

  public getWinnersByUser(userId: string): WinnerRecord[] {
    return this.getWinners().filter(w => w.User_ID === userId);
  }

  // FR-4: Automated Random Winner Draw Execution
  public executeDraw(eventId: string, adminId: string, adminName: string): { success: boolean; message: string; winners: WinnerRecord[] } {
    const event = this.getEventById(eventId);
    if (!event) return { success: false, message: 'Event not found.', winners: [] };
    if (event.Status === 'Drawn') {
      return { success: false, message: 'This event has already been drawn.', winners: [] };
    }

    // FR-4.2: Eligible Ticket Retrieval
    const eligibleTickets = this.getTicketsByEvent(eventId);
    if (eligibleTickets.length === 0) {
      return { success: false, message: 'No eligible tickets found for this event to execute draw.', winners: [] };
    }

    // FR-4.3: Unbiased Random Selection Algorithm (Web Crypto API)
    // Fisher-Yates shuffle with cryptographic random values
    const shuffled = [...eligibleTickets];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const randomBuffer = new Uint32Array(1);
      window.crypto.getRandomValues(randomBuffer);
      const j = randomBuffer[0] % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const allWinners = this.getWinners();
    const newEventWinners: WinnerRecord[] = [];
    const users = this.getUsers();
    let ticketIndex = 0;

    // Allocate prizes according to Prize_Breakdown
    for (const tier of event.Prize_Breakdown) {
      for (let w = 0; w < tier.winnersCount; w++) {
        if (ticketIndex >= shuffled.length) break; // If more prizes than tickets sold

        const winningTicket = shuffled[ticketIndex];
        const winnerUser = users.find(u => u.User_ID === winningTicket.User_ID);

        const winnerRecord: WinnerRecord = {
          Winner_ID: `WIN-${Math.floor(1000 + Math.random() * 9000)}`,
          Event_ID: event.Event_ID,
          Event_Title: event.Title,
          Ticket_ID: winningTicket.Ticket_ID,
          Ticket_Number: winningTicket.Ticket_Number,
          User_ID: winningTicket.User_ID,
          User_Name: winningTicket.User_Name,
          User_Email: winnerUser ? winnerUser.Email : 'unknown@example.com',
          User_Phone: winnerUser ? winnerUser.Phone : 'N/A',
          Prize: `${tier.title} (Rank ${tier.rank})`,
          Prize_Amount: tier.amount,
          Draw_Timestamp: new Date().toISOString(),
          Claim_Status: 'Unclaimed',
          Audit_Log: [
            {
              action: 'Draw Conducted & Winner Selected',
              adminId,
              adminName,
              timestamp: new Date().toISOString(),
              note: `Cryptographically unbiased pseudo-random selection allocated ${tier.title}.`
            }
          ]
        };

        newEventWinners.push(winnerRecord);
        allWinners.unshift(winnerRecord);

        // Mark ticket as Winner in D3
        this.markTicketAsWinner(winningTicket.Ticket_ID);
        ticketIndex++;
      }
    }

    this.saveWinners(allWinners);

    // FR-4.4: Result Persistence - Update parent event status to 'Drawn' in D2
    this.updateEvent(eventId, { Status: 'Drawn' });

    return {
      success: true,
      message: `Draw successfully executed! ${newEventWinners.length} winner(s) selected.`,
      winners: newEventWinners
    };
  }

  private markTicketAsWinner(ticketId: string): void {
    const tickets = this.getTickets();
    const t = tickets.find(x => x.Ticket_ID === ticketId);
    if (t) {
      t.Status = 'Winner';
      this.saveTickets(tickets);
    }
  }

  // FR-5.2: Claim Submission Workflow
  public submitClaim(winnerId: string, identityDoc: IdentityDoc): { success: boolean; message: string } {
    const winners = this.getWinners();
    const win = winners.find(w => w.Winner_ID === winnerId);
    if (!win) return { success: false, message: 'Winning record not found.' };

    win.Claim_Status = 'Pending';
    win.Claim_Submitted_At = new Date().toISOString();
    win.Identity_Doc = identityDoc;
    win.Audit_Log.push({
      action: 'Claim Submitted by Winner',
      adminId: 'SYSTEM',
      adminName: 'Participant Portal',
      timestamp: new Date().toISOString(),
      note: `Identity document attached: ${identityDoc.fileName} (${identityDoc.docType}).`
    });

    this.saveWinners(winners);
    return { success: true, message: 'Claim successfully submitted with verification documents!' };
  }

  // FR-5.3 & FR-5.4: Admin Review & Verification, Audit Traceability
  public updateClaimDecision(
    winnerId: string,
    decision: ClaimStatus,
    adminId: string,
    adminName: string,
    notes: string
  ): { success: boolean; message: string } {
    const winners = this.getWinners();
    const win = winners.find(w => w.Winner_ID === winnerId);
    if (!win) return { success: false, message: 'Winning record not found.' };

    win.Claim_Status = decision;
    win.Admin_Notes = notes;
    win.Audit_Log.push({
      action: `Claim Status Updated to: ${decision}`,
      adminId,
      adminName,
      timestamp: new Date().toISOString(),
      note: notes
    });

    this.saveWinners(winners);
    return { success: true, message: `Claim has been marked as ${decision}.` };
  }
}

export const storageService = new StorageService();
