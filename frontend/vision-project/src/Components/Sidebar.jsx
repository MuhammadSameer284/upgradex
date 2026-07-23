import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/authContext.jsx";
import { getProjects } from "../config/projectService.jsx";
import { getTasks } from "../config/taskService.jsx";
import { getReviews } from "../config/codeReviewService.jsx";

function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [projectCount, setProjectCount] = useState(0);
    const [taskCount, setTaskCount] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    useEffect(() => {
        if (!user) return;
        const fetchCounts = async () => {
            try {
                if (user.role === 'instructor') {
                    const [projRes, revRes] = await Promise.all([
                        getProjects(),
                        getReviews()
                    ]);
                    setProjectCount(projRes.data.length);
                    setReviewCount(revRes.data.filter(r => r.status === 'pending').length);
                } else {
                    const [projRes, taskRes] = await Promise.all([
                        getProjects(),
                        getTasks()
                    ]);
                    setProjectCount(projRes.data.length);
                    setTaskCount(taskRes.data.filter(t => !t.done).length);
                }
            } catch (err) {
                console.error("Failed to load sidebar counts:", err);
            }
        };
        fetchCounts();
    }, [user]);

    const studentSections = [
        {
            label: "MAIN",
            items: [
                { path: "/dashboard", label: "Dashboard",    icon: "ti-layout-dashboard", badge: null },
                { path: "/projects",  label: "Projects",     icon: "ti-folder",           badge: projectCount > 0 ? String(projectCount) : null },
                { path: "/tasks",     label: "Tasks",        icon: "ti-checklist",        badge: taskCount > 0 ? String(taskCount) : null },
            ],
        },
        {
            label: "COLLABORATE",
            items: [
                { path: "/review",    label: "Code Review",  icon: "ti-code",             badge: null },
                { path: "/kanban",    label: "Workflow Board", icon: "ti-layout-kanban",    badge: null },
                { path: "/video",     label: "Video Calls",  icon: "ti-video",            badge: null },
            ],
        },
        {
            label: "MY SPACE",
            items: [
                { path: "/portfolio", label: "Portfolio",    icon: "ti-briefcase",        badge: null },
                { path: "/settings",  label: "Settings",     icon: "ti-settings",         badge: null },
            ],
        },
    ];

    const instructorSections = [
        {
            label: "MAIN",
            items: [
                { path: "/instructor/dashboard", label: "Dashboard",      icon: "ti-layout-dashboard", badge: null },
                { path: "/projects",             label: "All Projects",   icon: "ti-folder",           badge: projectCount > 0 ? String(projectCount) : null },
            ],
        },
        {
            label: "MANAGE",
            items: [
                { path: "/review",               label: "Code Reviews",   icon: "ti-code",             badge: reviewCount > 0 ? String(reviewCount) : null },
                { path: "/kanban",               label: "Workflow Board",   icon: "ti-layout-kanban",    badge: null },
                { path: "/video",                label: "Video Calls",    icon: "ti-video",            badge: null },
            ],
        },
        {
            label: "STUDENTS",
            items: [
                { path: "/portfolio",            label: "All Portfolios", icon: "ti-briefcase",        badge: null },
                { path: "/settings",             label: "Settings",       icon: "ti-settings",         badge: null },
            ],
        },
    ];

    const navSections = user?.role === "instructor" ? instructorSections : studentSections;

    return (
        <aside
            style={{
                width: collapsed ? "58px" : "220px",
                minWidth: collapsed ? "58px" : "220px",
                background: "#0d0d1a",
                borderRight: "0.5px solid rgba(255,255,255,0.07)",
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                position: "sticky",
                top: 0,
                flexShrink: 0,
                transition: "width 0.3s ease, min-width 0.3s ease",
                zIndex: 40,
                overflow: "hidden", // ← key fix: hides scrollbar
            }}
        >
            {/* ── Logo ── */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "16px 12px",
                    borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                    flexShrink: 0,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "9px",
                        background: "linear-gradient(135deg,#7F77DD,#1D9E75)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#fff",
                        flexShrink: 0,
                    }}
                >
                    UX
                </div>

                {!collapsed && (
                    <span style={{
                        color: "#fff",
                        fontWeight: "600",
                        fontSize: "14px",
                        letterSpacing: "-0.3px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                    }}>
                        Upgrade<span style={{ color: "#7F77DD" }}>X</span>
                    </span>
                )}

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label="Toggle sidebar"
                    style={{
                        marginLeft: collapsed ? "0" : "auto",
                        width: "24px",
                        height: "24px",
                        borderRadius: "6px",
                        background: "rgba(255,255,255,0.04)",
                        border: "0.5px solid rgba(255,255,255,0.08)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <i
                        className="ti ti-chevrons-left"
                        aria-hidden="true"
                        style={{
                            fontSize: "13px",
                            color: "rgba(255,255,255,0.3)",
                            display: "block",
                            transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.25s",
                        }}
                    />
                </button>
            </div>

            {/* ── Nav Sections ── */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                padding: "8px",
            }}>
                {navSections.map((section, si) => (
                    <div key={si}>
                        {/* Section label — only when expanded */}
                        {!collapsed && (
                            <div style={{
                                fontSize: "10px",
                                color: "rgba(255,255,255,0.2)",
                                padding: "4px 8px",
                                letterSpacing: "0.07em",
                            }}>
                                {section.label}
                            </div>
                        )}

                        {section.items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                title={collapsed ? item.label : ""}
                                style={{ textDecoration: "none", display: "block", marginBottom: "2px" }}
                                className={({ isActive }) =>
                                    `group relative ${isActive ? "nav-active" : "nav-inactive"}`
                                }
                            >
                                {({ isActive }) => (
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            padding: "8px 10px",
                                            borderRadius: "9px",
                                            background: isActive ? "rgba(127,119,221,0.12)" : "transparent",
                                            transition: "background 0.15s",
                                            position: "relative",
                                            overflow: "hidden",
                                            cursor: "pointer",
                                        }}
                                        onMouseEnter={e => {
                                            if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                        }}
                                        onMouseLeave={e => {
                                            if (!isActive) e.currentTarget.style.background = "transparent";
                                        }}
                                    >
                                        {/* Icon */}
                                        <i
                                            className={`ti ${item.icon}`}
                                            aria-hidden="true"
                                            style={{
                                                fontSize: "18px",
                                                color: isActive ? "#AFA9EC" : "rgba(255,255,255,0.35)",
                                                flexShrink: 0,
                                                width: "18px",
                                            }}
                                        />

                                        {/* Label + badge — only when expanded */}
                                        {!collapsed && (
                                            <>
                                                <span style={{
                                                    fontSize: "12px",
                                                    color: isActive ? "#AFA9EC" : "rgba(255,255,255,0.45)",
                                                    fontWeight: isActive ? "500" : "400",
                                                    flex: 1,
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                }}>
                                                    {item.label}
                                                </span>

                                                {item.badge && (
                                                    <span style={{
                                                        fontSize: "10px",
                                                        padding: "1px 6px",
                                                        borderRadius: "99px",
                                                        background: "rgba(127,119,221,0.2)",
                                                        color: "#AFA9EC",
                                                        flexShrink: 0,
                                                    }}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </>
                                        )}

                                        {/* Tooltip — only when collapsed */}
                                        {collapsed && (
                                            <div
                                                className="group-hover:opacity-100"
                                                style={{
                                                    position: "absolute",
                                                    left: "calc(100% + 10px)",
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                    background: "#1a1a2e",
                                                    border: "0.5px solid rgba(255,255,255,0.1)",
                                                    color: "rgba(255,255,255,0.7)",
                                                    fontSize: "11px",
                                                    padding: "4px 8px",
                                                    borderRadius: "6px",
                                                    whiteSpace: "nowrap",
                                                    pointerEvents: "none",
                                                    opacity: 0,
                                                    transition: "opacity 0.15s",
                                                    zIndex: 50,
                                                }}
                                            >
                                                {item.label}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </NavLink>
                        ))}

                        {/* Divider between sections */}
                        {si < navSections.length - 1 && (
                            <div style={{
                                height: "0.5px",
                                background: "rgba(255,255,255,0.06)",
                                margin: "8px 4px",
                            }} />
                        )}
                    </div>
                ))}
            </div>

            {/* ── Bottom: User + Logout ── */}
            <div style={{
                flexShrink: 0,
                padding: "8px",
                borderTop: "0.5px solid rgba(255,255,255,0.06)",
            }}>
                {/* User info */}
                <button
                    onClick={() => navigate("/profile")}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        width: "100%",
                        padding: "8px",
                        borderRadius: "9px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        overflow: "hidden",
                        marginBottom: "4px",
                        transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                    <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "9px",
                        background: "linear-gradient(135deg,#534AB7,#0F6E56)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#fff",
                        flexShrink: 0,
                    }}>
                        {user?.name
                            ? user.name.split(" ").filter(w => w.length > 0).map(w => w[0]).slice(0, 2).join("").toUpperCase()
                            : "UX"
                        }
                    </div>

                    {!collapsed && (
                        <div style={{ textAlign: "left", overflow: "hidden", flex: 1 }}>
                            <div style={{
                                fontSize: "12px",
                                fontWeight: "500",
                                color: "rgba(255,255,255,0.7)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}>
                                {user?.name || "User"}
                            </div>
                            <div style={{
                                fontSize: "10px",
                                color: "rgba(255,255,255,0.25)",
                                whiteSpace: "nowrap",
                                textTransform: "capitalize",
                            }}>
                                {user?.role || "student"}
                            </div>
                        </div>
                    )}
                </button>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    title="Logout"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        width: "100%",
                        padding: "8px",
                        borderRadius: "9px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        transition: "background 0.15s",
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(224,75,74,0.08)";
                        const icon = e.currentTarget.querySelector("i");
                        const span = e.currentTarget.querySelector("span");
                        if (icon) icon.style.color = "#E24B4A";
                        if (span) span.style.color = "#E24B4A";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = "transparent";
                        const icon = e.currentTarget.querySelector("i");
                        const span = e.currentTarget.querySelector("span");
                        if (icon) icon.style.color = "rgba(255,255,255,0.2)";
                        if (span) span.style.color = "rgba(255,255,255,0.2)";
                    }}
                >
                    <i
                        className="ti ti-logout"
                        aria-hidden="true"
                        style={{
                            fontSize: "18px",
                            color: "rgba(255,255,255,0.2)",
                            flexShrink: 0,
                            width: "18px",
                        }}
                    />
                    {!collapsed && (
                        <span style={{
                            fontSize: "12px",
                            color: "rgba(255,255,255,0.2)",
                            whiteSpace: "nowrap",
                        }}>
                            Logout
                        </span>
                    )}
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;