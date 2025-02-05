import { rtdb } from '../firebase';
import { ref, onDisconnect, set, onValue, serverTimestamp } from 'firebase/database';

export const presenceService = {
  async trackPresence(userId: string) {
    const presenceRef = ref(rtdb, `status/${userId}`);
    const connectedRef = ref(rtdb, '.info/connected');

    onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        onDisconnect(presenceRef)
          .set({
            status: 'offline',
            lastSeen: serverTimestamp()
          })
          .then(() => {
            set(presenceRef, {
              status: 'online',
              lastSeen: serverTimestamp()
            });
          });
      }
    });
  }
}; 