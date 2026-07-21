import { useState, useEffect } from "react";
import { useAuth } from "../Context/authContext.jsx";
import { getUserProfile, updateUserProfile } from "../config/userService.jsx";

// ─── Toggle Switch Component ─────────────────────────────────────
function Switch({ on, onClick }) {
    return (
        <button
            onClick={onClick}
            className="relative flex-shrink-0 transition-all"
            style={{
                width: "38px", height: "22px", borderRadius: "99px",
                background: on ? "rgba(29,158,117,0.5)" : "rgba(255,255,255,0.1)",
                border: "none", cursor: "pointer",
            }}
        >
            <div
                className="absolute rounded-full transition-all"
                style={{
                    width: "16px", height: "16px", top: "3px",
                    left: on ? "19px" : "3px",
                    background: on ? "#1D9E75" : "#fff",
                }}
            />
        </button>
    );
}

// ─── Input Field ──────────────────────────────────────────────────
function Field({ label, value, onChange, disabled, type = "text", placeholder }) {
    return (
        <div>
            <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "0.5px solid rgba(255,255,255,0.1)",
                    color: disabled ? "rgba(255,255,255,0.25)" : "#fff",
                    cursor: disabled ? "not-allowed" : "text",
                }}
            />
        </div>
    );
}

// ─── Section Card ─────────────────────────────────────────────────
function Section({ title, danger, children }) {
    return (
        <div className="rounded-2xl p-4.5" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
            <h3 className="text-xs font-medium mb-3.5" style={{ color: danger ? "#E86C6B" : "rgba(255,255,255,0.7)" }}>
                {title}
            </h3>
            {children}
        </div>
    );
}

