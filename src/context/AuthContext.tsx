import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRecord, UserRole } from '../types/lottery';
import { storageService } from '../services/storage';

interface AuthContextType {
  currentUser: UserRecord | null;
  isAdmin: boolean;
  login: (email: string, pass: string) => { success: boolean; message: string };
  register: (name: string, email: string, phone: string, pass: string) => { success: boolean; message: string };
  logout: () => void;
  updateProfile: (name: string, phone: string) => { success: boolean; message: string };
  switchUser: (userId: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'lms_current_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('Participant');

  useEffect(() => {
    const savedUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (savedUserId) {
      const user = storageService.findUserById(savedUserId);
      if (user) {
        setCurrentUser(user);
        setActiveRole(user.Role);
        return;
      }
    }
    // Default to Rahul Sharma (Participant) for immediate quick preview if no user saved
    const defaultUser = storageService.findUserByEmail('rahul@example.com');
    if (defaultUser) {
      setCurrentUser(defaultUser);
      setActiveRole(defaultUser.Role);
      localStorage.setItem(CURRENT_USER_KEY, defaultUser.User_ID);
    }
  }, []);

  const login = (email: string, pass: string): { success: boolean; message: string } => {
    const user = storageService.findUserByEmail(email);
    if (!user) {
      return { success: false, message: 'Invalid credentials. User with this email does not exist.' };
    }
    if (user.Status === 'Suspended') {
      return { success: false, message: 'Account is suspended. Please contact system administrator.' };
    }
    if (user.Password_Hash !== pass) {
      return { success: false, message: 'Invalid email or password.' };
    }

    setCurrentUser(user);
    setActiveRole(user.Role);
    localStorage.setItem(CURRENT_USER_KEY, user.User_ID);
    return { success: true, message: `Welcome back, ${user.Name}!` };
  };

  // FR-1.1, FR-1.2, FR-1.3
  const register = (
    name: string,
    email: string,
    phone: string,
    pass: string
  ): { success: boolean; message: string } => {
    // Format validations
    if (!name.trim()) return { success: false, message: 'Full name is required.' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return { success: false, message: 'Invalid email address syntax.' };
    if (!phone.trim() || phone.trim().length < 8) return { success: false, message: 'Valid phone number is required.' };
    if (!pass || pass.length < 8) return { success: false, message: 'Password must be at least 8 characters long.' };

    // FR-1.2: Check incoming registration entries against User Master Table (D1) to prevent duplicate email
    const existing = storageService.findUserByEmail(email);
    if (existing) {
      return { success: false, message: 'An account with this email address already exists in User Master Table (D1).' };
    }

    // FR-1.3: Generate unique User_ID and store in D1
    const newUser = storageService.createUser({
      Name: name.trim(),
      Email: email.trim().toLowerCase(),
      Phone: phone.trim(),
      Password_Hash: pass,
      Role: 'Participant',
      Status: 'Active'
    });

    setCurrentUser(newUser);
    setActiveRole(newUser.Role);
    localStorage.setItem(CURRENT_USER_KEY, newUser.User_ID);

    return {
      success: true,
      message: `Account created successfully! Assigned User_ID: ${newUser.User_ID}`
    };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const updateProfile = (name: string, phone: string): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: 'No active session.' };
    const updated = storageService.updateUser(currentUser.User_ID, {
      Name: name.trim(),
      Phone: phone.trim()
    });
    if (updated) {
      setCurrentUser(updated);
      return { success: true, message: 'Profile updated successfully.' };
    }
    return { success: false, message: 'Failed to update profile.' };
  };

  const switchUser = (userId: string) => {
    const user = storageService.findUserById(userId);
    if (user) {
      setCurrentUser(user);
      setActiveRole(user.Role);
      localStorage.setItem(CURRENT_USER_KEY, user.User_ID);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin: activeRole === 'Administrator',
        login,
        register,
        logout,
        updateProfile,
        switchUser,
        activeRole,
        setActiveRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
