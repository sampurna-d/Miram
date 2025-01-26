type FirebaseErrorCode = 
  | 'auth/invalid-credential'
  | 'auth/email-already-in-use'
  | 'auth/weak-password'
  | 'auth/invalid-email'
  | 'auth/user-disabled'
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/too-many-requests'
  | 'auth/network-request-failed';

export const getFirebaseErrorMessage = (code: string): string => {
  const errorMessages: Record<FirebaseErrorCode, string> = {
    'auth/invalid-credential': "Oops! The email and password don't match. Please try again.",
    'auth/email-already-in-use': "Looks like you already have an account! Try logging in instead.",
    'auth/weak-password': "Your password needs to be a bit stronger! Please use at least 6 characters.",
    'auth/invalid-email': "Hmm... that email doesn't look quite right. Please check and try again.",
    'auth/user-disabled': "This account has been disabled. Please contact support for help.",
    'auth/user-not-found': "We couldn't find an account with that email. Want to create one?",
    'auth/wrong-password': "That password doesn't look right. Want to try again?",
    'auth/too-many-requests': "Whoa there! Too many attempts. Please try again later or reset your password.",
    'auth/network-request-failed': "Having trouble connecting. Please check your internet connection and try again."
  };

  return errorMessages[code as FirebaseErrorCode] || "Something went wrong. Please try again.";
}; 