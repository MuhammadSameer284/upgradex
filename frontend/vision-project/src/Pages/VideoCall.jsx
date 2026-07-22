import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../Context/authContext.jsx";
import { getCalls, scheduleCall } from '../config/videoCallService.jsx';
import io from 'socket.io-client';
import Peer from 'simple-peer';

// ─── Helpers ───────────────────────────────────────────────────────────────
const getInitials = (name) =>
    name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "U";

const formatDuration = (s) => {
    const h = Math.floor(s / 3600);
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return h > 0 ? `${h}:${m}:${sec}` : `${m}:${sec}`;
};

// ─── VideoTile — single participant tile ───────────────────────────────────
function VideoTile({ stream, participant, isLarge, isFocused, onClick }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream || null;
        }
    }, [stream]);

    const hasCam = participant?.camOn !== false;
    const hasMic = participant?.micOn !== false;
    const isSharing = participant?.isScreenSharing;

    return (
        <div
            className="relative rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer select-none"
            onClick={onClick}
            style={{
                background: "linear-gradient(145deg,#1a1a2e,#0d0d1e)",
                border: isFocused
                    ? "2px solid #7F77DD"
                    : "1px solid rgba(255,255,255,0.07)",
                width: "100%",
                height: "100%",
                minHeight: isLarge ? "unset" : "120px",
                transition: "border-color 0.2s",
            }}
        >
            {/* Video element — always mounted, srcObject driven by effect */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={participant?.isLocal}
                style={{
                    display: (stream && hasCam) ? "block" : "none",
                    width: "100%",
                    height: "100%",
                    objectFit: isSharing ? "contain" : "cover",
                    background: "#000",
                }}
            />

            {/* Avatar fallback */}
            {(!stream || !hasCam) && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className="rounded-full flex items-center justify-center font-bold text-white"
                        style={{
                            width: isLarge ? "96px" : "52px",
                            height: isLarge ? "96px" : "52px",
                            fontSize: isLarge ? "2rem" : "1.1rem",
                            background: participant?.bg || "linear-gradient(135deg,#534AB7,#7F77DD)",
                        }}
                    >
                        {participant?.initials || "?"}
                    </div>
                </div>
            )}

            {/* Screen share badge */}
            {isSharing && (
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(127,119,221,0.85)", backdropFilter: "blur(4px)" }}>
                    <i className="ti ti-screen-share" style={{ fontSize: "11px", color: "#fff" }} />
                    <span className="text-[10px] text-white font-medium">Screen</span>
                </div>
            )}

            {/* Name bar */}
            <div
                className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center gap-2"
                style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.75))" }}
            >
                <span className="text-xs font-medium text-white flex-1 truncate">
                    {participant?.name || "Participant"}
                    {participant?.isLocal && " (You)"}
                    {participant?.role === "instructor" && (
                        <span className="ml-1 px-1.5 py-0.5 rounded text-[9px]" style={{ background: "rgba(127,119,221,0.4)" }}>HOST</span>
                    )}
                </span>
                <div className="flex items-center gap-1">
                    {participant?.handRaised && <span className="text-sm">✋</span>}
                    {!hasMic && <i className="ti ti-microphone-off" style={{ fontSize: "12px", color: "#E86C6B" }} />}
                    {!hasCam && !isSharing && <i className="ti ti-video-off" style={{ fontSize: "12px", color: "#E86C6B" }} />}
                </div>
            </div>
        </div>
    );
}

