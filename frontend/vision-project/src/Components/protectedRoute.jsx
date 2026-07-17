import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/authContext.jsx";

export default function ProtectedRoute({ children, allowedRole }) {
    const { user, loading } = useAuth();

    // Still checking localStorage — show nothing yet
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a14" }}>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Loading...</div>
            </div>
        );
    }

    // Not logged in → go to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Logged in but wrong role → redirect to their correct dashboard
    if (allowedRole && user.role !== allowedRole) {
        return <Navigate to={user.role === "instructor" ? "/instructor/dashboard" : "/dashboard"} replace />;
    }

    // All good — show the page
    return children;
}