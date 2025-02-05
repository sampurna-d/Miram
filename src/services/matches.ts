import { db } from '../firebase';
import { 
  collection, addDoc, deleteDoc, doc, query, 
  where, getDocs, updateDoc, arrayUnion, arrayRemove, 
  getDoc
} from 'firebase/firestore';
import { storage } from '../firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { Match } from '../types/match';
import { UserProfile } from '../types/user';
import { calculateAge } from '../utils/helpers';
import { BITMOJI_THRESHOLD } from '../constants/app';

export const matchService = {
  async createMatch(userId1: string, userId2: string): Promise<string | null> {
    try {
      // First, check if a match already exists between these users
      const existingMatchQuery = query(
        collection(db, 'matches'),
        where('users', 'array-contains', userId1)
      );
      
      const querySnapshot = await getDocs(existingMatchQuery);
      const existingMatch = querySnapshot.docs.find(doc => 
        doc.data().users.includes(userId2)
      );

      // If match already exists, return its ID
      if (existingMatch) {
        console.log('Match already exists:', existingMatch.id);
        return existingMatch.id;
      }

      // If no match exists, create a new one
      const matchData: Omit<Match, 'id'> = {
        users: [userId1, userId2],
        createdAt: new Date(),
        lastMessage: "",
        lastActivity: new Date(),
        name: "",
        photoURL: "",
        avatar: "",
        age: 0,
        interests: [],
        bio: "",
        location: ""
      };
      
      const match = await addDoc(collection(db, 'matches'), matchData);
      
      // Update both users' matches arrays only if they don't already have each other
      await Promise.all([
        updateDoc(doc(db, 'users', userId1), {
          matches: arrayUnion(userId2)
        }),
        updateDoc(doc(db, 'users', userId2), {
          matches: arrayUnion(userId1)
        })
      ]);
      
      return match.id;
    } catch (error) {
      console.error('Error creating match:', error);
      return null;
    }
  },

  async getMatch(matchId: string): Promise<Match | null> {
    const matchDoc = await getDoc(doc(db, 'matches', matchId));
    if (!matchDoc.exists()) return null;
    return { id: matchDoc.id, ...matchDoc.data() } as Match;
  },

  async unmatch(matchId: string, userId1: string, userId2: string): Promise<void> {
    await deleteDoc(doc(db, 'matches', matchId));
    
    await Promise.all([
      updateDoc(doc(db, 'users', userId1), {
        matches: arrayRemove(userId2)
      }),
      updateDoc(doc(db, 'users', userId2), {
        matches: arrayRemove(userId1)
      })
    ]);
  },

  async getMatches(userId: string): Promise<Match[]> {
    if (!userId) {
      console.error("No userId provided to getMatches");
      return [];
    }

    try {
      // Get all matches in one query
      const q = query(
        collection(db, 'matches'),
        where('users', 'array-contains', userId)
      );

      const querySnapshot = await getDocs(q);
      
      // Get all unique other user IDs from matches
      const otherUserIds = new Set(
        querySnapshot.docs.flatMap(doc => 
          doc.data().users.filter((uid: string) => uid !== userId)
        )
      );

      // Fetch all user data in parallel
      const userDataMap = new Map();
      await Promise.all(
        Array.from(otherUserIds).map(async (otherUserId) => {
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          if (userDoc.exists()) {
            userDataMap.set(otherUserId, userDoc.data());
          }
        })
      );

      // Fetch all message counts in parallel
      const messageCountsMap = new Map();
      await Promise.all(
        querySnapshot.docs.map(async (matchDoc) => {
          const [messageSnapshot1] = await Promise.all([
            getDocs(query(
              collection(db, 'messages'),
              where('matchId', '==', matchDoc.id),
              where('senderId', 'in', matchDoc.data().users)
            ))
          ]);
          messageCountsMap.set(matchDoc.id, messageSnapshot1.size);
        })
      );

      // Process matches with cached user data and message counts
      const matches = querySnapshot.docs.map((matchDoc) => {
        const matchData = matchDoc.data();
        const otherUserId = matchData.users.find((uid: string) => uid !== userId);
        const userData = userDataMap.get(otherUserId);
        
        if (!userData) return null;

        const messageCount = messageCountsMap.get(matchDoc.id) || 0;
        const displayPicture = messageCount <= BITMOJI_THRESHOLD 
          ? userData.avatar 
          : userData.profilePicture;

        return {
          id: matchDoc.id,
          users: matchData.users as [string, string],
          createdAt: matchData.createdAt?.toDate() || new Date(),
          lastMessage: matchData.lastMessage || null,
          lastActivity: matchData.lastActivity?.toDate() || new Date(),
          name: `${userData.firstName} ${userData.lastName}`,
          photoURL: userData.profilePicture || '/placeholder.svg',
          avatar: userData.avatar || '/placeholder.svg',
          age: calculateAge(userData.dateOfBirth.toDate()),
          interests: userData.interests || [],
          bio: userData.bio || '',
          location: userData.location || ''
        } as Match;
      });

      return matches.filter((match): match is Match => match !== null);
    } catch (error) {
      console.error("Error fetching matches:", error);
      return [];
    }
  },

  async updateMatchActivity(matchId: string): Promise<void> {
    await updateDoc(doc(db, 'matches', matchId), {
      lastActivity: new Date()
    });
  }
}; 