// ─── CtrlBtn — icon button in the control bar ─────────────────────────────
function CtrlBtn({ icon, iconOff, active, onClick, danger, label, badge }) {
    return (
        <div className="relative">
            <button
                onClick={onClick}
                title={label}
                aria-label={label}
                className="flex items-center justify-center rounded-xl transition-all"
                style={{
                    width: "48px",
                    height: "48px",
                    background: danger
                        ? "#E24B4A"
                        : active
                        ? "rgba(127,119,221,0.25)"
                        : "rgba(255,255,255,0.08)",
                    border: active && !danger ? "1.5px solid rgba(127,119,221,0.4)" : "1.5px solid transparent",
                    cursor: "pointer",
                    flexShrink: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            >
                <i
                    className={`ti ${active ? icon : iconOff || icon}`}
                    aria-hidden="true"
                    style={{
                        fontSize: "20px",
                        color: danger ? "#fff" : active ? "#AFA9EC" : "rgba(255,255,255,0.55)",
                    }}
                />
            </button>
            {badge != null && badge > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: "#7F77DD" }}>
                    {badge}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function VideoCall() {
    const { user } = useAuth();
    const isInstructor = user?.role === "instructor";

    // ── Media states ────────────────────────────────────────────
    const [localStream, setLocalStream]   = useState(null); // camera stream
    const [screenStream, setScreenStream] = useState(null); // screen-capture stream
    const [micOn, setMicOn]               = useState(true);
    const [camOn, setCamOn]               = useState(true);
    const [screenOn, setScreenOn]         = useState(false);
    const [handRaised, setHandRaised]     = useState(false);

    // ── Call flow ────────────────────────────────────────────────
    const [joined, setJoined]         = useState(false);
    const [waitStatus, setWaitStatus] = useState("idle"); // idle|waiting|denied|host_missing
    const [peers, setPeers]           = useState([]);
    const [focusedPeer, setFocusedPeer] = useState(null); // peerID to show large

    // ── Room data ────────────────────────────────────────────────
    const [calls, setCalls]               = useState([]);
    const [activeCall, setActiveCall]     = useState(null);
    const [admissionRequests, setAdmissionRequests] = useState([]);

    // ── UI ───────────────────────────────────────────────────────
    const [panelTab, setPanelTab]         = useState(null); // null | "chat" | "people"
    const [messages, setMessages]         = useState([]);
    const [msgText, setMsgText]           = useState("");
    const [seconds, setSeconds]           = useState(0);
    const [newMsgCount, setNewMsgCount]   = useState(0);
    const [typingUsers, setTypingUsers]   = useState([]); // [{id, name}]
    const [joinedAt, setJoinedAt]         = useState(null); // local user's join timestamp
    const typingTimerRef                  = useRef(null);

    // ── Scheduling ───────────────────────────────────────────────
    const [showSchedule, setShowSchedule] = useState(false);
    const [sTitle, setSTitle]             = useState("");
    const [sProject, setSProject]         = useState("");
    const [sDate, setSDate]               = useState("");
    const [sNotes, setSNotes]             = useState("");
    const [scheduleError, setScheduleError] = useState("");

    // ── Refs ─────────────────────────────────────────────────────
    const socketRef  = useRef(null);
    const peersRef   = useRef([]);
    const timerRef   = useRef(null);
    const chatEndRef = useRef(null);
    const localStreamRef = useRef(null); // always holds the latest localStream

    const myInitials = getInitials(user?.name);
    const myBg = "linear-gradient(135deg,#534AB7,#7F77DD)";

    // ── Fetch calls on mount ─────────────────────────────────────
    useEffect(() => {
        const fetchCalls = async () => {
            try {
                const res = await getCalls();
                setCalls(res.data);
                const active = res.data.find(c => c.status === "live" || c.status === "scheduled");
                if (active) setActiveCall(active);
            } catch (err) {
                console.error("Failed to load calls:", err);
            }
        };
        fetchCalls();
    }, []);

    // ── Timer ────────────────────────────────────────────────────
    useEffect(() => {
        if (joined && waitStatus === "idle") {
            timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [joined, waitStatus]);

    // ── Auto-scroll chat ──────────────────────────────────────────
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ── Track new messages when chat is closed ────────────────────
    useEffect(() => {
        if (panelTab === "chat") setNewMsgCount(0);
    }, [panelTab]);

    // ── Keep localStreamRef in sync ───────────────────────────────
    useEffect(() => {
        localStreamRef.current = localStream;
    }, [localStream]);

    // ─── Create a safe dummy stream if getUserMedia fails (local testing) ──
    const getSafeStream = async () => {
        try {
            return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch {
            // Fallback: silent audio + blank canvas video
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const dst = ctx.createMediaStreamDestination();
            osc.connect(dst);
            osc.start();
            const canvas = Object.assign(document.createElement("canvas"), { width: 640, height: 480 });
            const canvasStream = canvas.captureStream(15);
            dst.stream.addTrack(canvasStream.getVideoTracks()[0]);
            return dst.stream;
        }
    };

    // ─── Peer creation helpers ─────────────────────────────────────────────
    const addPeerToState = useCallback((peerObj) => {
        peersRef.current.push(peerObj);
        setPeers(prev => [...prev, peerObj]);
    }, []);

    const createPeer = useCallback((userToSignal, callerID, stream) => {
        const peer = new Peer({ initiator: true, trickle: true, stream });
        peer.on("signal", signal => {
            socketRef.current?.emit("sending signal", {
                userToSignal, callerID, signal,
                callerName: user?.name,
                callerInitials: myInitials,
                callerBg: myBg,
                callerRole: user?.role,
            });
        });
        peer.on("stream", remoteStream => {
            peer.remoteStream = remoteStream;
            setPeers(prev => [...prev]); // force re-render
        });
        peer.on("error", err => console.warn("Peer error (initiator):", err.message));
        return peer;
    }, [user, myInitials, myBg]);

    const addPeer = useCallback((incomingSignal, callerID, stream) => {
        const peer = new Peer({ initiator: false, trickle: true, stream });
        peer.on("signal", signal => {
            socketRef.current?.emit("returning signal", {
                signal,
                callerID,
                responderName: user?.name,
                responderInitials: myInitials,
                responderBg: myBg,
                responderRole: user?.role
            });
        });
        peer.on("stream", remoteStream => {
            peer.remoteStream = remoteStream;
            setPeers(prev => [...prev]);
        });
        peer.on("error", err => console.warn("Peer error (receiver):", err.message));
        peer.signal(incomingSignal);
        return peer;
    }, [user, myInitials, myBg]);

    // ─── Push a system message into chat ──────────────────────────────────
    const pushSystem = useCallback((text) => {
        setMessages(prev => [...prev, { id: Date.now() + Math.random(), text, isSystem: true }]);
        setNewMsgCount(c => c + 1);
    }, []);

    // ─── Main join handler ────────────────────────────────────────────────
    const startCall = async () => {
        if (!activeCall) return;
        setJoined(true);
        if (!isInstructor) setWaitStatus("waiting");

        const stream = await getSafeStream();
        setLocalStream(stream);
        localStreamRef.current = stream;

        stream.getVideoTracks().forEach(t => (t.enabled = camOn));
        stream.getAudioTracks().forEach(t => (t.enabled = micOn));

        const socket = io("http://localhost:3000", { withCredentials: true });
        socketRef.current = socket;

        socket.emit("request join", {
            roomID: activeCall._id,
            role: user?.role,
            name: user?.name,
            initials: myInitials,
            bg: myBg,
        });

        // ── Waiting room ────────────────────────────────────────────
        socket.on("admission approved", () => setWaitStatus("idle"));
        socket.on("admission denied",   () => setWaitStatus("denied"));
        socket.on("host missing",       () => setWaitStatus("host_missing"));
        socket.on("admission request",  (req) => setAdmissionRequests(prev => [...prev, req]));
        
        socket.on("host arrived", () => {
            // Re-request join since host has arrived
            socket.emit("request join", {
                roomID: activeCall._id,
                role: user?.role,
                name: user?.name,
                initials: myInitials,
                bg: myBg,
            });
            setWaitStatus("waiting");
        });

        // Record when we joined
        setJoinedAt(new Date());

        // ── Existing users in room (sent after joining) ─────────────
        socket.on("all users", (userIDs) => {
            const newPeers = userIDs.map(uid => {
                const peer = createPeer(uid, socket.id, stream);
                const obj = {
                    peerID: uid, peer,
                    camOn: true, micOn: true,
                    isScreenSharing: false, handRaised: false,
                    name: "Connecting…", initials: "…",
                    bg: "#555", role: "student",
                    joinedAt: new Date(),
                };
                return obj;
            });
            peersRef.current = newPeers;
            setPeers(newPeers);
        });

        // ── New participant arrives (fires on existing users) ────────
        socket.on("user joined", (payload) => {
            const existing = peersRef.current.find(p => p.peerID === payload.callerID);
            if (existing) {
                // If it already exists, this is a trickle ICE candidate. Signal it!
                existing.peer.signal(payload.signal);
                return;
            }

            const peer = addPeer(payload.signal, payload.callerID, localStreamRef.current);
            const obj = {
                peerID: payload.callerID, peer,
                camOn: true, micOn: true,
                isScreenSharing: false, handRaised: false,
                name: payload.callerName || "Participant",
                initials: payload.callerInitials || "P",
                bg: payload.callerBg || "#1D9E75",
                role: payload.callerRole || "student",
                joinedAt: new Date(),
            };
            peersRef.current = [...peersRef.current, obj];
            setPeers(prev => [...prev, obj]);
            pushSystem(`${obj.name} joined the call`);
            // Auto-open people panel to show who joined
            setPanelTab(pt => pt === null ? "people" : pt);
        });

        // ── Typing indicator ─────────────────────────────────────────
        socket.on("user typing", ({ id, name, isTyping }) => {
            setTypingUsers(prev =>
                isTyping
                    ? prev.some(u => u.id === id) ? prev : [...prev, { id, name }]
                    : prev.filter(u => u.id !== id)
            );
        });

        // ── ICE answer / Candidate ───────────────────────────────────
        socket.on("receiving returned signal", (payload) => {
            const item = peersRef.current.find(p => p.peerID === payload.id);
            if (item) {
                item.peer.signal(payload.signal);
                // Also update the responder's profile details so they are not "Connecting..."
                if (payload.responderName) {
                    item.name = payload.responderName;
                    item.initials = payload.responderInitials;
                    item.bg = payload.responderBg;
                    item.role = payload.responderRole;
                    setPeers(prev => [...prev]); // force re-render
                }
            }
        });

        // ── Chat ─────────────────────────────────────────────────────
        socket.on("new message", (message) => {
            // Ensure ts is always present (fallback to now if sender's clock differs)
            const msg = { ...message, ts: message.ts || new Date().toISOString() };
            setMessages(prev => [...prev, msg]);
            setNewMsgCount(c => c + 1);
        });

        // ── Media toggles ─────────────────────────────────────────────
        socket.on("user toggled media", ({ id, camOn: pCam, micOn: pMic }) => {
            peersRef.current = peersRef.current.map(p =>
                p.peerID === id ? { ...p, camOn: pCam, micOn: pMic } : p
            );
            setPeers(prev => prev.map(p =>
                p.peerID === id ? { ...p, camOn: pCam, micOn: pMic } : p
            ));
        });

        // ── Screen share toggle ───────────────────────────────────────
        socket.on("user toggled screen share", ({ id, isScreenSharing }) => {
            peersRef.current = peersRef.current.map(p =>
                p.peerID === id ? { ...p, isScreenSharing } : p
            );
            setPeers(prev => prev.map(p =>
                p.peerID === id ? { ...p, isScreenSharing } : p
            ));
            if (isScreenSharing) {
                // Auto-focus the person who is sharing
                setFocusedPeer(id);
                setPanelTab(null);
            } else {
                setFocusedPeer(fid => (fid === id ? null : fid));
            }
        });

        // ── Hand raise ────────────────────────────────────────────────
        socket.on("user raised hand", ({ id, handRaised: hr }) => {
            peersRef.current = peersRef.current.map(p =>
                p.peerID === id ? { ...p, handRaised: hr } : p
            );
            setPeers(prev => prev.map(p =>
                p.peerID === id ? { ...p, handRaised: hr } : p
            ));
        });

        // ── Participant left ───────────────────────────────────────────
        socket.on("user left", (id) => {
            const leaving = peersRef.current.find(p => p.peerID === id);
            if (leaving) {
                leaving.peer?.destroy();
                pushSystem(`${leaving.name} left the call`);
            }
            peersRef.current = peersRef.current.filter(p => p.peerID !== id);
            setPeers(prev => prev.filter(p => p.peerID !== id));
            setFocusedPeer(fid => (fid === id ? null : fid));
        });
    };

    // ─── Leave call ────────────────────────────────────────────────────────
    const handleEndCall = () => {
        clearInterval(timerRef.current);
        localStream?.getTracks().forEach(t => t.stop());
        screenStream?.getTracks().forEach(t => t.stop());
        socketRef.current?.disconnect();
        peersRef.current.forEach(p => p.peer?.destroy());
        peersRef.current = [];
        setPeers([]);
        setJoined(false);
        setWaitStatus("idle");
        setAdmissionRequests([]);
        setSeconds(0);
        setScreenOn(false);
        setScreenStream(null);
        setHandRaised(false);
        setMessages([]);
        setFocusedPeer(null);
    };

    // ─── Media controls ────────────────────────────────────────────────────
    const toggleMic = () => {
        if (!localStream) return;
        const next = !micOn;
        localStream.getAudioTracks().forEach(t => (t.enabled = next));
        setMicOn(next);
        socketRef.current?.emit("toggle media", { roomID: activeCall._id, micOn: next, camOn });
    };

    const toggleCam = () => {
        if (!localStream) return;
        const next = !camOn;
        localStream.getVideoTracks().forEach(t => (t.enabled = next));
        setCamOn(next);
        socketRef.current?.emit("toggle media", { roomID: activeCall._id, micOn, camOn: next });
    };

    // ─── Screen share — sends a SEPARATE stream to each peer ─────────────
    // This is the correct approach: open a new peer connection with the screen
    // stream so we don't break the camera feed for anyone.
    // For simplicity (mesh model) we add a second "screen" video track via
    // replaceTrack so that the remote peer's single stream shows the screen.
    const toggleScreenShare = async () => {
        if (screenOn) {
            // Stop screen share
            screenStream?.getTracks().forEach(t => t.stop());
            setScreenStream(null);
            setScreenOn(false);

            // Revert all peers back to camera video track
            const camTrack = localStream?.getVideoTracks()[0];
            if (camTrack) {
                peersRef.current.forEach(p => {
                    try {
                        // Find the current video sender and replace back
                        const videoSenders = p.peer._pc?.getSenders?.() || [];
                        const vs = videoSenders.find(s => s.track?.kind === "video");
                        if (vs) vs.replaceTrack(camTrack);
                    } catch (e) {
                        console.warn("replaceTrack cam error", e);
                    }
                });
            }

            socketRef.current?.emit("screen share toggle", { roomID: activeCall._id, isScreenSharing: false });
            setFocusedPeer(null);
        } else {
            try {
                const ss = await navigator.mediaDevices.getDisplayMedia({
                    video: { frameRate: 30, width: { ideal: 1920 }, height: { ideal: 1080 } },
                    audio: false,
                });
                const screenTrack = ss.getVideoTracks()[0];
                setScreenStream(ss);
                setScreenOn(true);

                // Replace video track on every existing peer connection
                peersRef.current.forEach(p => {
                    try {
                        const videoSenders = p.peer._pc?.getSenders?.() || [];
                        const vs = videoSenders.find(s => s.track?.kind === "video");
                        if (vs) vs.replaceTrack(screenTrack);
                    } catch (e) {
                        console.warn("replaceTrack screen error", e);
                    }
                });

                socketRef.current?.emit("screen share toggle", { roomID: activeCall._id, isScreenSharing: true });
                setFocusedPeer("local");

                // When the user clicks browser's "Stop sharing" button
                screenTrack.onended = () => toggleScreenShare();
            } catch (e) {
                console.error("Screen share failed:", e);
            }
        }
    };

    const toggleHandRaise = () => {
        const next = !handRaised;
        setHandRaised(next);
        socketRef.current?.emit("raise hand", { roomID: activeCall._id, handRaised: next });
    };

    const handleApprove = (req) => {
        socketRef.current?.emit("approve join", { studentId: req.studentId, roomID: activeCall._id });
        setAdmissionRequests(prev => prev.filter(r => r.studentId !== req.studentId));
    };

    const handleDeny = (req) => {
        socketRef.current?.emit("deny join", { studentId: req.studentId });
        setAdmissionRequests(prev => prev.filter(r => r.studentId !== req.studentId));
    };

    const sendMessage = () => {
        if (!msgText.trim() || !socketRef.current) return;
        const msg = {
            id: Date.now(),
            roomID: activeCall._id,
            sender: user?.name || "You",
            initials: myInitials,
            bg: myBg,
            text: msgText.trim(),
            ts: new Date().toISOString(),
        };
        socketRef.current.emit("send message", msg);
        // Stop typing indicator
        socketRef.current.emit("typing", { roomID: activeCall._id, name: user?.name, isTyping: false });
        clearTimeout(typingTimerRef.current);
        setMessages(prev => [...prev, { ...msg, mine: true }]);
        setMsgText("");
    };

    const handleMsgInput = (e) => {
        setMsgText(e.target.value);
        if (!socketRef.current || !activeCall) return;
        socketRef.current.emit("typing", { roomID: activeCall._id, name: user?.name, isTyping: true });
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
            socketRef.current?.emit("typing", { roomID: activeCall._id, name: user?.name, isTyping: false });
        }, 2000);
    };

    // ─── Layout helpers ────────────────────────────────────────────────────
    const totalParticipants = peers.length + 1;

    // Find which peer (if any) is screen sharing to give them the spotlight
    const screenSharePeer = peers.find(p => p.isScreenSharing);
    const spotlightPeerID = focusedPeer === "local" ? "local" : (focusedPeer || screenSharePeer?.peerID || null);

    const getGridStyle = () => {
        if (spotlightPeerID) {
            // Spotlight mode: big main + strip on the right
            return { display: "flex", gap: "12px" };
        }
        const cols = totalParticipants <= 1 ? 1 : totalParticipants <= 4 ? 2 : 3;
        return { display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "12px" };
    };

    // ═══════════════════════════════════════════════════════════════════════
    // ── PRE-JOIN SCREEN ──────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════
    if (!joined) {
        return (
            <div style={{ minHeight: "100vh", background: "#07070f", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "360px", borderRadius: "20px", padding: "28px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: "24px" }}>
                        <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: myBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: "1.6rem", fontWeight: 700, color: "#fff" }}>
                            {myInitials}
                        </div>
                        <div style={{ color: "#fff", fontWeight: 600, fontSize: "15px" }}>{user?.name}</div>
                        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginTop: "2px" }}>
                            {isInstructor ? "👑 Instructor · Host" : "Student"}
                        </div>
                    </div>

                    {/* Mic/Cam pre-toggles */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "24px" }}>
                        {[
                            { on: micOn, setOn: setMicOn, iconOn: "ti-microphone", iconOff: "ti-microphone-off", label: "Mic" },
                            { on: camOn, setOn: setCamOn, iconOn: "ti-video",       iconOff: "ti-video-off",       label: "Camera" },
                        ].map(c => (
                            <button key={c.label} onClick={() => c.setOn(!c.on)} title={c.label}
                                style={{ width: "48px", height: "48px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: c.on ? "rgba(127,119,221,0.15)" : "rgba(224,75,74,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <i className={`ti ${c.on ? c.iconOn : c.iconOff}`} style={{ fontSize: "20px", color: c.on ? "#AFA9EC" : "#E86C6B" }} />
                            </button>
                        ))}
                    </div>

                    {/* Upcoming sessions */}
                    {calls.length > 0 && (
                        <div style={{ marginBottom: "16px" }}>
                            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                                {isInstructor ? "Your Sessions" : "Available Sessions"}
                            </div>
                            {calls.filter(c => c.status !== "ended").slice(0, 4).map(c => (
                                <div key={c._id} onClick={() => setActiveCall(c)}
                                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", marginBottom: "6px", cursor: "pointer", background: activeCall?._id === c._id ? "rgba(127,119,221,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${activeCall?._id === c._id ? "rgba(127,119,221,0.35)" : "rgba(255,255,255,0.06)"}` }}>
                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, background: c.status === "live" ? "#1D9E75" : "#7F77DD" }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                                        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
                                            {c.status === "live" ? "🔴 Live now" : new Date(c.scheduledAt).toLocaleString()}
                                        </div>
                                    </div>
                                    {c.status === "live" && <span style={{ fontSize: "10px", color: "#1D9E75", fontWeight: 600 }}>JOIN</span>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Instructor-only: Schedule button */}
                    {isInstructor && (
                        <button onClick={() => setShowSchedule(true)}
                            style={{ width: "100%", padding: "10px", borderRadius: "10px", background: "rgba(127,119,221,0.1)", border: "1px solid rgba(127,119,221,0.25)", color: "#AFA9EC", fontSize: "12px", cursor: "pointer", marginBottom: "10px", fontWeight: 500 }}>
                            <i className="ti ti-calendar-plus" style={{ marginRight: "6px" }} />
                            Schedule a new session
                        </button>
                    )}

                    {/* Join button */}
                    <button onClick={startCall} disabled={!activeCall}
                        style={{ width: "100%", padding: "13px", borderRadius: "12px", background: activeCall ? "linear-gradient(135deg,#7F77DD,#1D9E75)" : "rgba(255,255,255,0.05)", color: "#fff", fontWeight: 600, fontSize: "14px", cursor: activeCall ? "pointer" : "not-allowed", border: "none", opacity: activeCall ? 1 : 0.5 }}>
                        {isInstructor ? "🎙 Start Session" : "→ Join Session"}
                    </button>

                    {!activeCall && (
                        <div style={{ textAlign: "center", marginTop: "10px", fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>
                            {isInstructor ? "Schedule a session above, then join it." : "No active session available yet. Wait for your instructor."}
                        </div>
                    )}
                </div>

                {/* Schedule Modal */}
                {showSchedule && (
                    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
                        onClick={e => { if (e.target === e.currentTarget) { setShowSchedule(false); setScheduleError(""); } }}>
                        <div style={{ width: "340px", borderRadius: "18px", padding: "24px", background: "#13131f", border: "1px solid rgba(255,255,255,0.1)" }}>
                            <h2 style={{ color: "#fff", fontSize: "14px", fontWeight: 600, marginBottom: "16px" }}>Schedule a Session</h2>
                            {[
                                { label: "Session title *", val: sTitle, set: setSTitle, placeholder: "e.g. Code Review Session" },
                                { label: "Project name", val: sProject, set: setSProject, placeholder: "e.g. E-Commerce Platform" },
                                { label: "Notes / Agenda", val: sNotes, set: setSNotes, placeholder: "Optional agenda notes…" },
                            ].map(f => (
                                <div key={f.label} style={{ marginBottom: "12px" }}>
                                    <label style={{ display: "block", fontSize: "11px", color: "rgba(255,255,255,0.35)", marginBottom: "5px" }}>{f.label}</label>
                                    <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
                                </div>
                            ))}
                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ display: "block", fontSize: "11px", color: "rgba(255,255,255,0.35)", marginBottom: "5px" }}>Date & Time</label>
                                <input type="datetime-local" value={sDate} onChange={e => setSDate(e.target.value)}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "12px", outline: "none", colorScheme: "dark", boxSizing: "border-box" }} />
                            </div>
                            
                            {scheduleError && (
                                <div style={{ color: "#E86C6B", fontSize: "11px", marginBottom: "12px", textAlign: "left" }}>
                                    ⚠️ {scheduleError}
                                </div>
                            )}

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                <button onClick={() => { setShowSchedule(false); setScheduleError(""); }}
                                    style={{ padding: "9px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "12px", cursor: "pointer" }}>
                                    Cancel
                                </button>
                                <button onClick={async () => {
                                    if (!sTitle.trim()) {
                                        setScheduleError("Session title is required.");
                                        return;
                                    }
                                    try {
                                        setScheduleError("");
                                        await scheduleCall({ title: sTitle.trim(), projectName: sProject.trim(), scheduledAt: sDate || new Date().toISOString(), notes: sNotes.trim(), duration: 60 });
                                        const res = await getCalls();
                                        setCalls(res.data);
                                        setShowSchedule(false);
                                        setSTitle(""); setSProject(""); setSDate(""); setSNotes("");
                                    } catch (e) {
                                        console.error(e);
                                        setScheduleError(e.response?.data?.message || "Failed to schedule session. Check server connections.");
                                    }
                                }}
                                    style={{ padding: "9px", borderRadius: "8px", background: "linear-gradient(135deg,#7F77DD,#1D9E75)", border: "none", color: "#fff", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                                    Schedule
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ── WAITING ROOM (students only) ────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════
    if (waitStatus !== "idle") {
        const msgs = {
            waiting: { icon: "ti-hourglass", title: "Waiting for host…", body: "The instructor will let you in shortly.", color: "#7F77DD" },
            host_missing: { icon: "ti-alert-circle", title: "Host hasn't started yet", body: "The instructor hasn't joined. Please wait.", color: "#EF9F27" },
            denied: { icon: "ti-ban", title: "Entry denied", body: "The instructor did not allow you to join.", color: "#E24B4A" },
        };
        const m = msgs[waitStatus] || msgs.waiting;
        return (
            <div style={{ minHeight: "100vh", background: "#07070f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: `${m.color}22`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                    <i className={`ti ${m.icon}`} style={{ fontSize: "30px", color: m.color }} />
                </div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>{m.title}</h2>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", textAlign: "center", maxWidth: "300px", lineHeight: 1.5, marginBottom: "28px" }}>{m.body}</p>
                <button onClick={handleEndCall}
                    style={{ padding: "10px 24px", borderRadius: "10px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontSize: "13px", cursor: "pointer" }}>
                    Leave
                </button>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ── IN-CALL SCREEN ─────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════

    // Build the local participant descriptor
    const localParticipant = {
        name: user?.name,
        initials: myInitials,
        isLocal: true,
        bg: myBg,
        camOn,
        micOn,
        handRaised,
        isScreenSharing: screenOn,
        role: user?.role,
    };

    // Current local video stream to render
    const localDisplayStream = screenOn ? screenStream : localStream;

    // All participants for the "people" panel
    const allParticipants = [
        { ...localParticipant, peerID: "local" },
        ...peers,
    ];

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#07070f", color: "#fff", position: "relative", overflow: "hidden" }}>

            {/* ── KEYFRAMES ─────────────────────────────────────────── */}
            <style>{`
                @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
                .vc-fadein { animation: fadeIn 0.25s ease forwards; }
                @keyframes pulse2 { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
            `}</style>

            {/* ── TOP BAR ──────────────────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", background: "rgba(7,7,16,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, zIndex: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1D9E75", animation: "pulse2 1.5s ease infinite" }} />
                    <div>
                        <div style={{ fontSize: "13px", fontWeight: 600 }}>{activeCall?.title || "Session"}</div>
                        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>UpgradeX · {activeCall?.instructorName}</div>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>{formatDuration(seconds)}</span>
                    <span style={{ fontSize: "11px", color: "#5DCAA5", fontWeight: 500 }}>● {totalParticipants} in call</span>
                    {isInstructor && (
                        <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", background: "rgba(127,119,221,0.2)", color: "#AFA9EC", fontWeight: 600 }}>HOST</span>
                    )}
                </div>
            </div>

            {/* ── ADMISSION REQUESTS (instructor only) ──────────────── */}
            {isInstructor && admissionRequests.length > 0 && (
                <div style={{ position: "absolute", top: "60px", right: "16px", zIndex: 100, display: "flex", flexDirection: "column", gap: "8px" }}>
                    {admissionRequests.map(req => (
                        <div key={req.studentId} className="vc-fadein"
                            style={{ width: "280px", padding: "14px", borderRadius: "14px", background: "rgba(15,15,28,0.96)", border: "1px solid rgba(127,119,221,0.35)", backdropFilter: "blur(16px)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                                <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: req.bg || "#7F77DD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>{req.initials}</div>
                                <div>
                                    <div style={{ fontSize: "13px", fontWeight: 600 }}>{req.name}</div>
                                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Wants to join the call</div>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => handleDeny(req)}
                                    style={{ flex: 1, padding: "8px", borderRadius: "8px", background: "rgba(226,75,74,0.15)", border: "1px solid rgba(226,75,74,0.35)", color: "#E86C6B", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                                    Deny
                                </button>
                                <button onClick={() => handleApprove(req)}
                                    style={{ flex: 1, padding: "8px", borderRadius: "8px", background: "#1D9E75", border: "none", color: "#fff", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                                    Admit ✓
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── MAIN CONTENT (video + panel) ─────────────────────── */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

                {/* Video area */}
                <div style={{ flex: 1, padding: "14px", overflow: "hidden", display: "flex", flexDirection: "column" }}>

                    {/* Spotlight mode */}
                    {spotlightPeerID ? (
                        <div style={{ display: "flex", gap: "10px", height: "100%" }}>
                            {/* Large spotlight tile */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                {spotlightPeerID === "local" ? (
                                    <VideoTile
                                        stream={localDisplayStream}
                                        participant={localParticipant}
                                        isLarge={true}
                                        isFocused={true}
                                        onClick={() => setFocusedPeer(null)}
                                    />
                                ) : (
                                    (() => {
                                        const sp = peers.find(p => p.peerID === spotlightPeerID);
                                        return sp ? (
                                            <VideoTile
                                                stream={sp.peer?.remoteStream}
                                                participant={sp}
                                                isLarge={true}
                                                isFocused={true}
                                                onClick={() => setFocusedPeer(null)}
                                            />
                                        ) : null;
                                    })()
                                )}
                            </div>

                            {/* Thumbnail strip */}
                            <div style={{ width: "160px", display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto" }}>
                                {/* Local thumb (only if not in spotlight) */}
                                {spotlightPeerID !== "local" && (
                                    <div style={{ height: "100px", flexShrink: 0 }}>
                                        <VideoTile
                                            stream={localDisplayStream}
                                            participant={localParticipant}
                                            isFocused={false}
                                            onClick={() => setFocusedPeer("local")}
                                        />
                                    </div>
                                )}
                                {peers.filter(p => p.peerID !== spotlightPeerID).map(p => (
                                    <div key={p.peerID} style={{ height: "100px", flexShrink: 0 }}>
                                        <VideoTile
                                            stream={p.peer?.remoteStream}
                                            participant={p}
                                            isFocused={false}
                                            onClick={() => setFocusedPeer(p.peerID)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // Grid mode
                        <div style={{ ...getGridStyle(), height: "100%" }}>
                            <VideoTile
                                stream={localDisplayStream}
                                participant={localParticipant}
                                isLarge={totalParticipants === 1}
                                isFocused={false}
                                onClick={() => setFocusedPeer("local")}
                            />
                            {peers.map(p => (
                                <VideoTile
                                    key={p.peerID}
                                    stream={p.peer?.remoteStream}
                                    participant={p}
                                    isLarge={totalParticipants === 2}
                                    isFocused={false}
                                    onClick={() => setFocusedPeer(p.peerID)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── SIDE PANEL ──────────────────────────────────────── */}
                {panelTab && (
                    <div className="vc-fadein" style={{ width: "300px", borderLeft: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", flexShrink: 0, background: "#0e0e1a" }}>

                        {/* Panel header tabs */}
                        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0, padding: "0 4px" }}>
                            {["people", "chat"].map(tab => (
                                <button key={tab} onClick={() => { setPanelTab(tab); if (tab === "chat") setNewMsgCount(0); }}
                                    style={{ flex: 1, padding: "14px 0 12px", fontSize: "12px", background: "none", border: "none", borderBottom: panelTab === tab ? "2px solid #7F77DD" : "2px solid transparent", color: panelTab === tab ? "#AFA9EC" : "rgba(255,255,255,0.3)", cursor: "pointer", fontWeight: panelTab === tab ? 600 : 400, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", position: "relative" }}>
                                    {tab === "people" ? (
                                        <><i className="ti ti-users" style={{ fontSize: "14px" }} /> People <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "99px", background: panelTab === tab ? "rgba(127,119,221,0.3)" : "rgba(255,255,255,0.08)", color: panelTab === tab ? "#AFA9EC" : "rgba(255,255,255,0.35)" }}>{totalParticipants}</span></>
                                    ) : (
                                        <><i className="ti ti-message" style={{ fontSize: "14px" }} /> Chat {newMsgCount > 0 && panelTab !== "chat" && <span style={{ position: "absolute", top: "10px", right: "20px", width: "16px", height: "16px", borderRadius: "50%", background: "#7F77DD", fontSize: "9px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{newMsgCount}</span>}</>
                                    )}
                                </button>
                            ))}
                            <button onClick={() => setPanelTab(null)}
                                style={{ padding: "0 14px", background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: "18px", lineHeight: 1 }}>✕</button>
                        </div>

                        {/* ═══ PEOPLE TAB ═══════════════════════════════════ */}
                        {panelTab === "people" && (
                            <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>

                                {/* Section: In this call */}
                                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", padding: "0 4px" }}>
                                    In this call — {totalParticipants}
                                </div>

                                {allParticipants.map((p, idx) => {
                                    const isHost = p.role === "instructor";
                                    const joinTime = p.isLocal ? joinedAt : p.joinedAt;
                                    const joinStr = joinTime ? joinTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;
                                    return (
                                        <div key={p.peerID} className="vc-fadein"
                                            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "10px", marginBottom: "4px", background: p.isLocal ? "rgba(127,119,221,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${p.isLocal ? "rgba(127,119,221,0.15)" : "rgba(255,255,255,0.04)"}`, transition: "background 0.2s" }}>

                                            {/* Avatar with online dot */}
                                            <div style={{ position: "relative", flexShrink: 0 }}>
                                                <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: p.bg || myBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#fff", border: isHost ? "2px solid rgba(127,119,221,0.6)" : "2px solid transparent" }}>
                                                    {p.initials}
                                                </div>
                                                {/* Online indicator */}
                                                <div style={{ position: "absolute", bottom: "1px", right: "1px", width: "10px", height: "10px", borderRadius: "50%", background: "#1D9E75", border: "2px solid #0e0e1a" }} />
                                            </div>

                                            {/* Name + role + join time */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                    <span style={{ fontSize: "12px", fontWeight: 600, color: p.isLocal ? "#AFA9EC" : "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "110px" }}>
                                                        {p.name}
                                                    </span>
                                                    {p.isLocal && <span style={{ fontSize: "9px", color: "rgba(127,119,221,0.8)", background: "rgba(127,119,221,0.12)", padding: "1px 5px", borderRadius: "4px" }}>YOU</span>}
                                                    {isHost && <span style={{ fontSize: "9px", color: "#EF9F27", background: "rgba(239,159,39,0.12)", padding: "1px 5px", borderRadius: "4px" }}>HOST</span>}
                                                </div>
                                                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: "1px" }}>
                                                    {isHost ? "Instructor" : "Student"}{joinStr && ` · joined ${joinStr}`}
                                                </div>
                                            </div>

                                            {/* Status icons */}
                                            <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                                                {p.handRaised && (
                                                    <span title="Hand raised" style={{ fontSize: "14px", animation: "pulse2 1s ease infinite" }}>✋</span>
                                                )}
                                                {p.isScreenSharing && (
                                                    <div title="Sharing screen" style={{ width: "22px", height: "22px", borderRadius: "6px", background: "rgba(127,119,221,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <i className="ti ti-screen-share" style={{ fontSize: "11px", color: "#AFA9EC" }} />
                                                    </div>
                                                )}
                                                <div title={p.micOn !== false ? "Mic on" : "Muted"} style={{ width: "22px", height: "22px", borderRadius: "6px", background: p.micOn !== false ? "rgba(29,158,117,0.15)" : "rgba(226,75,74,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <i className={`ti ${p.micOn !== false ? "ti-microphone" : "ti-microphone-off"}`} style={{ fontSize: "11px", color: p.micOn !== false ? "#1D9E75" : "#E86C6B" }} />
                                                </div>
                                                <div title={p.camOn !== false ? "Cam on" : "Cam off"} style={{ width: "22px", height: "22px", borderRadius: "6px", background: p.camOn !== false ? "rgba(29,158,117,0.15)" : "rgba(226,75,74,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <i className={`ti ${p.camOn !== false ? "ti-video" : "ti-video-off"}`} style={{ fontSize: "11px", color: p.camOn !== false ? "#1D9E75" : "#E86C6B" }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* ═══ CHAT TAB ═════════════════════════════════════ */}
                        {panelTab === "chat" && (
                            <>
                                {/* Messages area */}
                                <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
                                    {messages.length === 0 && (
                                        <div style={{ textAlign: "center", padding: "40px 20px" }}>
                                            <div style={{ fontSize: "28px", marginBottom: "8px" }}>💬</div>
                                            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px" }}>No messages yet</div>
                                            <div style={{ color: "rgba(255,255,255,0.15)", fontSize: "11px", marginTop: "4px" }}>Be the first to say something!</div>
                                        </div>
                                    )}

                                    {messages.map((m, idx) => {
                                        const prev = messages[idx - 1];
                                        // Group consecutive messages from same sender (not system)
                                        const isGrouped = prev && !prev.isSystem && !m.isSystem &&
                                            prev.sender === m.sender && prev.mine === m.mine &&
                                            (new Date(m.ts) - new Date(prev.ts)) < 60000; // within 1 min
                                        const timeStr = m.ts ? new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

                                        if (m.isSystem) {
                                            return (
                                                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "8px", margin: "8px 0" }}>
                                                    <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                                                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", fontStyle: "italic" }}>{m.text}</span>
                                                    <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={m.id} style={{ display: "flex", flexDirection: m.mine ? "row-reverse" : "row", gap: "8px", alignItems: "flex-end", marginTop: isGrouped ? "2px" : "10px" }}>
                                                {/* Avatar — only show on first of a group */}
                                                <div style={{ width: "28px", flexShrink: 0, display: "flex", alignItems: "flex-end" }}>
                                                    {!m.mine && !isGrouped ? (
                                                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 700, color: "#fff" }}>
                                                            {m.initials}
                                                        </div>
                                                    ) : <div style={{ width: "28px" }} />}
                                                </div>

                                                {/* Bubble */}
                                                <div style={{ maxWidth: "76%", display: "flex", flexDirection: "column", alignItems: m.mine ? "flex-end" : "flex-start" }}>
                                                    {/* Sender name — only on first of group */}
                                                    {!m.mine && !isGrouped && (
                                                        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginBottom: "3px", paddingLeft: "4px" }}>{m.sender}</div>
                                                    )}
                                                    <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", flexDirection: m.mine ? "row-reverse" : "row" }}>
                                                        <div style={{
                                                            padding: "8px 12px",
                                                            borderRadius: m.mine
                                                                ? (isGrouped ? "12px 4px 4px 12px" : "12px 4px 12px 12px")
                                                                : (isGrouped ? "4px 12px 12px 4px" : "4px 12px 12px 12px"),
                                                            background: m.mine ? "linear-gradient(135deg,rgba(127,119,221,0.4),rgba(127,119,221,0.25))" : "rgba(255,255,255,0.08)",
                                                            fontSize: "12px",
                                                            color: "rgba(255,255,255,0.9)",
                                                            lineHeight: 1.5,
                                                            wordBreak: "break-word",
                                                            border: m.mine ? "1px solid rgba(127,119,221,0.3)" : "1px solid rgba(255,255,255,0.07)"
                                                        }}>
                                                            {m.text}
                                                        </div>
                                                        {/* Timestamp on hover simulation — always visible as tiny text */}
                                                        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", flexShrink: 0, paddingBottom: "2px" }}>{timeStr}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Typing indicator */}
                                {typingUsers.length > 0 && (
                                    <div style={{ padding: "4px 14px", fontSize: "10px", color: "rgba(255,255,255,0.35)", fontStyle: "italic", flexShrink: 0 }}>
                                        {typingUsers.map(u => u.name).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing
                                        <span style={{ display: "inline-flex", gap: "2px", marginLeft: "4px", verticalAlign: "middle" }}>
                                            {[0,1,2].map(i => <span key={i} style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(255,255,255,0.4)", display: "inline-block", animation: `pulse2 1.2s ease ${i * 0.2}s infinite` }} />)}
                                        </span>
                                    </div>
                                )}

                                {/* Quick emoji row */}
                                <div style={{ display: "flex", gap: "4px", padding: "6px 10px 0", flexShrink: 0 }}>
                                    {["👍","❤️","😂","🔥","👏","🙌"].map(emoji => (
                                        <button key={emoji} onClick={() => setMsgText(t => t + emoji)}
                                            style={{ fontSize: "15px", padding: "3px 5px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", cursor: "pointer", lineHeight: 1 }}>
                                            {emoji}
                                        </button>
                                    ))}
                                </div>

                                {/* Input row */}
                                <div style={{ padding: "8px 10px 10px", display: "flex", gap: "8px", flexShrink: 0 }}>
                                    <input
                                        value={msgText}
                                        onChange={handleMsgInput}
                                        onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                                        placeholder="Message the group…"
                                        style={{ flex: 1, padding: "9px 13px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "12px", outline: "none" }}
                                    />
                                    <button onClick={sendMessage} disabled={!msgText.trim()}
                                        style={{ width: "36px", height: "36px", borderRadius: "10px", background: msgText.trim() ? "rgba(127,119,221,0.35)" : "rgba(255,255,255,0.04)", border: "none", cursor: msgText.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
                                        <i className="ti ti-send" style={{ fontSize: "15px", color: msgText.trim() ? "#AFA9EC" : "rgba(255,255,255,0.2)" }} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* ── BOTTOM CONTROLS ──────────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "12px 20px", background: "rgba(7,7,16,0.92)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, zIndex: 20 }}>

                <CtrlBtn icon="ti-microphone"  iconOff="ti-microphone-off" active={micOn}      onClick={toggleMic}         label="Toggle microphone" />
                <CtrlBtn icon="ti-video"       iconOff="ti-video-off"      active={camOn}      onClick={toggleCam}         label="Toggle camera" />
                <CtrlBtn icon="ti-screen-share" iconOff="ti-screen-share-off" active={screenOn} onClick={toggleScreenShare} label="Share screen" />
                <CtrlBtn icon="ti-hand-stop"                               active={handRaised} onClick={toggleHandRaise}   label={handRaised ? "Lower hand" : "Raise hand"} />

                {/* Divider */}
                <div style={{ width: "1px", height: "28px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

                <CtrlBtn
                    icon="ti-message" iconOff="ti-message"
                    active={panelTab === "chat"}
                    onClick={() => { setPanelTab(panelTab === "chat" ? null : "chat"); setNewMsgCount(0); }}
                    label="Chat"
                    badge={panelTab !== "chat" ? newMsgCount : 0}
                />
                <CtrlBtn
                    icon="ti-users" iconOff="ti-users"
                    active={panelTab === "people"}
                    onClick={() => setPanelTab(panelTab === "people" ? null : "people")}
                    label="Participants"
                />

                {/* Divider */}
                <div style={{ width: "1px", height: "28px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

                {/* End call */}
                <button onClick={handleEndCall} title="End call"
                    style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#E24B4A", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#c73b3b"}
                    onMouseLeave={e => e.currentTarget.style.background = "#E24B4A"}>
                    <i className="ti ti-phone-off" style={{ fontSize: "22px", color: "#fff" }} />
                </button>
            </div>
        </div>
    );
}
