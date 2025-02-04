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

export const matchService = {
  async createMatch(userId1: string, userId2: string): Promise<string> {
    const matchData: Omit<Match, 'id'> = {
      users: [userId1, userId2],
      createdAt: new Date(),
      lastMessage: null,
      lastActivity: new Date()
    };
    
    const match = await addDoc(collection(db, 'matches'), matchData);
    
    // Update both users' matches arrays
    await Promise.all([
      updateDoc(doc(db, 'users', userId1), {
        matches: arrayUnion(userId2)
      }),
      updateDoc(doc(db, 'users', userId2), {
        matches: arrayUnion(userId1)
      })
    ]);
    
    return match.id;
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

    console.log("Fetching matches for userId:", userId);
    
    try {
      const q = query(
        collection(db, 'matches'),
        where('users', 'array-contains', userId)
      );

      const querySnapshot = await getDocs(q);
      console.log("Found matches:", querySnapshot.size);

      const matches = await Promise.all(
        querySnapshot.docs.map(async (matchDoc) => {
          const matchData = matchDoc.data();
          console.log("Processing match data:", matchData);

          if (!matchData.users || !Array.isArray(matchData.users) || matchData.users.length !== 2) {
            console.log("Invalid users array in match:", matchDoc.id);
            return null;
          }

          const otherUserId = matchData.users[0] === userId ? matchData.users[1] : matchData.users[0];
          console.log("Other user ID:", otherUserId);

          if (!otherUserId) {
            console.log("Could not find other user ID");
            return null;
          }

          const userDocRef = doc(db, 'users', otherUserId);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            console.log("No user document found for:", otherUserId);
            return null;
          }

          const userData = userDoc.data();
          console.log("User data:", userData);

          // Try to get the profile picture URL
          let photoURL = '/placeholder.svg';
          try {
            if (userData.profilePicture) {
              console.log("User has profile picture:", userData.profilePicture);
              photoURL = userData.profilePicture;
            } else {
              console.log("No profile picture found, fetching from storage");
              const picRef = ref(storage, `profilePics/${otherUserId}`);
              photoURL = await getDownloadURL(picRef);
            }
          } catch (error) {
            console.log("Could not get profile picture URL:", error);
            photoURL = '/placeholders.svg';
          }

          return {
            id: matchDoc.id,
            users: matchData.users as [string, string],
            createdAt: matchData.createdAt?.toDate() || new Date(),
            lastMessage: matchData.lastMessage || null,
            lastActivity: matchData.lastActivity?.toDate() || new Date(),
            name: `${userData.firstName} ${userData.lastName}`,
            photoURL,
            age: calculateAge(userData.dateOfBirth.toDate()),
            interests: userData.interests || [],
            bio: userData.bio || '',
            location: userData.location || ''
          } as Match;
        })
      );

      const validMatches = matches.filter((match): match is Match => match !== null);
      console.log("Valid matches:", validMatches);
      return validMatches;

    } catch (error) {
      console.error("Error in getMatches:", error);
      throw error;
    }
  },

  async updateMatchActivity(matchId: string): Promise<void> {
    await updateDoc(doc(db, 'matches', matchId), {
      lastActivity: new Date()
    });
  }
}; 