// ─── Main Settings Page ──────────────────────────────────────────
export default function Settings() {
    const [activeSection, setActiveSection] = useState("profile");
    const { user } = useAuth();
    const isInstructor = user?.role === "instructor";

    // Profile form state
    const [name,     setName]     = useState("");
    const [email,    setEmail]    = useState("");
    const [bio,      setBio]      = useState("");
    const [location, setLocation] = useState("");
    const [github,   setGithub]   = useState("");
    const [saving,   setSaving]   = useState(false);
    const [saved,    setSaved]    = useState(false);

    // Load profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getUserProfile();
                const p   = res.data;
                setName(p.name       || user?.name     || "");
                setEmail(p.email     || user?.email    || "");
                setBio(p.bio         || "");
                setLocation(p.location || "");
                setGithub(p.github   || "");
            } catch {
                // fall back to AuthContext values
                setName(user?.name  || "");
                setEmail(user?.email || "");
            }
        };
        fetchProfile();
    }, [user]);

    // Notification toggles
    const [notifs, setNotifs] = useState({
        codeReview: true,
        taskAssign: true,
        videoCall: true,
        projectUpdates: false,
        emailDigest: false,
    });
    const toggleNotif = (key) => setNotifs(prev => ({ ...prev, [key]: !prev[key] }));

    // Appearance
    const [theme, setTheme] = useState("dark");
    const [accent, setAccent] = useState("purple");

    // Security
    const [twoFA, setTwoFA] = useState(false);

    const navItems = [
        { key: "profile", label: "Profile", icon: "ti-user" },
        { key: "notifications", label: "Notifications", icon: "ti-bell" },
        { key: "appearance", label: "Appearance", icon: "ti-palette" },
        { key: "security", label: "Security", icon: "ti-lock" },
        { key: "danger", label: "Danger zone", icon: "ti-alert-triangle" },
    ];

    const themes = [
        { key: "dark", label: "Dark", preview: "#0a0a14" },
        { key: "light", label: "Light", preview: "#f1efe8" },
        { key: "system", label: "System", preview: "linear-gradient(90deg,#0a0a14 50%,#f1efe8 50%)" },
    ];

    const accentColors = [
        { key: "purple", color: "#7F77DD" },
        { key: "teal", color: "#1D9E75" },
        { key: "coral", color: "#D85A30" },
        { key: "blue", color: "#378ADD" },
        { key: "pink", color: "#D4537E" },
    ];

    const notifItems = [
        { key: "codeReview",      label: "Code review comments",  desc: isInstructor ? "Get notified when a student submits code for review"                : "Get notified when your instructor comments on your code" },
        { key: "taskAssign",      label: "Task assignments",       desc: isInstructor ? "Get notified when a student creates or updates a task"              : "Get notified when you're assigned a new task"            },
        { key: "videoCall",       label: "Video call invites",     desc: isInstructor ? "Reminders for sessions you've scheduled"                            : "Get notified for upcoming video calls from your instructor" },
        { key: "projectUpdates",  label: "Project updates",        desc: isInstructor ? "Updates from projects you've assigned to students"                  : "Updates from projects you're part of"                    },
        { key: "emailDigest",     label: "Email digest",           desc: "Weekly summary of your activity" },
    ];

    // ── Save profile handler ────────────────────────────────────────
    const handleSaveProfile = async () => {
        setSaving(true);
        setSaved(false);
        try {
            await updateUserProfile({ name, bio, location, github });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error("Failed to save profile:", err);
        } finally {
            setSaving(false);
        }
    };

    // ── Save Button ────────────────────────────────────────────────
    const SaveRow = ({ label = "Save changes", showCancel = false, onClick }) => (
        <div className="flex justify-end gap-2">
            {showCancel && (
                <button
                    className="px-4.5 py-2 rounded-lg text-xs"
                    style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "none", cursor: "pointer" }}
                >
                    Cancel
                </button>
            )}
            <button
                onClick={onClick}
                disabled={saving}
                className="px-4.5 py-2 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                style={{ background: saved ? "rgba(29,158,117,0.6)" : "linear-gradient(135deg,#7F77DD,#1D9E75)", border: "none", cursor: saving ? "wait" : "pointer" }}
            >
                {saving ? "Saving…" : saved ? "✓ Saved!" : label}
            </button>
        </div>
    );

    return (
        <div className="min-h-screen p-5" style={{ background: "#0a0a14" }}>
            <div className="grid gap-5" style={{ gridTemplateColumns: "200px 1fr" }}>

                {/* ───────────── LEFT — Nav ───────────── */}
                <div>
                    <h1 className="text-base font-semibold text-white mb-0.5">Settings</h1>
                    <p className="text-xs mb-3.5" style={{ color: "rgba(255,255,255,0.25)" }}>Manage your account</p>

                    <div className="flex flex-col gap-0.5">
                        {navItems.map(item => (
                            <button
                                key={item.key}
                                onClick={() => setActiveSection(item.key)}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-all"
                                style={{
                                    background: activeSection === item.key ? "rgba(127,119,221,0.12)" : "transparent",
                                    color: activeSection === item.key ? "#AFA9EC" : "rgba(255,255,255,0.4)",
                                    border: "none", cursor: "pointer", textAlign: "left",
                                }}
                                onMouseEnter={e => { if (activeSection !== item.key) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                                onMouseLeave={e => { if (activeSection !== item.key) e.currentTarget.style.background = "transparent"; }}
                            >
                                <i className={`ti ${item.icon}`} aria-hidden="true" style={{ fontSize: "16px" }} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ───────────── RIGHT — Content ───────────── */}
                <div className="flex flex-col gap-3.5">

                    {/* ── PROFILE ── */}
                    {activeSection === "profile" && (
                        <>
                            <Section title="Profile information">
                                {/* Avatar row */}
                                <div className="flex items-center gap-3.5 mb-4">
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                                        style={{ background: isInstructor ? "linear-gradient(135deg,#0F6E56,#1D9E75)" : "linear-gradient(135deg,#534AB7,#7F77DD)" }}
                                    >
                                        {name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "UX"}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="px-3.5 py-1.5 rounded-lg text-xs transition-all"
                                            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "0.5px solid rgba(255,255,255,0.1)", cursor: "pointer" }}
                                        >
                                            Upload photo
                                        </button>
                                        <button
                                            className="px-3.5 py-1.5 rounded-lg text-xs transition-all"
                                            style={{ background: "rgba(224,75,74,0.08)", color: "#E86C6B", border: "0.5px solid rgba(224,75,74,0.15)", cursor: "pointer" }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                {/* Form fields */}
                                <div className="flex flex-col gap-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Full name" value={name} onChange={e => setName(e.target.value)} />
                                        <Field label="Role" value={isInstructor ? "Instructor" : "Student"} disabled />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Email" value={email} onChange={e => setEmail(e.target.value)} />
                                        {isInstructor
                                            ? <Field label="Department" value="Computer Science" disabled />
                                            : <Field label="Batch" value="Batch 42" disabled />
                                        }
                                    </div>
                                    <Field label="Bio" value={bio} onChange={e => setBio(e.target.value)} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Location" value={location} onChange={e => setLocation(e.target.value)} />
                                        <Field label="GitHub" value={github} onChange={e => setGithub(e.target.value)} />
                                    </div>
                                </div>
                            </Section>

                            <SaveRow showCancel onClick={handleSaveProfile} />
                        </>
                    )}

                    {/* ── NOTIFICATIONS ── */}
                    {activeSection === "notifications" && (
                        <>
                            <Section title="Notification preferences">
                                {notifItems.map((item, i) => (
                                    <div
                                        key={item.key}
                                        className="flex items-center justify-between py-3"
                                        style={{ borderBottom: i < notifItems.length - 1 ? "0.5px solid rgba(255,255,255,0.05)" : "none" }}
                                    >
                                        <div>
                                            <div className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>{item.label}</div>
                                            <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{item.desc}</div>
                                        </div>
                                        <Switch on={notifs[item.key]} onClick={() => toggleNotif(item.key)} />
                                    </div>
                                ))}
                            </Section>

                            <SaveRow label="Save preferences" />
                        </>
                    )}

                    {/* ── APPEARANCE ── */}
                    {activeSection === "appearance" && (
                        <>
                            <Section title="Theme">
                                <div className="flex gap-2.5">
                                    {themes.map(t => (
                                        <button
                                            key={t.key}
                                            onClick={() => setTheme(t.key)}
                                            className="flex-1 rounded-xl p-2.5 text-center transition-all"
                                            style={{
                                                border: theme === t.key ? "0.5px solid rgba(127,119,221,0.4)" : "0.5px solid rgba(255,255,255,0.08)",
                                                background: theme === t.key ? "rgba(127,119,221,0.06)" : "transparent",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <div
                                                className="h-10 rounded-lg mb-1.5"
                                                style={{ background: t.preview, border: t.key !== "system" ? "0.5px solid rgba(255,255,255,0.1)" : "none" }}
                                            />
                                            <div className="text-[11px]" style={{ color: theme === t.key ? "#AFA9EC" : "rgba(255,255,255,0.4)" }}>
                                                {t.label}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </Section>

                            <Section title="Accent color">
                                <div className="flex gap-2">
                                    {accentColors.map(c => (
                                        <button
                                            key={c.key}
                                            onClick={() => setAccent(c.key)}
                                            aria-label={`${c.key} accent`}
                                            className="w-7 h-7 rounded-full transition-all relative"
                                            style={{
                                                background: c.color,
                                                border: accent === c.key ? "2px solid #fff" : "2px solid transparent",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {accent === c.key && (
                                                <span
                                                    className="absolute inset-0 rounded-full"
                                                    style={{ border: "2px solid rgba(255,255,255,0.1)" }}
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </Section>

                            <SaveRow label="Apply" />
                        </>
                    )}

                    {/* ── SECURITY ── */}
                    {activeSection === "security" && (
                        <>
                            <Section title="Change password">
                                <div className="flex flex-col gap-3">
                                    <Field label="Current password" type="password" value="••••••••" disabled={false} onChange={() => { }} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="New password" type="password" placeholder="Enter new password" value="" onChange={() => { }} />
                                        <Field label="Confirm password" type="password" placeholder="Confirm new password" value="" onChange={() => { }} />
                                    </div>
                                </div>
                            </Section>

                            <Section title="Two-factor authentication">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>Enable 2FA</div>
                                        <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>Add an extra layer of security to your account</div>
                                    </div>
                                    <Switch on={twoFA} onClick={() => setTwoFA(!twoFA)} />
                                </div>
                            </Section>

                            <SaveRow label="Update password" />
                        </>
                    )}

                    {/* ── DANGER ZONE ── */}
                    {activeSection === "danger" && (
                        <Section title="Danger zone" danger>
                            <div className="flex flex-col gap-2.5">

                                {/* Deactivate */}
                                <div
                                    className="flex items-center justify-between rounded-xl p-3.5"
                                    style={{ border: "0.5px solid rgba(224,75,74,0.2)", background: "rgba(224,75,74,0.04)" }}
                                >
                                    <div>
                                        <div className="text-xs font-medium mb-0.5" style={{ color: "#E86C6B" }}>Deactivate account</div>
                                        <div className="text-[10px]" style={{ color: "rgba(224,75,74,0.5)" }}>
                                            Temporarily disable your account. You can reactivate anytime.
                                        </div>
                                    </div>
                                    <button
                                        className="px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap"
                                        style={{ background: "rgba(224,75,74,0.15)", color: "#E86C6B", border: "none", cursor: "pointer" }}
                                    >
                                        Deactivate
                                    </button>
                                </div>

                                {/* Delete */}
                                <div
                                    className="flex items-center justify-between rounded-xl p-3.5"
                                    style={{ border: "0.5px solid rgba(224,75,74,0.2)", background: "rgba(224,75,74,0.04)" }}
                                >
                                    <div>
                                        <div className="text-xs font-medium mb-0.5" style={{ color: "#E86C6B" }}>Delete account</div>
                                        <div className="text-[10px]" style={{ color: "rgba(224,75,74,0.5)" }}>
                                            Permanently delete your account and all data. This cannot be undone.
                                        </div>
                                    </div>
                                    <button
                                        className="px-3.5 py-2 rounded-lg text-xs font-medium text-white whitespace-nowrap"
                                        style={{ background: "#E24B4A", border: "none", cursor: "pointer" }}
                                    >
                                        Delete account
                                    </button>
                                </div>
                            </div>
                        </Section>
                    )}

                </div>
            </div>
        </div>
    );
}