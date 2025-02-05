import { db } from '../firebase';
import { 
  collection, addDoc, query, where, orderBy, 
  getDocs, writeBatch, limit as firestoreLimit,
  getDoc, doc, updateDoc 
} from 'firebase/firestore';
import { matchService } from './matches';
import { Message } from '../types/match';

export const messageService = {
  async sendMessage(matchId: string, senderId: string, content: string): Promise<void> {
    const messageData: Omit<Message, 'id'> = {
      matchId,
      senderId,
      content,
      timestamp: new Date(),
      read: false
    };

    const messageRef = await addDoc(collection(db, 'messages'), messageData);
    
    // Update match's last message
    await updateDoc(doc(db, 'matches', matchId), {
      lastMessage: { id: messageRef.id, ...messageData },
      lastActivity: new Date()
    });
  },

  async getMessages(matchId: string, messageLimit = 50): Promise<Message[]> {
    const q = query(
      collection(db, 'messages'),
      where('matchId', '==', matchId),
      orderBy('timestamp', 'desc'),
      firestoreLimit(messageLimit)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Message));
  },

  async markAsRead(matchId: string, userId: string): Promise<void> {
    const q = query(
      collection(db, 'messages'),
      where('matchId', '==', matchId),
      where('senderId', '!=', userId),
      where('read', '==', false)
    );
    
    const unreadMessages = await getDocs(q);
    const batch = writeBatch(db);
    
    unreadMessages.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    
    await batch.commit();
  }
}; 