import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, getDoc, doc as firestoreDoc, addDoc, serverTimestamp, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Search, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Match {
  id: string;
  name: string;
  photoURL: string;
  lastMessage?: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
}

interface UserData {
  firstName: string;
  lastName: string;
  profilePicUrl?: string;
}

const MatchesPage: React.FC = () => {
  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatch = async () => {
      if (!auth.currentUser) {
        console.log("No current user");
        return;
      }

      const matchesRef = collection(db, 'matches');
      const q = query(
        matchesRef,
        where('users', 'array-contains', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const matchData = querySnapshot.docs[0].data();
        const otherUserId = matchData.users.find((id: string) => id !== auth.currentUser?.uid);
        
        const userDoc = await getDoc(firestoreDoc(db, 'users', otherUserId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserData;
          setMatch({
            id: querySnapshot.docs[0].id,
            name: `${userData.firstName} ${userData.lastName}`,
            photoURL: userData.profilePicUrl || 'default-avatar.png',
            lastMessage: matchData.lastMessage,
          });
        }
      }
    };

    fetchMatch();
  }, []);

  useEffect(() => {
    if (match) {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('matchId', '==', match.id),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messagesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Message));
        setMessages(messagesData);
      });

      return () => unsubscribe();
    }
  }, [match]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !match || !auth.currentUser) {
      console.log("Cannot send message:", { newMessage, match, currentUser: auth.currentUser });
      return;
    }

    const messageData = {
      matchId: match.id,
      senderId: auth.currentUser.uid,
      text: newMessage,
      timestamp: serverTimestamp(),
    };

    await addDoc(collection(db, 'messages'), messageData);
    setNewMessage('');
  };

  const handleUnmatch = async () => {
    if (match) {
      await deleteDoc(doc(db, 'matches', match.id));
      setMatch(null);
      setMessages([]);
      
      // Clear local storage and dispatch unmatch event
      localStorage.removeItem('matchedUser');
      window.dispatchEvent(new Event('unmatch'));
      
      // Optionally, navigate back to home page
      navigate('/');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        {match ? (
          <>
            <div className="bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">{match.name}</h2>
              <button onClick={handleUnmatch} className="bg-red-500 text-white p-2 rounded">Unmatch</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 mb-16">
              {messages.map(message => (
                <div key={message.id} className={`mb-2 ${message.senderId === auth.currentUser?.uid ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block p-2 rounded-lg ${message.senderId === auth.currentUser?.uid ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                    {message.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-white p-4 border-t flex fixed bottom-16 left-0 right-0">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-l-full"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                className="bg-blue-500 text-white p-2 rounded-r-full"
                onClick={sendMessage}
              >
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No current match. Start matching to find a partner.
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesPage;