import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Dashboard from "./pages/Dashboard";
import KanbanBoard from "./Pages/KanbanBoard";
import Projects from "./Pages/Projects";
import Footer from "./Components/Footer";
import CodeReview from "./Pages/CodeReview";
import VideoCall from "./Pages/VideoCall";
import Portfolio from "./Pages/Portfolio";
import Tasks from "./Pages/Tasks";
import Profile from "./Pages/Profile";
import Settings from "./Pages/Settings";

// Pages where sidebar should NOT appear
const noSidebarPages = ["/login", "/signup"];
const noFooter = ["/login", "/signup"];

function Layout() {
  const location = useLocation();
  const showSidebar = !noSidebarPages.includes(location.pathname);
  const showFooter = !noFooter.includes(location.pathname);

  return (
    <>
      <div className="flex min-h-screen" style={{ background: "#0a0a14" }}>
        {showSidebar && <Sidebar />}

        {/* Page content fills remaining space */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/kanban" element={<KanbanBoard />} />
            <Route path="/projects" element={<Projects />} />
            {/* <Route path="/projects/new" element={<Projects />} /> */}
            <Route path="/review" element={<CodeReview />} />
            <Route path="/video" element={<VideoCall />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
          {showFooter && < Footer />}
        </main>
      </div>
    </>
  );
}

function App() {
  return (

    <Layout />

  );
}

export default App;