import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/authContext.jsx";

const stats = [
    { label: "Active projects", value: 3,  icon: "ti-folder",    color: "#7F77DD", bg: "rgba(127,119,221,0.12)", change: "+1 new", changeBg: "rgba(29,158,117,0.12)",  changeColor: "#5DCAA5"  },
    { label: "Total tasks",     value: 12, icon: "ti-checklist", color: "#1D9E75", bg: "rgba(29,158,117,0.12)",  change: "7 left", changeBg: "rgba(186,117,23,0.12)",   changeColor: "#EF9F27"  },
    { label: "Code reviews",    value: 2,  icon: "ti-code",      color: "#AFA9EC", bg: "rgba(83,74,183,0.12)",   change: "2 open", changeBg: "rgba(224,75,74,0.1)",     changeColor: "#E24B4A"  },
    { label: "Portfolio items", value: 1,  icon: "ti-briefcase", color: "#5DCAA5", bg: "rgba(93,202,165,0.1)",   change: "1 done", changeBg: "rgba(29,158,117,0.12)",   changeColor: "#5DCAA5"  },
];

const projects = [
    { initials: "EC", name: "E-Commerce Platform", meta: "4 members · Updated 2h ago",  progress: 65, gradientFrom: "#534AB7", gradientTo: "#7F77DD", barColor: "#7F77DD", status: "Active", statusBg: "rgba(29,158,117,0.12)",  statusColor: "#5DCAA5"  },
    { initials: "SP", name: "Student Portal API",  meta: "2 members · Updated 5h ago",  progress: 40, gradientFrom: "#0F6E56", gradientTo: "#1D9E75", barColor: "#1D9E75", status: "Active", statusBg: "rgba(29,158,117,0.12)",  statusColor: "#5DCAA5"  },
    { initials: "WA", name: "Weather App",         meta: "Solo · Updated yesterday",    progress: 90, gradientFrom: "#712B13", gradientTo: "#D85A30", barColor: "#D85A30", status: "Review", statusBg: "rgba(127,119,221,0.12)", statusColor: "#AFA9EC" },
];

const initialTasks = [
    { id: 1, name: "Setup Express server",    done: true,  tag: "Done",        tagBg: "rgba(29,158,117,0.1)",   tagColor: "#5DCAA5"               },
    { id: 2, name: "Build auth middleware",   done: false, tag: "In progress", tagBg: "rgba(186,117,23,0.1)",   tagColor: "#EF9F27"               },
    { id: 3, name: "Design product schema",   done: false, tag: "Todo",        tagBg: "rgba(255,255,255,0.05)", tagColor: "rgba(255,255,255,0.25)" },
    { id: 4, name: "Connect MongoDB Atlas",   done: false, tag: "Todo",        tagBg: "rgba(255,255,255,0.05)", tagColor: "rgba(255,255,255,0.25)" },
    { id: 5, name: "Write API documentation", done: false, tag: "Todo",        tagBg: "rgba(255,255,255,0.05)", tagColor: "rgba(255,255,255,0.25)" },
];

const activity = [
    { icon: "ti-git-pull-request", iconColor: "#7F77DD", iconBg: "rgba(127,119,221,0.12)", text: <><strong style={{ color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>Sir Khalid</strong> left a review comment on <strong style={{ color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>E-Commerce Platform</strong></>,          time: "12m ago" },
    { icon: "ti-user-plus",        iconColor: "#1D9E75", iconBg: "rgba(29,158,117,0.12)",  text: <><strong style={{ color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>Ali Raza</strong> joined your project <strong style={{ color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>Student Portal API</strong></>,                        time: "1h ago"  },
    { icon: "ti-checklist",        iconColor: "#D85A30", iconBg: "rgba(216,90,48,0.1)",    text: <><strong style={{ color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>You</strong> moved <strong style={{ color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>"Setup Express server"</strong> to Done in Weather App</>,               time: "3h ago"  },
    { icon: "ti-video",            iconColor: "#5DCAA5", iconBg: "rgba(93,202,165,0.1)",   text: <><strong style={{ color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>Sir Khalid</strong> scheduled a video call for <strong style={{ color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>E-Commerce Project</strong> review</>,       time: "5h ago"  },
];

export default function Dashboard() {
    const [tasks,     setTasks]     = useState(initialTasks);
    const [showModal, setShowModal] = useState(false);
    const [mName,     setMName]     = useState("");
    const [mDesc,     setMDesc]     = useState("");
    const [mTech,     setMTech]     = useState("");
    const { user }                  = useAuth();
    const navigate                  = useNavigate();

    const toggleTask = (id) => {
        setTasks(prev => prev.map(t => {
            if (t.id !== id) return t;
            const done = !t.done;
            return {
                ...t, done,
                tag:      done ? "Done" : "Todo",
                tagBg:    done ? "rgba(29,158,117,0.1)"   : "rgba(255,255,255,0.05)",
                tagColor: done ? "#5DCAA5"                : "rgba(255,255,255,0.25)",
            };
        }));
    };

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    // Get first name from logged-in user, fallback to "there"
    const firstName = user?.name?.split(" ")[0] || "there";

    return (
        <div className="min-h-screen p-6" style={{ background: "#0a0a14" }}>

            {/* ── Top bar ── */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.25)", letterSpacing: ".03em" }}>
                        {today}
                    </div>
                    <h1 className="text-xl font-semibold text-white">
                        Good morning, <span style={{ color: "#7F77DD" }}>{firstName}</span> 👋
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
                            Video call with Sir Khalid in 25 minutes
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: "rgba(127,119,221,0.5)" }}>
                            E-Commerce Project · Code review session
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

                    {projects.map((p, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all mb-1"
                            style={{ background: "transparent" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                                style={{ background: `linear-gradient(135deg,${p.gradientFrom},${p.gradientTo})` }}
                            >
                                {p.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium mb-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>{p.name}</div>
                                <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{p.meta}</div>
                                <div className="h-0.5 rounded-full mt-1.5 overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                                    <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: p.barColor }} />
                                </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: p.statusBg, color: p.statusColor }}>
                                {p.status}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Tasks */}
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Today's Tasks</span>
                        <button onClick={() => navigate("/kanban")} style={{ fontSize: "11px", color: "rgba(127,119,221,0.7)", background: "none", border: "none", cursor: "pointer" }}>
                            Kanban →
                        </button>
                    </div>

                    {tasks.map(t => (
                        <div key={t.id} className="flex items-start gap-2.5 py-2.5" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}>
                            <button
                                onClick={() => toggleTask(t.id)}
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
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: t.tagBg, color: t.tagColor }}>
                                {t.tag}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Activity Feed ── */}
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Recent activity</span>
                    <button style={{ fontSize: "11px", color: "rgba(127,119,221,0.7)", background: "none", border: "none", cursor: "pointer" }}>
                        See all
                    </button>
                </div>

                {activity.map((a, i) => (
                    <div key={i} className="flex gap-2.5 py-2.5 items-start" style={{ borderBottom: i < activity.length - 1 ? "0.5px solid rgba(255,255,255,0.05)" : "none" }}>
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
