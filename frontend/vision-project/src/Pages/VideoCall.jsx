import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/authContext.jsx";

const PARTICIPANTS = [
    { id: 1, initials: "SK", name: "Sir Khalid",      role: "Instructor", bg: "linear-gradient(135deg,#0F6E56,#1D9E75)", speaking: true,  muted: false },
    { id: 2, initials: "MS", name: "Muhammad Sameer", role: "You",        bg: "linear-gradient(135deg,#534AB7,#7F77DD)", speaking: false, muted: false },
    { id: 3, initials: "SR", name: "Sara Raza",       role: "Student",    bg: "linear-gradient(135deg,#712B13,#D85A30)", speaking: false, muted: true  },
];

const INITIAL_MESSAGES = [
    { id: 1, sender: "Sir Khalid",      initials: "SK", bg: "linear-gradient(135deg,#0F6E56,#1D9E75)", text: "Let's go through the auth controller first.", mine: false },
    { id: 2, sender: "Sir Khalid",      initials: "SK", bg: "linear-gradient(135deg,#0F6E56,#1D9E75)", text: "Line 10 — validate email before querying the DB.", mine: false },
    { id: 3, sender: "Muhammad Sameer", initials: "MS", bg: "linear-gradient(135deg,#534AB7,#7F77DD)", text: "Got it, I'll add a regex check right away.", mine: true },
];

