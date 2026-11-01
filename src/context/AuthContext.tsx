import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: 'Admin' | 'SRE Engineer' | 'Viewer') => void;
  quickLogin: (presetRole: 'admin' | 'sre' | 'viewer') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Preset users matching exact team & screenshots
const PRESET_USERS: Record<string, User> = {
  admin: {
    id: 'usr-admin',
    name: 'Sashika K N',
    email: 'sashika@sre.corp',
    role: 'Admin',
    title: 'Security Commander & Team Leader',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  },
  sre: {
    id: 'usr-sre',
    name: 'Alex Mercer',
    email: 'alex.mercer@sre.corp',
    role: 'SRE Engineer',
    title: 'Lead SRE Architect',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
  },
  viewer: {
    id: 'usr-viewer',
    name: 'Vikashini S',
    email: 'vikashini@sre.corp',
    role: 'Viewer',
    title: 'DevOps Observer & Team Member',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Alex Mercer as shown in PPT/Report screenshot
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cascade_user');
    return saved ? JSON.parse(saved) : PRESET_USERS.sre;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('cascade_token') || 'demo_jwt_token_alex_mercer';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('cascade_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cascade_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('cascade_token', token);
    } else {
      localStorage.removeItem('cascade_token');
    }
  }, [token]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || 'SreLead@2026!' })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        return true;
      }
    } catch {}

    // Fallback matching presets
    const lower = email.toLowerCase();
    if (lower.includes('sashika') || lower.includes('admin')) {
      setUser(PRESET_USERS.admin);
      setToken('demo_token_admin');
    } else if (lower.includes('vikashini') || lower.includes('viewer')) {
      setUser(PRESET_USERS.viewer);
      setToken('demo_token_viewer');
    } else {
      setUser(PRESET_USERS.sre);
      setToken('demo_token_sre');
    }
    return true;
  };

  const register = async (name: string, email: string, password: string, role: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        return true;
      }
    } catch {}

    const newUser: User = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name,
      email,
      role: (role as any) || 'SRE Engineer',
      title: role === 'Admin' ? 'Incident Commander' : role === 'SRE Engineer' ? 'Reliability Engineer' : 'DevOps Observer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
    };
    setUser(newUser);
    setToken('registered_token_' + newUser.id);
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cascade_user');
    localStorage.removeItem('cascade_token');
  };

  const switchRole = (newRole: 'Admin' | 'SRE Engineer' | 'Viewer') => {
    if (!user) return;
    const updated = {
      ...user,
      role: newRole,
      title: newRole === 'Admin' ? 'Security Commander & Team Leader' : newRole === 'SRE Engineer' ? 'Lead SRE Architect' : 'DevOps Observer & Team Member'
    };
    setUser(updated);
  };

  const quickLogin = (presetRole: 'admin' | 'sre' | 'viewer') => {
    const target = PRESET_USERS[presetRole];
    setUser(target);
    setToken(`quick_token_${presetRole}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchRole,
        quickLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
