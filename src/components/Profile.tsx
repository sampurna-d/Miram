import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Label } from "./ui/label"
import { Camera, Loader2 } from 'lucide-react'

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  interests: string[];
  address: string;
  profilePicUrl: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    const file = e.target.files[0];
    const storageRef = ref(storage, `users/${auth.currentUser.uid}/profilePic`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setProfile({ ...profile, profilePicUrl: url });
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!profile || !auth.currentUser) return;
    setIsLoading(true);
    const docRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(docRef, { ...profile });
    setEditMode(false);
    setIsLoading(false);
  };

  if (!profile) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {editMode ? 'Edit Profile' : 'Your Profile'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-6">
            <Avatar className="w-32 h-32">
              <AvatarImage src={profile.profilePicUrl} alt={`${profile.firstName} ${profile.lastName}`} />
              <AvatarFallback>{profile.firstName[0]}{profile.lastName[0]}</AvatarFallback>
            </Avatar>
            {editMode && (
              <div className="mt-2">
                <Label htmlFor="profile-pic" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-blue-500">
                    <Camera size={16} />
                    Change Profile Picture
                  </div>
                </Label>
                <Input id="profile-pic" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
              </div>
            )}
          </div>
          
          {editMode ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={profile.age}
                  onChange={handleInputChange}
                  placeholder="Age"
                />
              </div>
              <div>
                <Label htmlFor="interests">Interests</Label>
                <Input
                  id="interests"
                  name="interests"
                  value={profile.interests.join(', ')}
                  onChange={handleInterestsChange}
                  placeholder="Interests (comma separated)"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={profile.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                />
              </div>
              <Button onClick={handleSave} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Age:</strong> {profile.age}</p>
              <p><strong>Interests:</strong> {profile.interests.join(', ')}</p>
              <p><strong>Address:</strong> {profile.address}</p>
              <Button onClick={() => setEditMode(true)} className="w-full">Edit Profile</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}