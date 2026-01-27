"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, login as apiLogin, register as apiRegister, getMe, setAuthToken, clearAuth, getStoredUser, isAuthenticated } from "@/lib/api";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isLoggedIn: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, fullName?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (isAuthenticated()) {
                const storedUser = getStoredUser();
                if (storedUser) {
                    setUser(storedUser);
                    try {
                        const freshUser = await getMe();
                        setUser(freshUser);
                    } catch {
                        clearAuth();
                        setUser(null);
                    }
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await apiLogin(email, password);
        setAuthToken(response.access_token, response.user);
        setUser(response.user);
    };

    const register = async (email: string, password: string, fullName?: string) => {
        const response = await apiRegister(email, password, fullName);
        setAuthToken(response.access_token, response.user);
        setUser(response.user);
    };

    const logout = () => {
        clearAuth();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, isLoggedIn: !!user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
