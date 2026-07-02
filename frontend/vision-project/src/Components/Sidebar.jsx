import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const navSections = [
    {
        label: "MAIN",
        items: [
            { path: "/", label: "Dashboard", icon: "ti-layout-dashboard", badge: null },
            { path: "/projects", label: "Projects", icon: "ti-folder", badge: "3" },
            { path: "/tasks", label: "Tasks", icon: "ti-checklist", badge: "7" },
        ],
    },
    {
        label: "COLLABORATE",
        items: [
            { path: "/review", label: "Code Review", icon: "ti-code", badge: null },
            { path: "/kanban", label: "Kanban Board", icon: "ti-layout-kanban", badge: null },
            { path: "/video", label: "Video Calls", icon: "ti-video", badge: null },
        ],
    },
    {
        label: "MY SPACE",
        items: [
            { path: "/portfolio", label: "Portfolio", icon: "ti-briefcase", badge: null },
            { path: "/settings", label: "Settings", icon: "ti-settings", badge: null },
        ],
    },
];

function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    return (
        <aside
            className="flex flex-col h-screen sticky top-0 flex-shrink-0 transition-all duration-300 z-40"
            style={{
                width: collapsed ? "58px" : "220px",
                background: "#0d0d1a",
                borderRight: "0.5px solid rgba(255,255,255,0.07)",
            }}
        >
            {/* ── Logo ── */}
            <div className="flex items-center gap-2.5 px-3 py-4 overflow-hidden flex-shrink-0"
                style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#7F77DD,#1D9E75)" }}
                >
                    UX
                </div>

                {!collapsed && (
                    <span className="text-white font-semibold text-sm tracking-tight whitespace-nowrap">
                        Upgrade<span style={{ color: "#7F77DD" }}>X</span>
                    </span>
                )}

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex items-center justify-center w-6 h-6 rounded-md transition-all flex-shrink-0"
                    style={{
                        marginLeft: collapsed ? "0" : "auto",
                        background: "rgba(255,255,255,0.04)",
                        border: "0.5px solid rgba(255,255,255,0.08)",
                        cursor: "pointer",
                    }}
                    aria-label="Toggle sidebar"
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
            <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
                {navSections.map((section, si) => (
                    <div key={si}>
                        {/* Section label */}
                        {!collapsed && (
                            <div
                                className="text-[10px] px-2 py-1 tracking-widest"
                                style={{ color: "rgba(255,255,255,0.2)" }}
                            >
                                {section.label}
                            </div>
                        )}

                        {section.items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                title={collapsed ? item.label : ""}
                                className={({ isActive }) =>
                                    `group relative flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg transition-all no-underline mb-0.5 ${isActive
                                        ? "bg-[rgba(127,119,221,0.12)]"
                                        : "hover:bg-[rgba(255,255,255,0.05)]"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <i
                                            className={`ti ${item.icon} flex-shrink-0`}
                                            aria-hidden="true"
                                            style={{
                                                fontSize: "18px",
                                                color: isActive ? "#AFA9EC" : "rgba(255,255,255,0.35)",
                                            }}
                                        />

                                        {!collapsed && (
                                            <>
                                                <span
                                                    className="text-xs flex-1 whitespace-nowrap"
                                                    style={{
                                                        color: isActive ? "#AFA9EC" : "rgba(255,255,255,0.45)",
                                                        fontWeight: isActive ? "500" : "400",
                                                    }}
                                                >
                                                    {item.label}
                                                </span>

                                                {item.badge && (
                                                    <span
                                                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                                                        style={{
                                                            background: "rgba(127,119,221,0.2)",
                                                            color: "#AFA9EC",
                                                        }}
                                                    >
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </>
                                        )}

                                        {/* Tooltip when collapsed */}
                                        {collapsed && (
                                            <div
                                                className="absolute left-full ml-2.5 px-2 py-1 rounded-md text-xs whitespace-nowrap
                          opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
                                                style={{
                                                    background: "#1a1a2e",
                                                    border: "0.5px solid rgba(255,255,255,0.1)",
                                                    color: "rgba(255,255,255,0.7)",
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                }}
                                            >
                                                {item.label}
                                            </div>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}

                        {/* Divider between sections */}
                        {si < navSections.length - 1 && (
                            <div
                                className="my-2 mx-1"
                                style={{ height: "0.5px", background: "rgba(255,255,255,0.06)" }}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* ── User Profile at bottom ── */}
            <div
                className="flex-shrink-0 p-2"
                style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}
            >
                <button
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg transition-all overflow-hidden"
                    style={{ background: "transparent", border: "none", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                        style={{ background: "linear-gradient(135deg,#534AB7,#0F6E56)" }}
                    >
                        MS
                    </div>

                    {!collapsed && (
                        <div className="text-left overflow-hidden">
                            <div className="text-xs font-medium whitespace-nowrap" style={{ color: "rgba(255,255,255,0.7)" }}>
                                Muhammad Sameer
                            </div>
                            <div className="text-[10px] whitespace-nowrap" style={{ color: "rgba(255,255,255,0.25)" }}>
                                Student · Batch 42
                            </div>
                        </div>
                    )}
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;