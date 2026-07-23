import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/authContext.jsx";
import { getStudentDashboard } from "../config/dashboardService.jsx";
import { updateTask } from "../config/taskService.jsx";

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [projectsList, setProjectsList] = useState([]);
    const [activityLog, setActivityLog] = useState([]);
    const [statsData, setStatsData] = useState({ activeProjects: 0, totalTasks: 0, codeReviews: 0, portfolioItems: 0 });
    const [upcomingCall, setUpcomingCall] = useState(null);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await getStudentDashboard();
                setStatsData(res.data.stats);
                setProjectsList(res.data.projects);
                setTasks(res.data.tasks);
                setActivityLog(res.data.activity);
                if (res.data.upcomingCall) setUpcomingCall(res.data.upcomingCall);
            } catch (err) {
                console.error("Error fetching student dashboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const toggleTask = async (id) => {
        try {
            const taskToToggle = tasks.find(t => t._id === id);
            if (!taskToToggle) return;
            const updatedDone = !taskToToggle.done;
            const updatedStatus = updatedDone ? "Done" : "To Do";

            await updateTask(id, { done: updatedDone, status: updatedStatus });

            if (updatedDone) {
                // Instantly remove from Today's Tasks (pending tasks) list
                setTasks(prev => prev.filter(t => t._id !== id));
            } else {
                setTasks(prev => prev.map(t => {
                    if (t._id !== id) return t;
                    return {
                        ...t,
                        done: updatedDone,
                        status: updatedStatus,
                    };
                }));
            }

            setStatsData(prev => ({
                ...prev,
                totalTasks: updatedDone ? Math.max(0, prev.totalTasks - 1) : prev.totalTasks + 1
            }));
        } catch (err) {
            console.error("Failed to toggle task", err);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'completed': return { label: "Completed", bg: "rgba(127,119,221,0.12)", color: "#AFA9EC" };
            case 'review': return { label: "In Review", bg: "rgba(186,117,23,0.12)", color: "#FAC775" };
            default: return { label: "Active", bg: "rgba(29,158,117,0.12)", color: "#5DCAA5" }; // active
        }
    };

    const getTaskStatusStyle = (status) => {
        switch (status) {
            case 'Done': return { bg: "rgba(29,158,117,0.1)", color: "#5DCAA5" };
            case 'In Progress': return { bg: "rgba(186,117,23,0.1)", color: "#EF9F27" };
            default: return { bg: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.25)" };
        }
    };

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    const firstName = user?.name?.split(" ")[0] || "there";

    const stats = [
        { label: "Active projects", value: statsData.activeProjects, icon: "ti-folder", color: "#7F77DD", bg: "rgba(127,119,221,0.12)", change: "Active", changeBg: "rgba(29,158,117,0.12)", changeColor: "#5DCAA5" },
        { label: "Total tasks", value: statsData.totalTasks, icon: "ti-checklist", color: "#1D9E75", bg: "rgba(29,158,117,0.12)", change: "Remaining", changeBg: "rgba(186,117,23,0.12)", changeColor: "#EF9F27" },
        { label: "Code reviews", value: statsData.codeReviews, icon: "ti-code", color: "#AFA9EC", bg: "rgba(83,74,183,0.12)", change: "Pending", changeBg: "rgba(224,75,74,0.1)", changeColor: "#E24B4A" },
        { label: "Portfolio items", value: statsData.portfolioItems, icon: "ti-briefcase", color: "#5DCAA5", bg: "rgba(93,202,165,0.1)", change: "Showcased", changeBg: "rgba(29,158,117,0.12)", changeColor: "#5DCAA5" },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a14" }}>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Loading workspace...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6" style={{ background: "#0a0a14" }}>

            {/* ── Top bar ── */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.25)", letterSpacing: ".03em" }}>
                        {today}
                    </div>
                    <h1 className="text-xl font-semibold text-white">
                        Welcome, <span style={{ color: "#7F77DD" }}>{user?.name || "User"}</span> 👋
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <div
                        className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all"
                        style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(127,119,221,0.3)"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                    >
                        <i className="ti ti-search" aria-hidden="true" style={{ fontSize: "14px", color: "rgba(255,255,255,0.2)" }} />
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>Search anything...</span>
                    </div>

                    <button
                        onClick={() => navigate("/projects")}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-medium transition-all hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#7F77DD,#1D9E75)", border: "none", cursor: "pointer" }}
                    >
                        <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: "14px" }} />
                        New Project
                    </button>
                </div>
            </div>

            {/* ── Upcoming call banner ── */}
            {upcomingCall && (
                <div
                    className="flex items-center justify-between px-5 py-4 rounded-xl mb-5"
                    style={{ background: "rgba(127,119,221,0.08)", border: "0.5px solid rgba(127,119,221,0.2)" }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(127,119,221,0.15)" }}
                        >
                            <i className="ti ti-video" aria-hidden="true" style={{ fontSize: "20px", color: "#7F77DD" }} />
                        </div>
                        <div>
                            <div className="text-sm font-medium" style={{ color: "#AFA9EC" }}>
                                {upcomingCall.title || "Video call scheduled"}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: "rgba(127,119,221,0.5)" }}>
                                {new Date(upcomingCall.scheduledAt).toLocaleString("en-US", {
                                    weekday: "long", hour: "numeric", minute: "numeric", hour12: true
                                })} {upcomingCall.instructorName ? `with ${upcomingCall.instructorName}` : ""}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/video")}
                        className="px-4 py-2 rounded-lg text-xs font-medium text-white transition-all hover:opacity-80"
                        style={{ background: "rgba(127,119,221,0.3)", border: "none", cursor: "pointer" }}
                    >
                        Join call
                    </button>
                </div>
            )}

            {/* ── Stats ── */}
            <div className="grid grid-cols-4 gap-3 mb-5">
                {stats.map((s, i) => (
                    <div
                        key={i}
                        className="rounded-xl p-4 cursor-pointer transition-all"
                        style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(127,119,221,0.25)"; e.currentTarget.style.background = "rgba(127,119,221,0.04)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";  e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                                <i className={`ti ${s.icon}`} aria-hidden="true" style={{ fontSize: "16px", color: s.color }} />
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: s.changeBg, color: s.changeColor }}>
                                {s.change}
                            </span>
                        </div>
                        <div className="text-2xl font-semibold text-white mb-0.5">{s.value}</div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Projects + Tasks ── */}
            <div className="grid grid-cols-2 gap-4 mb-4">

                {/* Projects */}
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>My Projects</span>
                        <button onClick={() => navigate("/projects")} style={{ fontSize: "11px", color: "rgba(127,119,221,0.7)", background: "none", border: "none", cursor: "pointer" }}>
                            View all →
                        </button>
                    </div>

                    {projectsList.map((p, i) => {
                        const statusConfig = getStatusConfig(p.status);
                        return (
                            <div
                                key={p._id}
                                className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all mb-1"
                                style={{ background: "transparent" }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                onClick={() => navigate('/projects')}
                            >
                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                                    style={{ background: `linear-gradient(135deg,${p.gradFrom || '#534AB7'},${p.gradTo || '#7F77DD'})` }}
                                >
                                    {p.initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium mb-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>{p.name}</div>
                                    <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{p.tech ? p.tech.join(" · ") : "React"}</div>
                                    <div className="h-0.5 rounded-full mt-1.5 overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                                        <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: p.barColor || '#7F77DD' }} />
                                    </div>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: statusConfig.bg, color: statusConfig.color }}>
                                    {statusConfig.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Tasks */}
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Today's Tasks</span>
                        <button onClick={() => navigate("/kanban")} style={{ fontSize: "11px", color: "rgba(127,119,221,0.7)", background: "none", border: "none", cursor: "pointer" }}>
                            Workflow →
                        </button>
                    </div>

                    {tasks.map(t => {
                        const style = getTaskStatusStyle(t.status);
                        return (
                            <div key={t._id} className="flex items-start gap-2.5 py-2.5" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}>
                                <button
                                    onClick={() => toggleTask(t._id)}
                                    className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                                    style={{
                                        background: t.done ? "rgba(29,158,117,0.2)" : "transparent",
                                        border:     t.done ? "0.5px solid rgba(29,158,117,0.4)" : "0.5px solid rgba(255,255,255,0.15)",
                                        cursor: "pointer",
                                    }}
                                    aria-label={t.done ? "Mark incomplete" : "Mark complete"}
                                >
                                    {t.done && <i className="ti ti-check" aria-hidden="true" style={{ fontSize: "10px", color: "#1D9E75" }} />}
                                </button>
                                <span
                                    className="text-xs flex-1"
                                    style={{
                                        color:          t.done ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
                                        textDecoration: t.done ? "line-through" : "none",
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {t.name}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: style.bg, color: style.color }}>
                                    {t.status}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Activity Feed ── */}
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Recent activity</span>
                </div>

                {activityLog.map((a, i) => (
                    <div key={i} className="flex gap-2.5 py-2.5 items-start" style={{ borderBottom: i < activityLog.length - 1 ? "0.5px solid rgba(255,255,255,0.05)" : "none" }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: a.iconBg }}>
                            <i className={`ti ${a.icon}`} aria-hidden="true" style={{ fontSize: "13px", color: a.iconColor }} />
                        </div>
                        <div className="text-xs flex-1" style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                            {a.text}
                        </div>
                        <div className="text-[10px] flex-shrink-0 mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>
                            {a.time}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
