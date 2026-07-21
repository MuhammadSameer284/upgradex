import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/authContext.jsx";
import { getCalls, scheduleCall } from '../config/videoCallService.jsx';
import io from 'socket.io-client';
import Peer from 'simple-peer';

// ─── VideoTile Component ──────────────────────────────────────────────────
function VideoTile({ stream, participant, large }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div
            className="relative rounded-xl overflow-hidden flex items-center justify-center transition-all"
            style={{
                background: "linear-gradient(135deg,#0d0d1e,#1a1a2e)",
                border: participant?.speaking ? "1.5px solid rgba(29,158,117,0.6)" : "1px solid rgba(255,255,255,0.06)",
                minHeight: large ? "100%" : "140px",
                width: "100%", height: "100%"
            }}
        >
            {stream ? (
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted={participant?.isLocal}
                    style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: participant?.isScreenSharing ? "contain" : "cover",
                        background: "#000"
                    }}
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-xl" style={{ background: participant?.bg || "#7F77DD" }}>
                        {participant?.initials || "U"}
                    </div>
                </div>
            )}
            
            {/* Overlay Elements */}
            <div
                className="absolute bottom-2 left-2.5 text-[10px] font-medium text-white px-2 py-0.5 rounded-full z-10 flex items-center gap-1.5"
                style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            >
                {participant?.name || "Participant"} {participant?.isLocal && "· You"}
                {participant?.handRaised && <span className="text-xs">✋</span>}
            </div>
            
            {/* Top Right Status Icons */}
            <div className="absolute top-2 right-2 flex gap-1 z-10">
                {participant?.camOn === false && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(224,75,74,0.85)" }}>
                        <i className="ti ti-video-off" aria-hidden="true" style={{ fontSize: "11px", color: "#fff" }} />
                    </div>
                )}
                {participant?.micOn === false && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(224,75,74,0.85)" }}>
                        <i className="ti ti-microphone-off" aria-hidden="true" style={{ fontSize: "11px", color: "#fff" }} />
                    </div>
                )}
            </div>
            
            {/* Large Hand Raise Indicator */}
            {participant?.handRaised && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center animate-bounce" style={{ background: "rgba(127,119,221,0.2)", border: "1px solid rgba(127,119,221,0.4)", backdropFilter: "blur(4px)" }}>
                        <span className="text-3xl">✋</span>
                    </div>
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
    const [handRaised,   setHandRaised]         = useState(false);
    const [panelTab,     setPanelTab]           = useState(null);
    const [messages,     setMessages]           = useState([]);
    const [screenStream, setScreenStream]       = useState(null);
    const [msgText,      setMsgText]            = useState("");
    const [msgCounter,   setMsgCounter]         = useState(1);
    const [seconds,      setSeconds]            = useState(0);
    const [calls, setCalls]                     = useState([]);
    const [activeCall, setActiveCall]           = useState(null);
    const [showSchedule, setShowSchedule]       = useState(false);
    
    // Scheduling states
    const [sTitle, setSTitle]                   = useState('');
    const [sProject, setSProject]               = useState('');
    const [sDate, setSDate]                     = useState('');
    const [sNotes, setSNotes]                   = useState('');
    
    // Waiting Room states
    const [waitStatus, setWaitStatus]           = useState('idle'); // 'idle' | 'waiting' | 'denied' | 'host_missing'
    const [admissionRequests, setAdmissionRequests] = useState([]); // Array of { studentId, name, initials, bg }

    // WebRTC & Socket states
    const [peers, setPeers] = useState([]);
    const [localStream, setLocalStream] = useState(null);
    
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const timerRef   = useRef(null);
    const chatEndRef = useRef(null);
    const navigate   = useNavigate();

    // Fetch upcoming calls
    useEffect(() => {
        const fetchCalls = async () => {
            try {
                const res = await getCalls();
                setCalls(res.data);
                const active = res.data.find(c => c.status === 'live' || c.status === 'scheduled');
                if (active) setActiveCall(active);
            } catch (err) {
                console.error('Failed to load calls:', err);
            }
        };
        fetchCalls();
    }, []);

    // Call duration timer
    useEffect(() => {
        if (joined && waitStatus === 'idle') {
            timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [joined, waitStatus]);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const formatTime = (s) => {
        const m   = String(Math.floor(s / 60)).padStart(2, "0");
        const sec = String(s % 60).padStart(2, "0");
        return `${m}:${sec}`;
    };

    const getInitials = (name) => {
        return name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "U";
    };

    const myInitials = getInitials(user?.name);
    const myBg = "linear-gradient(135deg,#534AB7,#7F77DD)";

    // ─── WebRTC and Socket Connection ──────────────────────────────────────────
    const startCall = () => {
        if (!activeCall) return;
        setJoined(true);
        if (user?.role !== 'instructor') {
            setWaitStatus('waiting');
        }
        
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .catch(err => {
            console.error("Failed to get local stream, falling back to empty stream", err);
            // Fallback for local testing (webcam in use by another tab)
            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            const dst = ctx.createMediaStreamDestination();
            oscillator.connect(dst);
            oscillator.start();
            // Create a fake video track using canvas
            const canvas = document.createElement('canvas');
            canvas.width = 640; canvas.height = 480;
            const canvasStream = canvas.captureStream(15); // 15 fps
            dst.stream.addTrack(canvasStream.getVideoTracks()[0]);
            return dst.stream;
        })
        .then(stream => {
            setLocalStream(stream);
            
            // Adjust initial state of tracks
            if (stream.getVideoTracks().length > 0) stream.getVideoTracks()[0].enabled = camOn;
            if (stream.getAudioTracks().length > 0) stream.getAudioTracks()[0].enabled = micOn;

            socketRef.current = io("http://localhost:3000", { withCredentials: true });
            
            // Emit join request
            socketRef.current.emit("request join", {
                roomID: activeCall._id,
                role: user?.role,
                name: user?.name,
                initials: myInitials,
                bg: myBg
            });
            
            // Student waiting room responses
            socketRef.current.on('admission approved', () => {
                setWaitStatus('idle'); // clears waiting screen, shows video grid
            });
            
            socketRef.current.on('admission denied', () => {
                setWaitStatus('denied');
            });
            
            socketRef.current.on('host missing', () => {
                setWaitStatus('host_missing');
            });
            
            // Instructor waiting room events
            socketRef.current.on('admission request', (req) => {
                setAdmissionRequests(prev => [...prev, req]);
            });

            // Normal WebRTC events
            socketRef.current.on("all users", users => {
                const peersArr = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                        camOn: true,
                        micOn: true,
                        name: "Connecting...",
                        initials: "...",
                        bg: "#888",
                        role: "Student"
                    });
                    peersArr.push({
                        peerID: userID,
                        peer,
                        camOn: true,
                        micOn: true,
                        name: "Connecting...",
                        initials: "...",
                        bg: "#888",
                        role: "Student"
                    });
                });
                setPeers(peersArr);
            });

            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                const newPeerObj = {
                    peerID: payload.callerID,
                    peer,
                    camOn: true,
                    micOn: true,
                    isScreenSharing: false,
                    handRaised: false,
                    name: payload.callerName || "Participant",
                    initials: payload.callerInitials || "P",
                    bg: payload.callerBg || "#1D9E75",
                    role: payload.callerRole || "Student"
                };
                peersRef.current.push(newPeerObj);
                setPeers(users => [...users, newPeerObj]);

                // System message
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: `${newPeerObj.name} joined the call`,
                    isSystem: true
                }]);
            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                if (item) item.peer.signal(payload.signal);
            });

            socketRef.current.on("new message", message => {
                setMessages(prev => [...prev, message]);
            });

            socketRef.current.on("user toggled media", payload => {
                setPeers(users => users.map(p => {
                    if (p.peerID === payload.id) {
                        return { ...p, camOn: payload.camOn, micOn: payload.micOn };
                    }
                    return p;
                }));
                const item = peersRef.current.find(p => p.peerID === payload.id);
                if (item) {
                    item.camOn = payload.camOn;
                    item.micOn = payload.micOn;
                }
            });

            socketRef.current.on("user toggled screen share", payload => {
                setPeers(users => users.map(p => {
                    if (p.peerID === payload.id) return { ...p, isScreenSharing: payload.isScreenSharing };
                    return p;
                }));
                const item = peersRef.current.find(p => p.peerID === payload.id);
                if (item) item.isScreenSharing = payload.isScreenSharing;
            });

            socketRef.current.on("user raised hand", payload => {
                setPeers(users => users.map(p => {
                    if (p.peerID === payload.id) return { ...p, handRaised: payload.handRaised };
                    return p;
                }));
                const item = peersRef.current.find(p => p.peerID === payload.id);
                if (item) item.handRaised = payload.handRaised;
            });

            socketRef.current.on("user left", id => {
                const peerObj = peersRef.current.find(p => p.peerID === id);
                if (peerObj) {
                    peerObj.peer.destroy();
                    // System message
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        text: `${peerObj.name} left the call`,
                        isSystem: true
                    }]);
                }
                const peersCopy = peersRef.current.filter(p => p.peerID !== id);
                peersRef.current = peersCopy;
                setPeers(peersCopy);
            });
        });
    };

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", {
                userToSignal,
                callerID,
                signal,
                callerName: user?.name,
                callerInitials: myInitials,
                callerBg: myBg,
                callerRole: user?.role === 'instructor' ? 'Instructor' : 'Student'
            });
        });

        // Store remote stream inside the peer object when it arrives
        peer.on('stream', remoteStream => {
            peer.remoteStream = remoteStream;
            // Force re-render to attach the stream to the VideoTile
            setPeers(users => [...users]); 
        });

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID });
        });

        peer.signal(incomingSignal);

        peer.on('stream', remoteStream => {
            peer.remoteStream = remoteStream;
            setPeers(users => [...users]);
        });

        return peer;
    }

    const sendMessage = () => {
        if (!msgText.trim()) return;
        
        const messageData = {
            id:       msgCounter,
            roomID:   activeCall._id,
            sender:   user?.name || "You",
            initials: myInitials,
            bg:       myBg,
            text:     msgText.trim(),
            mine:     false, // For others, it's not "mine"
        };
        
        socketRef.current.emit("send message", messageData);
        
        // Add locally as "mine"
        setMessages(prev => [...prev, { ...messageData, mine: true }]);
        setMsgCounter(c => c + 1);
        setMsgText("");
    };

    const toggleMic = () => {
        if (localStream) {
            const newMicOn = !micOn;
            localStream.getAudioTracks()[0].enabled = newMicOn;
            setMicOn(newMicOn);
            if (socketRef.current) {
                socketRef.current.emit("toggle media", { roomID: activeCall._id, micOn: newMicOn, camOn });
            }
        }
    };

    const toggleCam = () => {
        if (localStream) {
            const newCamOn = !camOn;
            localStream.getVideoTracks()[0].enabled = newCamOn;
            setCamOn(newCamOn);
            if (socketRef.current) {
                socketRef.current.emit("toggle media", { roomID: activeCall._id, micOn, camOn: newCamOn });
            }
        }
    };

    const toggleScreenShare = async () => {
        if (!screenOn) {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                setScreenStream(stream);
                setScreenOn(true);
                
                const screenTrack = stream.getVideoTracks()[0];
                
                // Replace video track in all peers
                peersRef.current.forEach(peerObj => {
                    const currentVideoTrack = localStream.getVideoTracks()[0];
                    peerObj.peer.replaceTrack(currentVideoTrack, screenTrack, localStream);
                });
                
                // Update local video element
                if (videoRef.current) videoRef.current.srcObject = stream;
                
                if (socketRef.current) socketRef.current.emit("screen share toggle", { roomID: activeCall._id, isScreenSharing: true });

                // Revert when user clicks browser's built-in "Stop sharing" button
                screenTrack.onended = () => {
                    stopScreenShare();
                };
            } catch (err) {
                console.error("Failed to share screen", err);
            }
        } else {
            stopScreenShare();
        }
    };

    const stopScreenShare = () => {
        setScreenOn(false);
        if (screenStream) {
            screenStream.getTracks().forEach(t => t.stop());
            setScreenStream(null);
        }
        
        // Revert to camera track
        const camTrack = localStream.getVideoTracks()[0];
        peersRef.current.forEach(peerObj => {
            const currentVideoTrack = screenStream ? screenStream.getVideoTracks()[0] : null;
            if (currentVideoTrack) peerObj.peer.replaceTrack(currentVideoTrack, camTrack, localStream);
        });
        
        if (socketRef.current) socketRef.current.emit("screen share toggle", { roomID: activeCall._id, isScreenSharing: false });
    };

    const toggleHandRaise = () => {
        const newHandRaised = !handRaised;
        setHandRaised(newHandRaised);
        if (socketRef.current) {
            socketRef.current.emit("raise hand", { roomID: activeCall._id, handRaised: newHandRaised });
        }
    };

    const handleEndCall = () => {
        clearInterval(timerRef.current);
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        peersRef.current.forEach(peerObj => peerObj.peer.destroy());
        setPeers([]);
        peersRef.current = [];
        setJoined(false);
        setWaitStatus('idle');
        setAdmissionRequests([]);
        setSeconds(0);
        setScreenOn(false);
    };
    
    const handleApprove = (req) => {
        socketRef.current.emit('approve join', { studentId: req.studentId, roomID: activeCall._id });
        setAdmissionRequests(prev => prev.filter(r => r.studentId !== req.studentId));
    };
    
    const handleDeny = (req) => {
        socketRef.current.emit('deny join', { studentId: req.studentId });
        setAdmissionRequests(prev => prev.filter(r => r.studentId !== req.studentId));
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
                            style={{ background: myBg }}
                        >
                            {myInitials}
                        </div>
                    </div>

                    <h2 className="text-sm font-semibold text-white mb-1">Ready to join?</h2>
                    <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>
                        {activeCall ? activeCall.title : 'No scheduled calls'} · {activeCall?.instructorName || 'Instructor'}
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

                    {calls.length > 0 && (
                        <div className="mb-4 text-left">
                            <div className="text-[10px] mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>UPCOMING SESSIONS</div>
                            {calls.filter(c => c.status !== 'ended').slice(0, 3).map(c => (
                                <div key={c._id}
                                    onClick={() => setActiveCall(c)}
                                    className="flex items-center gap-2 p-2 rounded-lg mb-1.5 cursor-pointer transition-all"
                                    style={{
                                        background: activeCall?._id === c._id ? 'rgba(127,119,221,0.12)' : 'rgba(255,255,255,0.03)',
                                        border: activeCall?._id === c._id ? '0.5px solid rgba(127,119,221,0.3)' : '0.5px solid rgba(255,255,255,0.06)'
                                    }}
                                >
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.status === 'live' ? '#1D9E75' : '#7F77DD' }} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[11px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{c.title}</div>
                                        <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                                            {c.projectName} · {c.status === 'live' ? '🔴 Live now' : new Date(c.scheduledAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Instructor schedule button */}
                    {user?.role === "instructor" && (
                        <button
                            onClick={() => setShowSchedule(true)}
                            className="w-full py-2.5 rounded-xl text-xs font-medium mb-2 transition-all"
                            style={{ background: "rgba(127,119,221,0.12)", border: "0.5px solid rgba(127,119,221,0.25)", color: "#AFA9EC", cursor: "pointer" }}
                        >
                            <i className="ti ti-calendar-plus mr-1.5" aria-hidden="true" />
                            Schedule a call
                        </button>
                    )}

                    <button
                        onClick={startCall}
                        className="w-full py-3 rounded-xl font-medium text-sm text-white transition-all hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#7F77DD,#1D9E75)", border: "none", cursor: "pointer", opacity: activeCall ? 1 : 0.5 }}
                        disabled={!activeCall}
                    >
                        Join call
                    </button>
                </div>
                {showSchedule && (
                  <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.7)' }}
                    onClick={e => { if (e.target === e.currentTarget) setShowSchedule(false); }}
                  >
                    <div className="w-80 rounded-2xl p-5" style={{ background: '#13131f', border: '0.5px solid rgba(255,255,255,0.1)' }}>
                      <h2 className="text-sm font-medium text-white mb-4">Schedule a Call</h2>
                      {[
                        { label: 'Session title', val: sTitle, set: setSTitle, placeholder: 'e.g. Code Review Session' },
                        { label: 'Project name', val: sProject, set: setSProject, placeholder: 'e.g. E-Commerce Platform' },
                        { label: 'Notes', val: sNotes, set: setSNotes, placeholder: 'Optional agenda notes...' },
                      ].map(f => (
                        <div key={f.label}>
                          <label className="block text-[11px] mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{f.label}</label>
                          <input type="text" value={f.val} onChange={e => f.set(e.target.value)}
                            placeholder={f.placeholder}
                            className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none mb-3"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)' }}
                          />
                        </div>
                      ))}
                      <div key="date">
                        <label className="block text-[11px] mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Date & Time</label>
                        <input type="datetime-local" value={sDate} onChange={e => setSDate(e.target.value)}
                          className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none mb-3"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button onClick={() => setShowSchedule(false)}
                          className="py-2 rounded-lg text-xs"
                          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer' }}
                        >Cancel</button>
                        <button onClick={async () => {
                          try {
                            await scheduleCall({ title: sTitle, projectName: sProject, scheduledAt: sDate, notes: sNotes, duration: 60 });
                            const res = await getCalls();
                            setCalls(res.data);
                            setShowSchedule(false);
                            setSTitle(''); setSProject(''); setSDate(''); setSNotes('');
                          } catch(err) { console.error('Failed to schedule:', err); }
                        }}
                          className="py-2 rounded-lg text-xs font-medium text-white"
                          style={{ background: 'linear-gradient(135deg,#7F77DD,#1D9E75)', border: 'none', cursor: 'pointer' }}
                        >Schedule</button>
                      </div>
                    </div>
                  </div>
                )}
            </div>
        );
    }
    
    // ── Waiting screen ──────────────────────────────────────────
    if (waitStatus !== 'idle') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white" style={{ background: "#070710" }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 relative" style={{ background: "rgba(127,119,221,0.15)" }}>
                    <i className="ti ti-loader animate-spin" style={{ fontSize: "28px", color: "#7F77DD" }}></i>
                </div>
                <h2 className="text-xl font-semibold mb-2">
                    {waitStatus === 'waiting' && "Waiting for instructor..."}
                    {waitStatus === 'host_missing' && "Instructor hasn't started the meeting yet"}
                    {waitStatus === 'denied' && "Your request was denied"}
                </h2>
                <p className="text-sm opacity-60 mb-8 max-w-sm text-center">
                    {waitStatus === 'waiting' && "You will be admitted automatically once the instructor approves your request."}
                    {waitStatus === 'host_missing' && "Please wait. We will notify the instructor once they join."}
                    {waitStatus === 'denied' && "You cannot join this call."}
                </p>
                <button
                    onClick={handleEndCall}
                    className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all"
                    style={{ background: "rgba(255,255,255,0.1)", border: "0.5px solid rgba(255,255,255,0.15)", cursor: "pointer" }}
                >
                    Leave waiting room
                </button>
            </div>
        );
    }

    // ── In-call screen ───────────────────────────────────────────
    
    // Create grid layout depending on number of peers
    const totalParticipants = peers.length + 1; // peers + local
    const getGridCols = () => {
        if (totalParticipants === 1) return "1fr";
        if (totalParticipants === 2) return "1fr 1fr";
        if (totalParticipants <= 4) return "1fr 1fr";
        return "repeat(auto-fit, minmax(200px, 1fr))";
    };

    return (
        <div className="h-screen flex flex-col relative overflow-hidden" style={{ background: "#070710" }}>
            <style>{`@keyframes speakPulse { 0%, 100% { opacity: 0.8; } 50% { opacity: 0.2; } }`}</style>
            
            {/* Instructor Admission Requests Overlay */}
            {user?.role === 'instructor' && admissionRequests.length > 0 && (
                <div className="absolute top-20 right-6 z-50 w-72 space-y-3">
                    {admissionRequests.map(req => (
                        <div key={req.studentId} className="p-4 rounded-xl shadow-2xl" style={{ background: "rgba(20,20,35,0.95)", border: "1px solid rgba(127,119,221,0.3)", backdropFilter: "blur(10px)" }}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs" style={{ background: req.bg || "#7F77DD" }}>
                                    {req.initials}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">{req.name}</div>
                                    <div className="text-[10px] text-gray-400">wants to join</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleDeny(req)} className="flex-1 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: "rgba(224,75,74,0.2)", border: "1px solid rgba(224,75,74,0.4)" }}>
                                    Deny
                                </button>
                                <button onClick={() => handleApprove(req)} className="flex-1 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: "#1D9E75", border: "none" }}>
                                    Approve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Top bar */}
            <div
                className="flex items-center justify-between px-5 py-3 z-10 flex-shrink-0"
                style={{ background: "linear-gradient(to bottom, rgba(7,7,16,0.92), transparent)", position: "absolute", top: 0, left: 0, right: 0 }}
            >
                <div>
                    <div className="text-sm font-medium text-white">{activeCall?.projectName || 'Project'} · {activeCall?.title || 'Call'}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>UpgradeX Video Call</div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>
                        {formatTime(seconds)}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "#5DCAA5" }}>
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#1D9E75" }} />
                        {totalParticipants} in call
                    </div>
                </div>
            </div>

            {/* Video grid */}
            <div
                className="flex-1 p-4 gap-3"
                style={{ 
                    display: "grid", 
                    paddingTop: "64px", 
                    paddingBottom: "88px", 
                    gridTemplateColumns: getGridCols(), 
                    gridAutoRows: "1fr" 
                }}
            >
                {/* Local User */}
                <div>
                    <VideoTile 
                        stream={screenOn ? screenStream : localStream}
                        participant={{
                            initials: myInitials,
                            name: user?.name,
                            isLocal: true,
                            bg: myBg,
                            camOn,
                            micOn,
                            handRaised,
                            isScreenSharing: screenOn
                        }} 
                        large={totalParticipants <= 2}
                    />
                </div>
                
                {/* Remote Peers */}
                {peers.map(peerObj => (
                    <div key={peerObj.peerID}>
                        <VideoTile 
                            stream={peerObj.peer.remoteStream}
                            participant={peerObj}
                            large={totalParticipants <= 2}
                        />
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div
                className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 px-6 pb-6 pt-10 z-10"
                style={{ background: "linear-gradient(to top, rgba(7,7,16,0.95), transparent)" }}
            >
                <CtrlBtn icon="ti-microphone"   iconOff="ti-microphone-off" active={micOn}      onClick={toggleMic}         label="Toggle microphone" />
                <CtrlBtn icon="ti-video"        iconOff="ti-video-off"      active={camOn}      onClick={toggleCam}         label="Toggle camera"     />
                <CtrlBtn icon="ti-screen-share"                             active={screenOn}   onClick={toggleScreenShare} label="Share screen"      />
                <CtrlBtn icon="ti-hand-stop"                                active={handRaised} onClick={toggleHandRaise}   label="Raise hand"        />

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
                            {tab === "people" ? `People (${totalParticipants})` : "Chat"}
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
                                <div key={m.id} className={m.isSystem ? "flex justify-center my-2" : `flex gap-2 ${m.mine ? "flex-row-reverse" : ""}`}>
                                    {m.isSystem ? (
                                        <div className="text-[10px] italic px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                                            {m.text}
                                        </div>
                                    ) : (
                                        <>
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
                                        </>
                                    )}
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
                        {/* Self */}
                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl mb-2" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.05)" }}>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0" style={{ background: myBg }}>{myInitials}</div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium truncate" style={{ color: "rgba(255,255,255,0.7)" }}>{user?.name} (You)</div>
                                <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{user?.role === 'instructor' ? 'Instructor' : 'Student'}</div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {handRaised && <span className="text-sm mr-1">✋</span>}
                                {!micOn && <i className="ti ti-microphone-off" aria-hidden="true" style={{ fontSize: "13px", color: "#E86C6B" }} />}
                            </div>
                        </div>
                        {/* Remote Peers */}
                        {peers.map(p => (
                            <div key={p.peerID} className="flex items-center gap-2.5 p-2.5 rounded-xl mb-2" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.05)" }}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0" style={{ background: p.bg }}>{p.initials}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium truncate" style={{ color: "rgba(255,255,255,0.7)" }}>{p.name}</div>
                                    <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{p.role}</div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {p.handRaised && <span className="text-sm mr-1">✋</span>}
                                    {!p.micOn && <i className="ti ti-microphone-off" aria-hidden="true" style={{ fontSize: "13px", color: "#E86C6B" }} />}
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
