import React, { useState, useEffect, useRef } from 'react';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Label } from "./ui/label"
import { Camera, Loader2, User, MapPin, Heart, Calendar, Sparkles } from 'lucide-react'
import { useToast } from "./ui/use-toast"
import AvatarCreator from './AvatarCreator';

interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  bio: string;
  location: string;
  interestedIn: string;
  interests: string[];
  occupation: string;
  education: string;
  bitmoji?: string;
  profilePicture?: string;
  avatar?: string;
}

export default function Profile() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    dateOfBirth: new Date(),
    gender: "",
    bio: "",
    location: "",
    interestedIn: "",
    interests: [],
    occupation: "",
    education: ""
  });
  const [age, setAge] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isBitmojiEditorOpen, setIsBitmojiEditorOpen] = useState(false);
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);

  // Add a ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger file input click when user clicks the camera button
  const handleProfilePicClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle the file input change when a new profile picture is selected
  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        if (!auth.currentUser) return;
        const userId = auth.currentUser.uid;
        const storageRef = ref(storage, `profilePics/${userId}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        // Update the user's Firestore document with the new profile picture URL
        await updateDoc(doc(db, 'users', userId), { profilePicture: url });

        // Update the local state so the UI reflects the change
        setProfile(prev => ({ ...prev, profilePicture: url }));

        toast({
          title: "Profile Picture Updated",
          description: "Your profile picture has been updated successfully!"
        });
      } catch (error) {
        console.error("Error updating profile picture: ", error);
        toast({
          title: "Error",
          description: "Failed to update profile picture",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Convert Firestore Timestamp to Date
        setProfile({
          ...data,
          dateOfBirth: data.dateOfBirth.toDate(),
        } as UserProfile);
        // Calculate age from date of birth
        const age = new Date().getFullYear() - data.dateOfBirth.toDate().getFullYear();
        setAge(age);
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      if (!auth.currentUser) return;
      
      // Convert the string date to a Date object before saving
      const updatedProfile = {
        ...profile,
        dateOfBirth: new Date(profile.dateOfBirth),
        lastActive: new Date()
      };

      await updateDoc(doc(db, 'users', auth.currentUser.uid), updatedProfile);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleInterestChange = (interest: string) => {
    if (profile.interests.includes(interest)) {
      setProfile({
        ...profile,
        interests: profile.interests.filter(i => i !== interest)
      });
    } else if (profile.interests.length < 5) {
      setProfile({
        ...profile,
        interests: [...profile.interests, interest]
      });
    }
  };

  const handleBitmojiUpdate = (newBitmoji: string) => {
    setProfile(prev => {
      if (!prev) return {} as UserProfile;
      return { ...prev, bitmoji: newBitmoji };
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              Your Profile
            </CardTitle>
            <p className="text-gray-600">Update your personal information</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4 rounded-2xl bg-pink-50/30 p-6">
              <h3 className="font-semibold text-lg text-gray-700 flex items-center gap-2">
                <User className="w-5 h-5 text-pink-600" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="rounded-xl border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="rounded-xl border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input
                    value={`${age} years`}
                    disabled
                    className="rounded-xl bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Input
                    value={profile.gender}
                    disabled
                    className="rounded-xl bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* About Me */}
            <div className="space-y-4 rounded-2xl bg-pink-50/30 p-6">
              <h3 className="font-semibold text-lg text-gray-700 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-600" />
                About Me
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="rounded-xl border-gray-300 focus:border-pink-500 focus:ring-pink-500 min-h-[120px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={profile.occupation}
                    onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                    className="rounded-xl border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    value={profile.education}
                    onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                    className="rounded-xl border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-4 rounded-2xl bg-pink-50/30 p-6">
              <h3 className="font-semibold text-lg text-gray-700 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-600" />
                Preferences
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="rounded-xl pl-10 border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Interested In</Label>
                  <Input
                    id="interestedIn"
                    value={profile.interestedIn}
                    onChange={(e) => setProfile({ ...profile, interestedIn: e.target.value })}
                    className="rounded-xl border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Profile Picture & Avatar Section */}
            <div className="space-y-6 rounded-2xl bg-pink-50/30 p-6">
              <h3 className="font-semibold text-lg text-gray-700 flex items-center gap-2">
                <Camera className="w-5 h-5 text-pink-600" />
                Profile Pictures
              </h3>

              {/* Profile Picture */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Profile Picture</label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24 rounded-full border-4 border-pink-200 ring-2 ring-pink-100 ring-offset-2">
                      <AvatarImage src={profile.profilePicture || '/placeholder.svg'} />
                      <AvatarFallback className="bg-pink-100">
                        {profile.firstName?.[0]}
                        {profile.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 bg-white hover:bg-pink-50"
                      onClick={handleProfilePicClick}
                    >
                      <Camera className="h-4 w-4 text-pink-600" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      This is your main profile picture that will be shown after the first 10 messages in a chat.
                    </p>
                  </div>
                </div>
              </div>

              {/* Avatar */}
              <div className="space-y-2 pt-4 border-t border-pink-100">
                <label className="text-sm font-medium text-gray-700">Your Avatar</label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24 rounded-full border-4 border-pink-200 ring-2 ring-pink-100 ring-offset-2">
                      <AvatarImage src={profile.avatar || '/placeholder.svg'} />
                      <AvatarFallback className="bg-pink-100">
                        <span className="text-2xl">😊</span>
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 bg-white hover:bg-pink-50"
                      onClick={() => setIsAvatarEditorOpen(true)}
                    >
                      <Sparkles className="h-4 w-4 text-pink-600" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      Your avatar will be shown for the first 10 messages in new chats before revealing your profile picture.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 pb-6">
              <Button onClick={handleSave} className="w-full group bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl">
                <div className="flex items-center justify-center gap-2">
                  Save Changes
                  <span className="group-hover:animate-bounce">💝</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* BitmojiEditor component */}

        <AvatarCreator
          isOpen={isAvatarEditorOpen}
          onClose={() => setIsAvatarEditorOpen(false)}
          onSave={async (url) => {
            try {
              await updateDoc(doc(db, 'users', auth.currentUser!.uid), {
                avatar: url
              });
              setProfile(prev => ({ ...prev, avatar: url }));
            } catch (error) {
              console.error('Error updating avatar:', error);
            }
          }}
          currentAvatar={profile.avatar}
        />
      </div>
      {/* Hidden file input for profile picture selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleProfilePicChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}