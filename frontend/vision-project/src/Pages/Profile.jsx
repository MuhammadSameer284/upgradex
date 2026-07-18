import { useState } from "react";
import { useAuth } from "../Context/authContext.jsx";

const STATS = [
    { value: 5,  label: "Projects",      color: "#AFA9EC" },
    { value: 24, label: "Tasks done",    color: "#5DCAA5" },
    { value: 12, label: "Reviews",       color: "#FAC775" },
    { value: 3,  label: "Months active", color: "#E86C6B" },
];

const PROJECTS = [
    { initials: "EC", name: "E-Commerce Platform", meta: "4 members · 65% complete", status: "Active", statusBg: "rgba(29,158,117,0.12)",  statusColor: "#5DCAA5",            gradFrom: "#534AB7", gradTo: "#7F77DD" },
    { initials: "SP", name: "Student Portal API",  meta: "2 members · 40% complete", status: "Active", statusBg: "rgba(29,158,117,0.12)",  statusColor: "#5DCAA5",            gradFrom: "#0F6E56", gradTo: "#1D9E75" },
    { initials: "WA", name: "Weather App",         meta: "Solo · 90% complete",      status: "Review", statusBg: "rgba(127,119,221,0.12)", statusColor: "#AFA9EC",            gradFrom: "#712B13", gradTo: "#D85A30" },
    { initials: "CB", name: "Chat Bot",            meta: "2 members · Completed",    status: "Done",   statusBg: "rgba(255,255,255,0.06)", statusColor: "rgba(255,255,255,0.3)", gradFrom: "#085041", gradTo: "#5DCAA5" },
];

