export const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const m = today.getMonth() - dateOfBirth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
};

export const calculateDistance = (location1: string, location2: string): number => {
  // For now, return a mock distance. In production, use geocoding API
  return Math.floor(Math.random() * 100);
}; 