import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { useAvatar } from '../contexts/AvatarContext';

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
  messageCount: number;
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
    education: "",
    messageCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isBitmojiEditorOpen, setIsBitmojiEditorOpen] = useState(false);
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  // Add a ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { showAvatar } = useAvatar();

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
        setProfile({
          ...data,
          dateOfBirth: data.dateOfBirth.toDate(),
        } as UserProfile);
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  // Update the useEffect for image preloading
  useEffect(() => {
    if (profile.profilePicture) {
      const img = document.createElement('img');
      img.src = profile.profilePicture;
    }

    if (profile.avatar) {
      const img = document.createElement('img');
      img.src = profile.avatar;
    }
  }, [profile.profilePicture, profile.avatar]);

  // Memoize expensive calculations
  const age = useMemo(() => {
    if (!profile.dateOfBirth) return 0;
    return new Date().getFullYear() - profile.dateOfBirth.getFullYear();
  }, [profile.dateOfBirth]);

  useEffect(() => {
    // Start flip animation when component mounts
    setIsFlipping(true);
    const timer = setTimeout(() => setIsFlipping(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Determine which image to show based on message count

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

  // Add these styles to show different images on flip
  const flipCardStyles = {
    transformStyle: 'preserve-3d' as const,
    transition: 'transform 0.6s',
    position: 'relative' as const,
    width: '96px',
    height: '96px',
  };

  const flipCardInnerStyles = {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden' as const,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  console.log(showAvatar);
  const frontImage = showAvatar ? profile.avatar : profile.profilePicture;
  const backImage = showAvatar ? profile.profilePicture : profile.avatar;
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        <Card className="mb-6 card-hover">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              {/* Profile Picture with Flip Animation */}
              <div className="relative">
                <div 
                  className={isFlipping ? 'animate-flip' : ''} 
                  style={flipCardStyles}
                >
                  {/* Front - Profile Picture */}
                  <Avatar 
                    className="w-24 h-24 rounded-full border-4 border-pink-200 ring-2 ring-pink-100 ring-offset-2"
                    style={{ ...flipCardInnerStyles, transform: 'rotateY(0deg)' }}
                  >
                    <AvatarImage src={frontImage || '/placeholder.svg'} />
                    <AvatarFallback>{profile.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                  

                  {/* Back - Avatar */}
                  <Avatar 
                    className="w-24 h-24 rounded-full border-4 border-pink-200 ring-2 ring-pink-100 ring-offset-2"
                    style={{ ...flipCardInnerStyles, transform: 'rotateY(180deg)' }}
                  >
                    <AvatarImage src={backImage || '/placeholder.svg'} />
                    <AvatarFallback>😊</AvatarFallback>
                  </Avatar>

                </div>

                {/* Edit button outside flip container */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 bg-white hover:bg-pink-50"
                    >
                      <Camera className="h-4 w-4 text-pink-600" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2">
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        onClick={handleProfilePicClick}
                      >
                        <Camera className="h-4 w-4" />
                        Edit Profile Picture
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        onClick={() => setIsAvatarEditorOpen(true)}
                      >
                        <Sparkles className="h-4 w-4" />
                        Edit Avatar
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-sm text-gray-500">
                  {showAvatar ? 'Showing Avatar' : 'Showing Profile Picture'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rest of the profile sections */}
        <Card className="card-hover">
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
      </div>

      {/* Keep existing AvatarCreator and hidden input */}
      <AvatarCreator
        isOpen={isAvatarEditorOpen}
        onClose={() => setIsAvatarEditorOpen(false)}
        onSave={async (url) => {
          try {
            if (!auth.currentUser) return;
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
              avatar: url
            });
            setProfile(prev => ({ ...prev, avatar: url }));
            toast({
              title: "Avatar Updated",
              description: "Your avatar has been updated successfully!"
            });
          } catch (error) {
            console.error('Error updating avatar:', error);
            toast({
              title: "Error",
              description: "Failed to update avatar",
              variant: "destructive",
            });
          }
        }}
        currentAvatar={profile.avatar}
      />
      
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