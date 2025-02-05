import { db, auth, storage } from '../firebase';
import { collection, doc, getDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UserProfile } from '../types/user';
import { calculateAge, calculateDistance } from '../utils/helpers';

export const userService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    if (!auth.currentUser) return null;
    const docRef = doc(db, 'users', auth.currentUser.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const { id, ...data } = docSnap.data() as UserProfile;
    return { id: docSnap.id, ...data };
  },

  async updateProfile(userId: string, data: Partial<Omit<UserProfile, 'id'>>): Promise<void> {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      ...data,
      lastActive: new Date()
    });
  },

  async uploadProfilePicture(file: File, userId: string): Promise<string> {
    const storageRef = ref(storage, `profilePics/${userId}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },

  async findMatches(currentUser: UserProfile): Promise<UserProfile[]> {
    // First, let's add validation and logging
    if (!currentUser?.gender || !currentUser?.interestedIn) {
        console.error("Missing required fields:", { gender: currentUser?.gender, interestedIn: currentUser?.interestedIn });
        return [];
    }

    console.log("Finding matches for user:", {
        gender: currentUser.gender,
        interestedIn: currentUser.interestedIn,
        preferences: currentUser.preferences
    });
    
    const q = query(
        collection(db, 'users'),
        where('gender', '==', currentUser.interestedIn),
        where('interestedIn', '==', currentUser.gender)
    );

    const querySnapshot = await getDocs(q);
    console.log("Found potential matches:", querySnapshot.size);

    const matches = querySnapshot.docs
        .map(doc => {
            const data = doc.data() as UserProfile;
            const { id, ...userData } = data;
            console.log("Processing potential match:", doc.id, data);
            return { id: doc.id, ...userData };
        })
        .filter(user => {
            if (!user.dateOfBirth) {
                console.log("Skipping user due to missing DOB:", user.id);
                return false;
            }

            const age = calculateAge(user.dateOfBirth.toDate());
            const distance = calculateDistance(currentUser.location, user.location);
            
            console.log("Match criteria for user", user.id, {
                age,
                distance,
                isInAgeRange: age >= currentUser.preferences.ageRange.min && 
                             age <= currentUser.preferences.ageRange.max,
                isInDistance: distance <= currentUser.preferences.distance,
                isNotMatched: !currentUser.matches?.includes(user.id),
                isNotBlocked: !currentUser.blockedUsers?.includes(user.id)
            });

            return (
                age >= currentUser.preferences.ageRange.min &&
                age <= currentUser.preferences.ageRange.max &&
                distance <= currentUser.preferences.distance &&
                // !currentUser.matches?.includes(user.id) &&    // Exclude already matched users
                !currentUser.blockedUsers?.includes(user.id)   // Exclude blocked users
            );
        });

    console.log("Final filtered matches:", matches.length);
    return matches;
  }
}; 