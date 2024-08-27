import React, { useState, useEffect } from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    age: number;
    interests: string[];
    address: string;
    profilePicUrl: string;
  }

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!profile) return;
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    setProfile({ ...profile, interests: e.target.value.split(',').map(i => i.trim()) });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !profile || !auth.currentUser) return;
    const file = e.target.files[0];
    const storageRef = ref(storage, `users/${auth.currentUser.uid}/profilePic`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setProfile({ ...profile, profilePicUrl: url });
  };

  const handleSave = async () => {
    if (!profile || !auth.currentUser) return;
    const docRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(docRef, { ...profile });
    setEditMode(false);
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      {profile.profilePicUrl && (
        <img src={profile.profilePicUrl} alt="Profile" className="w-32 h-32 rounded-full mx-auto mb-4" />
      )}
      
      {editMode ? (
        <div className="mt-4 space-y-4">
          <input
            type="text"
            name="firstName"
            value={profile.firstName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="First Name"
          />
          <input
            type="text"
            name="lastName"
            value={profile.lastName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Last Name"
          />
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Email"
            disabled
          />
          <input
            type="number"
            name="age"
            value={profile.age}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Age"
          />
          <input
            type="text"
            name="interests"
            value={profile.interests.join(', ')}
            onChange={handleInterestsChange}
            className="w-full p-2 border rounded"
            placeholder="Interests (comma separated)"
          />
          <textarea
            name="address"
            value={profile.address}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Address"
          />
          <input type="file" onChange={handleImageUpload} accept="image/*" />
          <button onClick={handleSave} className="bg-blue-500 text-white p-2 rounded">Save</button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <h2 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h2>
          <p>Email: {profile.email}</p>
          <p>Age: {profile.age}</p>
          <p>Interests: {profile.interests.join(', ')}</p>
          <p>Address: {profile.address}</p>
          <button onClick={() => setEditMode(true)} className="bg-green-500 text-white p-2 rounded">Edit Profile</button>
        </div>
      )}
    </div>
  );
};

export default Profile;