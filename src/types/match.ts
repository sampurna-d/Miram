export interface Match {
  id: string;
  name: string;
  photoURL: string;
  avatar: string;
  lastMessage?: string;
  age: number;
  interests: string[];
  bio: string;
  location?: string;
  users: [string, string];
  createdAt: Date;
  lastActivity: Date;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date;
  gender: string;
  bio: string;
  location: string;
  interestedIn: string;
  interests: string[];
  occupation: string;
  education: string;
  profilePicture: string;
  avatar: string;
  preferences: {
    ageRange: {
      min: number;
      max: number;
    };
    distance: number;
    showMe: boolean;
  };
  lastActive?: Date;
  isOnline?: boolean;
  matches?: string[];
  blockedUsers?: string[];
} 