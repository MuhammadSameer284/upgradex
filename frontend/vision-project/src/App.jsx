import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

// context
import { useAuth } from "./Context/authContext.jsx";


// components
import ProtectedRoute from "./Components/protectedRoute.jsx";
import Sidebar from "./Components/Sidebar.jsx";


// pages
import Login               from "./Pages/Login.jsx";
import Signup              from "./Pages/Signup.jsx";
import Dashboard           from "./Pages/Dashboard.jsx";
import InstructorDashboard from "./Pages/InstructorDashboard.jsx";
import Projects            from "./Pages/Projects.jsx";
import KanbanBoard         from "./Pages/KanbanBoard.jsx";
import CodeReview          from "./Pages/CodeReview.jsx";
import VideoCall           from "./Pages/VideoCall.jsx";
import Portfolio           from "./Pages/Portfolio.jsx";
import Tasks               from "./Pages/Tasks.jsx";
import Profile             from "./Pages/Profile.jsx";
import Settings            from "./Pages/Settings.jsx";

const NO_SIDEBAR = ["/login", "/signup"];

function Layout() {
    const location    = useLocation();
    const { user }    = useAuth();
    const showSidebar = !NO_SIDEBAR.includes(location.pathname);

    return (
        <div className="flex min-h-screen" style={{ background: "#0a0a14" }}>
            {showSidebar && <Sidebar />}
            <main className="flex-1 overflow-y-auto">
                <Routes>
                    {/* Public routes */}
                    <Route path="/login"  element={<Login />}  />
                    <Route path="/signup" element={<Signup />} />

                    {/* Root redirect based on role */}
                    <Route path="/" element={
                        user
                            ? user.role === "instructor"
                                ? <Navigate to="/instructor/dashboard" replace />
                                : <Navigate to="/dashboard" replace />
                            : <Navigate to="/login" replace />
                    } />

                    {/* Student only */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute allowedRole="student">
                            <Dashboard />
                        </ProtectedRoute>
                    } />

                    {/* Instructor only */}
                    <Route path="/instructor/dashboard" element={
                        <ProtectedRoute allowedRole="instructor">
                            <InstructorDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Shared protected routes */}
                    <Route path="/projects"  element={<ProtectedRoute><Projects /></ProtectedRoute>}   />
                    <Route path="/kanban"    element={<ProtectedRoute><KanbanBoard /></ProtectedRoute>} />
                    <Route path="/review"    element={<ProtectedRoute><CodeReview /></ProtectedRoute>}  />
                    <Route path="/video"     element={<ProtectedRoute><VideoCall /></ProtectedRoute>}   />
                    <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>}   />
                    <Route path="/tasks"     element={<ProtectedRoute><Tasks /></ProtectedRoute>}       />
                    <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>}     />
                    <Route path="/settings"  element={<ProtectedRoute><Settings /></ProtectedRoute>}    />

                    {/* Catch all unknown URLs */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Layout />
        </BrowserRouter>
    );
}
