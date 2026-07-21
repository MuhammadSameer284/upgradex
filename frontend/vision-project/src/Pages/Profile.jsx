import { useState, useEffect } from "react";
import { useAuth } from "../Context/authContext.jsx";
import { getUserProfile } from "../config/userService.jsx";
import { getStudentDashboard, getInstructorDashboard } from "../config/dashboardService.jsx";
import { getProjects } from "../config/projectService.jsx";

const ACHIEVEMENTS = [
    { icon: "ti-rocket", name: "First Launch",  desc: "Created first project", color: "#AFA9EC", bg: "rgba(127,119,221,0.12)" },
    { icon: "ti-code",   name: "Code Reviewer", desc: "12 reviews given",      color: "#5DCAA5", bg: "rgba(29,158,117,0.12)"  },
    { icon: "ti-flame",  name: "On Fire",       desc: "7-day streak",          color: "#FAC775", bg: "rgba(186,117,23,0.12)"  },
    { icon: "ti-trophy", name: "Top Student",   desc: "Batch 42 ranking",      color: "#D85A30", bg: "rgba(216,90,48,0.12)"   },
];

function getInitials(name) {
    if (!name) return "UX";
    return name.split(" ").filter(w => w.length > 0).map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

// ── Student Profile ─────────────────────────────────────────────
function StudentProfile({ user, profile, stats, projects, skills }) {
    const [activeTab, setActiveTab] = useState("projects");
    const tabs = [
        { key: "projects",     label: "Projects"     },
        { key: "achievements", label: "Achievements" },
    ];

    return (
        <div className="grid gap-4" style={{ gridTemplateColumns: "280px 1fr" }}>

            {/* ── Left Column ── */}
            <div className="flex flex-col gap-3">
                <div className="rounded-2xl pb-4 px-4 relative"
                    style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>

                    {/* Banner */}
                    <div className="relative rounded-xl overflow-hidden h-24 -mx-4 -mt-0"
                        style={{ background: "linear-gradient(135deg,#1a1530,#0f1f1c)" }}>
                        <div className="absolute inset-0"
                            style={{ background: "radial-gradient(circle at 30% 40%,rgba(127,119,221,0.25),transparent 60%), radial-gradient(circle at 80% 70%,rgba(29,158,117,0.2),transparent 60%)" }} />
                    </div>

                    {/* Avatar */}
                    <div className="relative" style={{ marginTop: "-36px" }}>
                        <div className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-2xl font-bold text-white relative z-10"
                            style={{ background: "linear-gradient(135deg,#534AB7,#7F77DD)", border: "3px solid #0a0a14" }}>
                            {getInitials(user?.name)}
                        </div>
                        <div className="absolute w-3.5 h-3.5 rounded-full"
                            style={{ background: "#1D9E75", border: "2.5px solid #0a0a14", bottom: "2px", right: "calc(72px - 16px)" }} />
                    </div>

                    <h1 className="text-base font-semibold text-white mt-2.5">{user?.name || "Student"}</h1>
                    <div className="flex items-center gap-1.5 mt-0.5 mb-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(127,119,221,0.12)", color: "#AFA9EC", border: "0.5px solid rgba(127,119,221,0.2)" }}>
                            Student
                        </span>
                    </div>

                    {[
                        { icon: "ti-mail",         value: user?.email || "—"              },
                        { icon: "ti-map-pin",      value: profile.location || "Pakistan"   },
                        { icon: "ti-calendar",     value: "Joined 2026"                    },
                        { icon: "ti-brand-github", value: profile.github || "github.com"   },
                    ].map((row, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs py-1.5"
                            style={{ color: "rgba(255,255,255,0.4)", borderBottom: i < 3 ? "0.5px solid rgba(255,255,255,0.05)" : "none" }}>
                            <i className={`ti ${row.icon}`} aria-hidden="true" style={{ fontSize: "14px", color: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                            {row.value}
                        </div>
                    ))}
                </div>

                {/* Skills */}
                <div className="rounded-2xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                    <h3 className="text-[11px] font-medium uppercase tracking-wider mb-2.5" style={{ color: "rgba(255,255,255,0.4)" }}>Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {skills.map(s => (
                            <span key={s} className="text-[10px] px-2.5 py-1 rounded-full"
                                style={{ background: "rgba(127,119,221,0.12)", border: "0.5px solid rgba(127,119,221,0.2)", color: "#AFA9EC" }}>{s}</span>
                        ))}
                    </div>
                </div>

                {/* About */}
                {profile.bio && (
                    <div className="rounded-2xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                        <h3 className="text-[11px] font-medium uppercase tracking-wider mb-2.5" style={{ color: "rgba(255,255,255,0.4)" }}>About</h3>
                        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{profile.bio}</p>
                    </div>
                )}
            </div>

            {/* ── Right Column ── */}
            <div className="flex flex-col gap-3">

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                    {stats.map((s, i) => (
                        <div key={i} className="rounded-xl p-3.5"
                            style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                            <div className="text-2xl font-semibold mb-0.5" style={{ color: s.color }}>{s.value}</div>
                            <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="rounded-2xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex gap-1" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
                        {tabs.map(t => (
                            <button key={t.key} onClick={() => setActiveTab(t.key)}
                                className="px-4 py-2.5 text-xs transition-all"
                                style={{
                                    background: "transparent", border: "none",
                                    borderBottom: activeTab === t.key ? "1.5px solid #7F77DD" : "1.5px solid transparent",
                                    color: activeTab === t.key ? "#AFA9EC" : "rgba(255,255,255,0.3)", cursor: "pointer",
                                }}>{t.label}</button>
                        ))}
                    </div>

                    <div className="pt-3">
                        {activeTab === "projects" && (
                            <div className="flex flex-col gap-2">
                                {projects.length === 0 && (
                                    <div className="text-xs text-center py-6" style={{ color: "rgba(255,255,255,0.2)" }}>No projects yet</div>
                                )}
                                {projects.map((p, i) => (
                                    <div key={p._id || i} className="flex items-center gap-3 p-3 rounded-xl transition-all"
                                        style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(127,119,221,0.25)"; e.currentTarget.style.background = "rgba(127,119,221,0.04)"; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
                                        <div className="w-[38px] h-[38px] rounded-lg flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                                            style={{ background: `linear-gradient(135deg,${p.gradFrom || "#534AB7"},${p.gradTo || "#7F77DD"})` }}>
                                            {p.initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>{p.name}</div>
                                            <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{p.progress}% complete · {p.tech?.slice(0, 2).join(", ")}</div>
                                        </div>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 capitalize"
                                            style={{
                                                background: p.status === "completed" ? "rgba(255,255,255,0.06)" : p.status === "review" ? "rgba(127,119,221,0.12)" : "rgba(29,158,117,0.12)",
                                                color:      p.status === "completed" ? "rgba(255,255,255,0.3)"  : p.status === "review" ? "#AFA9EC"                   : "#5DCAA5",
                                            }}>{p.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "achievements" && (
                            <div className="grid grid-cols-4 gap-2.5">
                                {ACHIEVEMENTS.map((a, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl text-center"
                                        style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: a.bg }}>
                                            <i className={`ti ${a.icon}`} aria-hidden="true" style={{ fontSize: "17px", color: a.color }} />
                                        </div>
                                        <div className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{a.name}</div>
                                        <div className="text-[9px] leading-tight" style={{ color: "rgba(255,255,255,0.2)" }}>{a.desc}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Instructor Profile ─────────────────────────────────────────
function InstructorProfile({ user, profile, stats, students, skills }) {
    return (
        <div className="grid gap-4" style={{ gridTemplateColumns: "280px 1fr" }}>

            {/* ── Left Column ── */}
            <div className="flex flex-col gap-3">
                <div className="rounded-2xl pb-4 px-4 relative"
                    style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>

                    {/* Banner */}
                    <div className="relative rounded-xl overflow-hidden h-24 -mx-4 -mt-0"
                        style={{ background: "linear-gradient(135deg,#0f1f1c,#1a1530)" }}>
                        <div className="absolute inset-0"
                            style={{ background: "radial-gradient(circle at 30% 40%,rgba(29,158,117,0.25),transparent 60%), radial-gradient(circle at 80% 70%,rgba(127,119,221,0.2),transparent 60%)" }} />
                    </div>

                    {/* Avatar */}
                    <div className="relative" style={{ marginTop: "-36px" }}>
                        <div className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-2xl font-bold text-white relative z-10"
                            style={{ background: "linear-gradient(135deg,#0F6E56,#1D9E75)", border: "3px solid #0a0a14" }}>
                            {getInitials(user?.name)}
                        </div>
                        <div className="absolute w-3.5 h-3.5 rounded-full"
                            style={{ background: "#1D9E75", border: "2.5px solid #0a0a14", bottom: "2px", right: "calc(72px - 16px)" }} />
                    </div>

                    <h1 className="text-base font-semibold text-white mt-2.5">{user?.name || "Instructor"}</h1>
                    <div className="flex items-center gap-1.5 mt-0.5 mb-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(29,158,117,0.12)", color: "#5DCAA5", border: "0.5px solid rgba(29,158,117,0.2)" }}>
                            Instructor
                        </span>
                    </div>

                    {[
                        { icon: "ti-mail",         value: user?.email || "—"              },
                        { icon: "ti-map-pin",      value: profile.location || "Pakistan"   },
                        { icon: "ti-calendar",     value: "Joined 2026"                    },
                        { icon: "ti-brand-github", value: profile.github || "github.com"   },
                    ].map((row, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs py-1.5"
                            style={{ color: "rgba(255,255,255,0.4)", borderBottom: i < 3 ? "0.5px solid rgba(255,255,255,0.05)" : "none" }}>
                            <i className={`ti ${row.icon}`} aria-hidden="true" style={{ fontSize: "14px", color: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                            {row.value}
                        </div>
                    ))}
                </div>

                {/* Expertise / Skills */}
                <div className="rounded-2xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                    <h3 className="text-[11px] font-medium uppercase tracking-wider mb-2.5" style={{ color: "rgba(255,255,255,0.4)" }}>Expertise</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {(skills.length > 0 ? skills : ["MERN Stack", "Teaching", "Code Review", "Node.js", "React"]).map(s => (
                            <span key={s} className="text-[10px] px-2.5 py-1 rounded-full"
                                style={{ background: "rgba(29,158,117,0.12)", border: "0.5px solid rgba(29,158,117,0.2)", color: "#5DCAA5" }}>{s}</span>
                        ))}
                    </div>
                </div>

                {/* About */}
                <div className="rounded-2xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                    <h3 className="text-[11px] font-medium uppercase tracking-wider mb-2.5" style={{ color: "rgba(255,255,255,0.4)" }}>About</h3>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {profile.bio || "Experienced instructor helping students build real-world projects using the MERN stack and modern development practices."}
                    </p>
                </div>
            </div>

            {/* ── Right Column ── */}
            <div className="flex flex-col gap-3">

                {/* Teaching Stats */}
                <div className="grid grid-cols-4 gap-3">
                    {stats.map((s, i) => (
                        <div key={i} className="rounded-xl p-3.5"
                            style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                            <div className="text-2xl font-semibold mb-0.5" style={{ color: s.color }}>{s.value}</div>
                            <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Enrolled Students */}
                <div className="rounded-2xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                    <h3 className="text-sm font-medium text-white mb-3">My Students</h3>
                    {students.length === 0 ? (
                        <div className="text-xs text-center py-8" style={{ color: "rgba(255,255,255,0.2)" }}>
                            No enrolled students yet.<br />
                            <span style={{ color: "rgba(255,255,255,0.1)" }}>Students enroll by selecting you during signup.</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {students.map((s, i) => (
                                <div key={s._id || i} className="flex items-center gap-3 p-3 rounded-xl transition-all"
                                    style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.06)" }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(29,158,117,0.25)"; e.currentTarget.style.background = "rgba(29,158,117,0.04)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
                                        style={{ background: s.bg || "linear-gradient(135deg,#534AB7,#7F77DD)" }}>
                                        {s.initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>{s.name}</div>
                                        <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{s.project}</div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="w-16 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                                            <div className="h-full rounded-full" style={{ width: `${s.progress}%`, background: "#1D9E75" }} />
                                        </div>
                                        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{s.progress}%</span>
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                                        style={{
                                            background: s.status === "Completed" ? "rgba(255,255,255,0.06)" : s.status === "Review due" ? "rgba(186,117,23,0.12)" : "rgba(29,158,117,0.12)",
                                            color:      s.status === "Completed" ? "rgba(255,255,255,0.3)"  : s.status === "Review due" ? "#FAC775"                  : "#5DCAA5",
                                        }}>{s.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main Profile Page ────────────────────────────────────────────
export default function Profile() {
    const { user } = useAuth();
    const isInstructor = user?.role === "instructor";

    const [profile,  setProfile]  = useState({ bio: "", location: "", github: "" });
    const [skills,   setSkills]   = useState([]);
    const [stats,    setStats]    = useState([]);
    const [projects, setProjects] = useState([]);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (isInstructor) {
                    const [profileRes, dashboardRes] = await Promise.all([
                        getUserProfile(),
                        getInstructorDashboard()
                    ]);

                    if (profileRes.data) {
                        const p = profileRes.data;
                        setProfile({ bio: p.bio || "", location: p.location || "", github: p.github || "" });
                        if (p.skills?.length > 0) setSkills(p.skills);
                    }

                    if (dashboardRes.data) {
                        const d = dashboardRes.data;
                        setStudents(d.students || []);
                        setStats([
                            { value: d.stats?.totalStudents   || 0, label: "Students",        color: "#AFA9EC" },
                            { value: d.stats?.activeProjects   || 0, label: "Active projects", color: "#5DCAA5" },
                            { value: d.stats?.pendingReviews   || 0, label: "Pending reviews", color: "#FAC775" },
                            { value: d.stats?.callsToday       || 0, label: "Calls today",     color: "#E86C6B" },
                        ]);
                    }

                } else {
                    const [profileRes, dashboardRes, projectsRes] = await Promise.all([
                        getUserProfile(),
                        getStudentDashboard(),
                        getProjects()
                    ]);

                    if (profileRes.data) {
                        const p = profileRes.data;
                        setProfile({ bio: p.bio || "", location: p.location || "", github: p.github || "" });
                        if (p.skills?.length > 0) setSkills(p.skills);
                    }

                    if (dashboardRes.data) {
                        const d = dashboardRes.data.stats || {};
                        setStats([
                            { value: d.activeProjects || 0, label: "Projects",      color: "#AFA9EC" },
                            { value: d.totalTasks     || 0, label: "Tasks pending",  color: "#5DCAA5" },
                            { value: d.codeReviews    || 0, label: "Reviews",        color: "#FAC775" },
                            { value: 3,                      label: "Months active",  color: "#E86C6B" },
                        ]);
                    }

                    if (projectsRes.data) {
                        setProjects(projectsRes.data);
                    }
                }
            } catch (err) {
                console.error("Failed to load profile data:", err);
            }
        };
        fetchData();
    }, [isInstructor]);

    return (
        <div className="min-h-screen p-5" style={{ background: "#0a0a14" }}>
            {isInstructor ? (
                <InstructorProfile
                    user={user}
                    profile={profile}
                    stats={stats}
                    students={students}
                    skills={skills}
                />
            ) : (
                <StudentProfile
                    user={user}
                    profile={profile}
                    stats={stats}
                    projects={projects}
                    skills={skills.length > 0 ? skills : ["React", "Node.js", "MongoDB", "Express", "JWT"]}
                />
            )}
        </div>
    );
}
