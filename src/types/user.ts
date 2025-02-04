import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Timestamp;
  gender: string;
  bio: string;
  location: string;
  interestedIn: string;
  interests: string[];
  occupation: string;
  education: string;
  profilePicture?: string;
  lastActive: Date;
  isOnline: boolean;
  matches: string[];
  blockedUsers: string[];
  preferences: {
    ageRange: {
      min: number;
      max: number;
    };
    distance: number;
    showMe: boolean;
  };
} 