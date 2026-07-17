import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // When app loads, check if user is already logged in
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("upgradex_user");
            const storedToken = localStorage.getItem("upgradex_token");

            if (storedUser && storedUser !== "undefined" && storedToken) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            // If anything is corrupted, clear it and start fresh
            localStorage.removeItem("upgradex_user");
            localStorage.removeItem("upgradex_token");
        } finally {
            setLoading(false);
        }
    }, []);

    // Call this after successful login/signup
    const login = (userData, token) => {
        localStorage.setItem("upgradex_user", JSON.stringify(userData));
        localStorage.setItem("upgradex_token", token);
        setUser(userData);
    };

    // Call this on logout
    const logout = () => {
        localStorage.removeItem("upgradex_user");
        localStorage.removeItem("upgradex_token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook — use this anywhere to get user info
export function useAuth() {
    return useContext(AuthContext);
}