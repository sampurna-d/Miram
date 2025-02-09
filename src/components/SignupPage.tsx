import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';
import ErrorAlert from './ErrorAlert';
import { differenceInYears, parse } from 'date-fns';
import { UserProfile } from '../types/user';
import AvatarCreator from './AvatarCreator';
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { APP_NAME } from '../constants/app';
const SignupPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [interests, setInterests] = useState('');
  const [address, setAddress] = useState('');
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);
  const [avatar, setAvatar] = useState('');
  const navigate = useNavigate();

  const uploadProfilePic = async (file: File, userId: string) => {
    console.log('Starting profile picture upload');
    const storage = getStorage();
    const storageRef = ref(storage, `profilePics/${userId}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    console.log('Profile picture uploaded successfully');
    return url;
  };

  const isOver18 = (birthDate: string): boolean => {
    try {
      const parsedDate = parse(birthDate, 'yyyy-MM-dd', new Date());
      const age = differenceInYears(new Date(), parsedDate);
      return age >= 18;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOver18(dateOfBirth)) {
      setError('You must be 18 or older to create an account.');
      return;
    }

    if (!avatar) {
      setError('Please create your avatar first');
      setShowAvatarCreator(true);
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log('Creating user account');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User account created successfully', user.uid);
  
      let profilePicUrl = '';
      if (profilePic) {
        console.log('Uploading profile picture');
        profilePicUrl = await uploadProfilePic(profilePic, user.uid);
        console.log('Profile picture URL:', profilePicUrl);
      }
  
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) {
        console.error("Invalid date of birth:", dateOfBirth);
        // Handle the error (e.g., show a message to the user)
        return; // Prevent further execution
      }
  
      const userData: Omit<UserProfile, 'lastActive' | 'isOnline' | 'matches' | 'blockedUsers'> = {
        id: user.uid,
        firstName,
        lastName,
        email,
        dateOfBirth: Timestamp.fromDate(dob),
        gender,
        bio: '',
        location: address,
        interestedIn: '',
        interests: interests.split(',').map(interest => interest.trim()),
        occupation: '',
        education: '',
        avatar,
        profilePicture: profilePicUrl,
        preferences: {
          ageRange: {
            min: 18,
            max: 100
          },
          distance: 100,
          showMe: true
        }
      };
      
      console.log('Attempting to create user document with data:', userData);
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('User document created successfully');
  
      console.log('Signup process completed, navigating to home');
      navigate('/home');
    } catch (error: any) {
      console.error('Error signing up:', error);
      // Handle Firebase Auth errors
      if (error.code) {
        setError(getFirebaseErrorMessage(error.code));
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-pink-300 to-purple-300 p-4">
      <div className="flex flex-col items-center mb-8">
        <img src="/App-Logo.png" alt="Love Connect Logo" className="w-24 h-24 mb-4" />
        <h1 className="text-4xl font-bold text-white">{APP_NAME}</h1>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-pink-600 mb-6">Sign Up</h2>
        {error && <ErrorAlert message={error} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              required
            />
          </div>
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              required
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
          <div>
            <label htmlFor="interests" className="block text-sm font-medium text-gray-700">Interests (separate with commas)</label>
            <textarea
              id="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              required
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Your Avatar</label>
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatar || '/placeholder.svg'} />
                <AvatarFallback>😊</AvatarFallback>
              </Avatar>
              <Button
                type="button"
                onClick={() => setShowAvatarCreator(true)}
                className="bg-gradient-to-r from-pink-400 to-purple-400"
              >
                {avatar ? 'Edit' : 'Create'} Avatar
              </Button>
            </div>
          </div>
          <div className="file-input">
            <label htmlFor="profile-pic" className="block text-sm font-medium text-gray-700">Profile Picture</label>
            <input
              type="file"
              id="profile-pic"
              accept="image/*"
              onChange={(e) => setProfilePic(e.target.files ? e.target.files[0] : null)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-pink-600 hover:text-pink-500">
            Login
          </Link>
        </p>
      </div>
      <AvatarCreator
        isOpen={showAvatarCreator}
        onClose={() => setShowAvatarCreator(false)}
        onSave={(url) => setAvatar(url)}
        currentAvatar={avatar}
      />
    </div>
  );
};

export default SignupPage;