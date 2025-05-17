
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '@/config/env';

// Define auth context types
interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = () => {
      const authState = localStorage.getItem('auth');
      const authTimestamp = localStorage.getItem('auth_timestamp');
      
      // Check if auth exists and is not expired (24 hours)
      if (authState === 'true' && authTimestamp) {
        const currentTime = Date.now();
        const authTime = parseInt(authTimestamp, 10);
        const expiryTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        if (currentTime - authTime < expiryTime) {
          setIsAuthenticated(true);
        } else {
          // Auth expired
          localStorage.removeItem('auth');
          localStorage.removeItem('auth_timestamp');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setIsInitialized(true);
    };
    
    checkAuth();
  }, [navigate]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check credentials against environment variables
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('auth', 'true');
      localStorage.setItem('auth_timestamp', Date.now().toString());
      
      toast({
        title: "Login successful",
        description: "Welcome to the AI Chatbot Monitoring Dashboard",
      });
      return true;
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('auth');
    localStorage.removeItem('auth_timestamp');
    navigate('/login');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {isInitialized ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