const ACTIVITY = [
    { icon: "ti-checklist",       color: "#5DCAA5", bg: "rgba(29,158,117,0.12)",  text: <>Completed task <strong style={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>"Setup Express server & folder structure"</strong></>, time: "2h ago" },
    { icon: "ti-code",            color: "#7F77DD", bg: "rgba(127,119,221,0.12)", text: <>Submitted code for review on <strong style={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>E-Commerce Platform</strong></>,         time: "5h ago" },
    { icon: "ti-git-pull-request",color: "#FAC775", bg: "rgba(186,117,23,0.12)",  text: <>Sir Khalid approved your pull request on <strong style={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>Student Portal API</strong></>, time: "1d ago" },
    { icon: "ti-briefcase",       color: "#D85A30", bg: "rgba(216,90,48,0.12)",   text: <>Added <strong style={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>Weather App</strong> to your portfolio</>,                      time: "2d ago" },
    { icon: "ti-users",           color: "#5DCAA5", bg: "rgba(29,158,117,0.12)",  text: <>Joined project <strong style={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>Student Portal API</strong></>,                         time: "3d ago" },
];

const ACHIEVEMENTS = [
    { icon: "ti-rocket", name: "First Launch",  desc: "Created first project", color: "#AFA9EC", bg: "rgba(127,119,221,0.12)" },
    { icon: "ti-code",   name: "Code Reviewer", desc: "12 reviews given",      color: "#5DCAA5", bg: "rgba(29,158,117,0.12)"  },
    { icon: "ti-flame",  name: "On Fire",       desc: "7-day streak",          color: "#FAC775", bg: "rgba(186,117,23,0.12)"  },
    { icon: "ti-trophy", name: "Top Student",   desc: "Batch 42 ranking",      color: "#D85A30", bg: "rgba(216,90,48,0.12)"   },
];

const SKILLS = ["React", "Node.js", "MongoDB", "Express", "Socket.io", "Tailwind", "JWT"];

// ── Helper: get initials from full name ──────────────────────────
function getInitials(name) {
    if (!name) return "UX";
    return name.split(" ").filter(w => w.length > 0).map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function Profile() {
    const [activeTab, setActiveTab] = useState("projects");
    const { user } = useAuth(); // ✅ get real logged-in user

    const tabs = [
        { key: "projects",     label: "Projects"     },
        { key: "activity",     label: "Activity"     },
        { key: "achievements", label: "Achievements" },
    ];

    return (
        <div className="min-h-screen p-5" style={{ background: "#0a0a14" }}>
            <div className="grid gap-4" style={{ gridTemplateColumns: "280px 1fr" }}>

                {/* ───────────── LEFT COLUMN ───────────── */}
                <div className="flex flex-col gap-3">

                    <div className="rounded-2xl pb-4 px-4 relative"
                        style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>

                        {/* Cover banner */}
                        <div className="relative rounded-xl overflow-hidden h-24 -mx-4 -mt-0"
                            style={{ background: "linear-gradient(135deg,#1a1530,#0f1f1c)" }}>
                            <div className="absolute inset-0"
                                style={{ background: "radial-gradient(circle at 30% 40%,rgba(127,119,221,0.25),transparent 60%), radial-gradient(circle at 80% 70%,rgba(29,158,117,0.2),transparent 60%)" }} />
                        </div>

                        {/* Avatar — ✅ real initials from user name */}
                        <div className="relative" style={{ marginTop: "-36px" }}>
                            <div className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-2xl font-bold text-white relative z-10"
                                style={{ background: "linear-gradient(135deg,#534AB7,#7F77DD)", border: "3px solid #0a0a14" }}>
                                {getInitials(user?.name)}
                            </div>
                            <div className="absolute w-3.5 h-3.5 rounded-full"
                                style={{ background: "#1D9E75", border: "2.5px solid #0a0a14", bottom: "2px", right: "calc(72px - 16px)" }} />
                        </div>

                        {/* ✅ Real name and role from AuthContext */}
                        <h1 className="text-base font-semibold text-white mt-2.5">{user?.name || "User"}</h1>
                        <p className="text-xs mt-0.5 mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
                            MERN Stack Developer · Aptech Batch 42
                        </p>

                        <button
                            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all mb-3"
                            style={{ background: "rgba(127,119,221,0.12)", border: "0.5px solid rgba(127,119,221,0.25)", color: "#AFA9EC", cursor: "pointer" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(127,119,221,0.18)"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(127,119,221,0.12)"}
                        >
                            <i className="ti ti-edit" aria-hidden="true" style={{ fontSize: "14px" }} />
                            Edit profile
                        </button>

                        {/* ✅ Real email from AuthContext, rest is static for now */}
                        {[
                            { icon: "ti-mail",         value: user?.email || "user@aptech.com" },
                            { icon: "ti-map-pin",      value: "Karachi, Pakistan"               },
                            { icon: "ti-calendar",     value: "Joined March 2026"               },
                            { icon: "ti-brand-github", value: "github.com/sameer-ahmed"         },
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
                            {SKILLS.map(s => (
                                <span key={s} className="text-[10px] px-2.5 py-1 rounded-full"
                                    style={{ background: "rgba(127,119,221,0.12)", border: "0.5px solid rgba(127,119,221,0.2)", color: "#AFA9EC" }}>
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* About */}
                    <div className="rounded-2xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                        <h3 className="text-[11px] font-medium uppercase tracking-wider mb-2.5" style={{ color: "rgba(255,255,255,0.4)" }}>About</h3>
                        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                            MERN stack developer studying at Aptech, building real-world web apps and learning collaborative development through UpgradeX.
                        </p>
                    </div>
                </div>

                {/* ───────────── RIGHT COLUMN ───────────── */}
                <div className="flex flex-col gap-3">

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-3">
                        {STATS.map((s, i) => (
                            <div key={i} className="rounded-xl p-3.5"
                                style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                                <div className="text-2xl font-semibold mb-0.5" style={{ color: s.color }}>{s.value}</div>
                                <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Tabbed card */}
                    <div className="rounded-2xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                        <div className="flex gap-1" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
                            {tabs.map(t => (
                                <button key={t.key} onClick={() => setActiveTab(t.key)}
                                    className="px-4 py-2.5 text-xs transition-all"
                                    style={{
                                        background: "transparent", border: "none",
                                        borderBottom: activeTab === t.key ? "1.5px solid #7F77DD" : "1.5px solid transparent",
                                        color: activeTab === t.key ? "#AFA9EC" : "rgba(255,255,255,0.3)", cursor: "pointer",
                                    }}>
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <div className="pt-3">
                            {/* Projects tab */}
                            {activeTab === "projects" && (
                                <div className="flex flex-col gap-2">
                                    {PROJECTS.map((p, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                                            style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(127,119,221,0.25)"; e.currentTarget.style.background = "rgba(127,119,221,0.04)"; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
                                            <div className="w-[38px] h-[38px] rounded-lg flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                                                style={{ background: `linear-gradient(135deg,${p.gradFrom},${p.gradTo})` }}>
                                                {p.initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>{p.name}</div>
                                                <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{p.meta}</div>
                                            </div>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                                                style={{ background: p.statusBg, color: p.statusColor }}>
                                                {p.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Activity tab */}
                            {activeTab === "activity" && (
                                <div className="flex flex-col">
                                    {ACTIVITY.map((a, i) => (
                                        <div key={i} className="flex gap-2.5 py-2.5 items-start"
                                            style={{ borderBottom: i < ACTIVITY.length - 1 ? "0.5px solid rgba(255,255,255,0.05)" : "none" }}>
                                            <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: a.bg }}>
                                                <i className={`ti ${a.icon}`} aria-hidden="true" style={{ fontSize: "14px", color: a.color }} />
                                            </div>
                                            <div className="text-xs flex-1" style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{a.text}</div>
                                            <div className="text-[10px] flex-shrink-0 mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>{a.time}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Achievements tab */}
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
        </div>
    );
}