function VideoTile({ participant, large }) {
    return (
        <div
            className="relative rounded-xl overflow-hidden flex items-center justify-center transition-all"
            style={{
                background: "linear-gradient(135deg,#0d0d1e,#1a1a2e)",
                border: participant.speaking ? "1.5px solid rgba(29,158,117,0.6)" : "1px solid rgba(255,255,255,0.06)",
                minHeight: large ? "100%" : "140px",
            }}
        >
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at 40% 40%, ${
                        participant.bg.includes("534AB7") ? "rgba(83,74,183,0.15)" :
                        participant.bg.includes("0F6E56") ? "rgba(15,110,86,0.15)" :
                        "rgba(113,43,19,0.15)"
                    }, transparent 65%)`,
                }}
            />
            {participant.speaking && (
                <div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ border: "2px solid rgba(29,158,117,0.5)", animation: "speakPulse 1.5s infinite" }}
                />
            )}
            <div
                className="flex items-center justify-center font-semibold text-white rounded-full relative z-10 flex-shrink-0"
                style={{
                    width:    large ? "72px" : "48px",
                    height:   large ? "72px" : "48px",
                    fontSize: large ? "24px" : "16px",
                    background: participant.bg,
                }}
            >
                {participant.initials}
            </div>
            <div
                className="absolute bottom-2 left-2.5 text-[10px] font-medium text-white px-2 py-0.5 rounded-full"
                style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            >
                {participant.name} {participant.role === "You" && "· You"}
            </div>
            {participant.muted && (
                <div
                    className="absolute bottom-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(224,75,74,0.85)" }}
                >
                    <i className="ti ti-microphone-off" aria-hidden="true" style={{ fontSize: "11px", color: "#fff" }} />
                </div>
            )}
        </div>
    );
}

function CtrlBtn({ icon, iconOff, active, onClick, danger, large, label }) {
    return (
        <button
            onClick={onClick}
            title={label}
            aria-label={label}
            className="flex items-center justify-center rounded-full transition-all flex-shrink-0"
            style={{
                width:      large ? "52px" : "44px",
                height:     large ? "52px" : "44px",
                background: danger ? "#E24B4A" : active ? "rgba(255,255,255,0.1)" : "rgba(224,75,74,0.2)",
                border: "none", cursor: "pointer",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
            <i
                className={`ti ${active ? icon : (iconOff || icon)}`}
                aria-hidden="true"
                style={{
                    fontSize: "20px",
                    color: active ? "rgba(255,255,255,0.8)" : danger ? "#fff" : "#E86C6B",
                }}
            />
        </button>
    );
}

export default function VideoCall() {
    const { user }                              = useAuth();
    const [joined,       setJoined]             = useState(false);
    const [micOn,        setMicOn]              = useState(true);
    const [camOn,        setCamOn]              = useState(true);
    const [screenOn,     setScreenOn]           = useState(false);
    const [panelTab,     setPanelTab]           = useState(null);
    const [messages,     setMessages]           = useState(INITIAL_MESSAGES);
    const [msgText,      setMsgText]            = useState("");
    const [msgCounter,   setMsgCounter]         = useState(4);
    const [seconds,      setSeconds]            = useState(0);
    const timerRef   = useRef(null);
    const chatEndRef = useRef(null);
    const navigate   = useNavigate();

    useEffect(() => {
        if (joined) {
            timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [joined]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const formatTime = (s) => {
        const m   = String(Math.floor(s / 60)).padStart(2, "0");
        const sec = String(s % 60).padStart(2, "0");
        return `${m}:${sec}`;
    };

    const sendMessage = () => {
        if (!msgText.trim()) return;
        const initials = user?.name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "U";
        setMessages(prev => [...prev, {
            id:       msgCounter,
            sender:   user?.name || "You",
            initials,
            bg:       "linear-gradient(135deg,#534AB7,#7F77DD)",
            text:     msgText.trim(),
            mine:     true,
        }]);
        setMsgCounter(c => c + 1);
        setMsgText("");
    };

    const handleEndCall = () => {
        clearInterval(timerRef.current);
        setJoined(false);
        setSeconds(0);
        setScreenOn(false);
    };

    // ── Pre-join screen ──────────────────────────────────────────
    if (!joined) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#070710" }}>
                <div
                    className="w-72 rounded-2xl p-6 text-center"
                    style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}
                >
                    <div
                        className="w-full rounded-xl flex items-center justify-center mb-5 relative overflow-hidden"
                        style={{ height: "150px", background: "linear-gradient(135deg,#12121f,#1a1a2e)" }}
                    >
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: "radial-gradient(circle at 60% 40%,rgba(127,119,221,0.15),transparent 65%)" }}
                        />
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center font-semibold text-white text-xl relative z-10"
                            style={{ background: "linear-gradient(135deg,#534AB7,#7F77DD)" }}
                        >
                            {user?.name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "UX"}
                        </div>
                    </div>

                    <h2 className="text-sm font-semibold text-white mb-1">Ready to join?</h2>
                    <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>
                        E-Commerce Review · Sir Khalid is waiting
                    </p>

                    <div className="flex justify-center gap-3 mb-5">
                        {[
                            { icon: "ti-microphone", iconOff: "ti-microphone-off", state: micOn, set: setMicOn, label: "Toggle microphone" },
                            { icon: "ti-video",      iconOff: "ti-video-off",      state: camOn, set: setCamOn, label: "Toggle camera"     },
                        ].map(c => (
                            <button
                                key={c.icon}
                                onClick={() => c.set(!c.state)}
                                aria-label={c.label}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                                style={{
                                    background: c.state ? "rgba(255,255,255,0.07)" : "rgba(224,75,74,0.15)",
                                    border: "0.5px solid rgba(255,255,255,0.1)", cursor: "pointer",
                                }}
                            >
                                <i
                                    className={`ti ${c.state ? c.icon : c.iconOff}`}
                                    aria-hidden="true"
                                    style={{ fontSize: "18px", color: c.state ? "rgba(255,255,255,0.5)" : "#E86C6B" }}
                                />
                            </button>
                        ))}
                    </div>

                    {/* ✅ Instructor can schedule, student just joins */}
                    {user?.role === "instructor" && (
                        <button
                            className="w-full py-2.5 rounded-xl text-xs font-medium mb-2 transition-all"
                            style={{ background: "rgba(127,119,221,0.12)", border: "0.5px solid rgba(127,119,221,0.25)", color: "#AFA9EC", cursor: "pointer" }}
                        >
                            <i className="ti ti-calendar-plus mr-1.5" aria-hidden="true" />
                            Schedule a call
                        </button>
                    )}

                    <button
                        onClick={() => setJoined(true)}
                        className="w-full py-3 rounded-xl font-medium text-sm text-white transition-all hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#7F77DD,#1D9E75)", border: "none", cursor: "pointer" }}
                    >
                        Join call
                    </button>
                </div>
            </div>
        );
    }

    // ── In-call screen ───────────────────────────────────────────
    return (
        <div className="h-screen flex flex-col relative overflow-hidden" style={{ background: "#070710" }}>
            <style>{`@keyframes speakPulse { 0%, 100% { opacity: 0.8; } 50% { opacity: 0.2; } }`}</style>

            {/* Top bar */}
            <div
                className="flex items-center justify-between px-5 py-3 z-10 flex-shrink-0"
                style={{ background: "linear-gradient(to bottom, rgba(7,7,16,0.92), transparent)", position: "absolute", top: 0, left: 0, right: 0 }}
            >
                <div>
                    <div className="text-sm font-medium text-white">E-Commerce Platform · Code Review</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>UpgradeX Video Call</div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>
                        {formatTime(seconds)}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "#5DCAA5" }}>
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#1D9E75" }} />
                        {PARTICIPANTS.length} in call
                    </div>
                </div>
            </div>

            {/* Video grid */}
            <div
                className="flex-1 p-4 gap-3"
                style={{ display: "grid", paddingTop: "64px", paddingBottom: "88px", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" }}
            >
                <div style={{ gridColumn: "1/2", gridRow: "1/3" }}><VideoTile participant={PARTICIPANTS[0]} large /></div>
                <div style={{ gridColumn: "2/3", gridRow: "1/2" }}><VideoTile participant={PARTICIPANTS[1]} large={false} /></div>
                <div style={{ gridColumn: "2/3", gridRow: "2/3" }}><VideoTile participant={PARTICIPANTS[2]} large={false} /></div>
            </div>

            {/* Controls */}
            <div
                className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 px-6 pb-6 pt-10 z-10"
                style={{ background: "linear-gradient(to top, rgba(7,7,16,0.95), transparent)" }}
            >
                <CtrlBtn icon="ti-microphone"   iconOff="ti-microphone-off" active={micOn}    onClick={() => setMicOn(!micOn)}       label="Toggle microphone" />
                <CtrlBtn icon="ti-video"        iconOff="ti-video-off"      active={camOn}    onClick={() => setCamOn(!camOn)}       label="Toggle camera"     />
                <CtrlBtn icon="ti-screen-share"                             active={screenOn} onClick={() => setScreenOn(!screenOn)} label="Share screen"      />

                <button
                    onClick={() => setPanelTab(panelTab === "chat" ? null : "chat")}
                    aria-label="Chat"
                    className="flex items-center justify-center w-11 h-11 rounded-full transition-all relative"
                    style={{ background: panelTab === "chat" ? "rgba(127,119,221,0.25)" : "rgba(255,255,255,0.1)", border: "none", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                    <i className="ti ti-message" aria-hidden="true" style={{ fontSize: "20px", color: panelTab === "chat" ? "#AFA9EC" : "rgba(255,255,255,0.7)" }} />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "#7F77DD", border: "1.5px solid #070710" }} />
                </button>

                <button
                    onClick={() => setPanelTab(panelTab === "people" ? null : "people")}
                    aria-label="Participants"
                    className="flex items-center justify-center w-11 h-11 rounded-full transition-all"
                    style={{ background: panelTab === "people" ? "rgba(127,119,221,0.25)" : "rgba(255,255,255,0.1)", border: "none", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                    <i className="ti ti-users" aria-hidden="true" style={{ fontSize: "20px", color: panelTab === "people" ? "#AFA9EC" : "rgba(255,255,255,0.7)" }} />
                </button>

                <button
                    onClick={handleEndCall}
                    aria-label="End call"
                    className="flex items-center justify-center rounded-full transition-all"
                    style={{ width: "52px", height: "52px", background: "#E24B4A", border: "none", cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.background = "#C73B3B"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)";   e.currentTarget.style.background = "#E24B4A"; }}
                >
                    <i className="ti ti-phone-off" aria-hidden="true" style={{ fontSize: "22px", color: "#fff" }} />
                </button>
            </div>

            {/* Side panel */}
            <div
                className="absolute right-0 top-0 bottom-0 flex flex-col z-20 transition-transform duration-300"
                style={{
                    width: "260px",
                    background: "rgba(10,10,20,0.98)",
                    borderLeft: "0.5px solid rgba(255,255,255,0.07)",
                    transform: panelTab ? "translateX(0)" : "translateX(100%)",
                }}
            >
                <div className="flex flex-shrink-0" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
                    {["chat", "people"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setPanelTab(tab)}
                            className="flex-1 py-3 text-xs capitalize transition-all"
                            style={{
                                background: "transparent", border: "none",
                                borderBottom: panelTab === tab ? "1.5px solid #7F77DD" : "1.5px solid transparent",
                                color: panelTab === tab ? "#AFA9EC" : "rgba(255,255,255,0.3)", cursor: "pointer",
                            }}
                        >
                            {tab === "people" ? `People (${PARTICIPANTS.length})` : "Chat"}
                        </button>
                    ))}
                    <button
                        onClick={() => setPanelTab(null)}
                        aria-label="Close panel"
                        style={{ background: "none", border: "none", padding: "0 12px", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: "16px" }}
                    >
                        ✕
                    </button>
                </div>

                {panelTab === "chat" && (
                    <>
                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {messages.map(m => (
                                <div key={m.id} className={`flex gap-2 ${m.mine ? "flex-row-reverse" : ""}`}>
                                    {!m.mine && (
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold text-white flex-shrink-0 mt-0.5" style={{ background: m.bg }}>
                                            {m.initials}
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] flex flex-col ${m.mine ? "items-end" : "items-start"}`}>
                                        {!m.mine && <div className="text-[10px] mb-0.5 ml-1" style={{ color: "rgba(255,255,255,0.3)" }}>{m.sender}</div>}
                                        <div
                                            className="px-3 py-1.5 text-xs leading-relaxed"
                                            style={{
                                                background:   m.mine ? "rgba(127,119,221,0.2)" : "rgba(255,255,255,0.06)",
                                                borderRadius: m.mine ? "9px 0 9px 9px" : "0 9px 9px 9px",
                                                color: "rgba(255,255,255,0.75)",
                                            }}
                                        >
                                            {m.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="flex-shrink-0 p-3 flex gap-2" style={{ borderTop: "0.5px solid rgba(255,255,255,0.07)" }}>
                            <input
                                type="text"
                                value={msgText}
                                onChange={e => setMsgText(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && sendMessage()}
                                placeholder="Message..."
                                className="flex-1 rounded-lg px-3 py-2 text-xs text-white outline-none"
                                style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
                            />
                            <button onClick={sendMessage} aria-label="Send message" className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(127,119,221,0.2)", border: "none", cursor: "pointer" }}>
                                <i className="ti ti-send" aria-hidden="true" style={{ fontSize: "14px", color: "#AFA9EC" }} />
                            </button>
                        </div>
                    </>
                )}

                {panelTab === "people" && (
                    <div className="flex-1 overflow-y-auto p-3">
                        {PARTICIPANTS.map(p => (
                            <div key={p.id} className="flex items-center gap-2.5 p-2.5 rounded-xl mb-2" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.05)" }}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0" style={{ background: p.bg }}>{p.initials}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium truncate" style={{ color: "rgba(255,255,255,0.7)" }}>{p.name}</div>
                                    <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{p.role}</div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {p.muted    && <i className="ti ti-microphone-off" aria-hidden="true" style={{ fontSize: "13px", color: "#E86C6B" }} />}
                                    {p.speaking && <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#1D9E75" }} />}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {panelTab && (
                <div className="absolute inset-0 z-10" onClick={() => setPanelTab(null)} style={{ right: "260px" }} />
            )}
        </div>
    );
}
