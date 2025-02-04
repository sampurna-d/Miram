export interface Match {
  id: string;
  users: [string, string];
  createdAt: Date;
  lastMessage: string | null;
  lastActivity: Date;
  interests?: string[];
  age?: number;
  bio?: string;
  location?: string;
  photoURL?: string;
  name?: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
} 