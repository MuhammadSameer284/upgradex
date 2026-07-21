import { useState, useEffect, useRef } from "react";
import { useAuth } from "../Context/authContext.jsx";
import Editor from "@monaco-editor/react";
import { getReviews, addComment, resolveComment, updateReviewStatus, createReview } from "../config/codeReviewService.jsx";

const SAMPLE_CODE = `const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');

// Register a new user
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const salt   = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashed });
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user._id, name, email } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { register };
`;

const INITIAL_COMMENTS = [
    { id: 1, line: 10, text: "Check if email format is valid before querying DB.", author: "Sir Khalid", initials: "SK", bg: "linear-gradient(135deg,#0F6E56,#1D9E75)", resolved: false, time: "10m ago" },
    { id: 2, line: 13, text: "Use at least 12 rounds for production. 10 is fine for dev.", author: "Sir Khalid", initials: "SK", bg: "linear-gradient(135deg,#0F6E56,#1D9E75)", resolved: false, time: "8m ago" },
    { id: 3, line: 24, text: "Good — sending token and user info together is clean.", author: "Sir Khalid", initials: "SK", bg: "linear-gradient(135deg,#0F6E56,#1D9E75)", resolved: true, time: "5m ago" },
];

// ─── Comment Card ────────────────────────────────────────────────
function CommentCard({ comment, onResolve, onClick, userRole }) {
    return (
        <div
            onClick={onClick}
            className="rounded-xl p-3 mb-2 cursor-pointer transition-all"
            style={{
                background: "rgba(255,255,255,0.02)",
                border: "0.5px solid rgba(255,255,255,0.06)",
                opacity: comment.resolved ? 0.45 : 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(127,119,221,0.25)"; e.currentTarget.style.background = "rgba(127,119,221,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";  e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
        >
            <div className="flex items-center gap-1 mb-1.5" style={{ fontSize: "10px", color: "rgba(127,119,221,0.7)" }}>
                <i className="ti ti-code" aria-hidden="true" style={{ fontSize: "11px" }} />
                Line {comment.line}
                {comment.resolved && <span className="ml-auto" style={{ color: "#5DCAA5", fontSize: "10px" }}>✓ Resolved</span>}
            </div>

            <div
                className="text-xs leading-relaxed mb-2"
                style={{
                    color: "rgba(255,255,255,0.55)",
                    textDecoration: comment.resolved ? "line-through" : "none",
                }}
            >
                {comment.text}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <div
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-semibold text-white"
                        style={{ background: comment.bg }}
                    >
                        {comment.initials}
                    </div>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>{comment.author}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>{comment.time}</span>
                    {/* ✅ Only instructors can resolve comments */}
                    {!comment.resolved && userRole === "instructor" && (
                        <button
                            onClick={e => { e.stopPropagation(); onResolve(comment.id); }}
                            className="text-[10px] px-2 py-0.5 rounded-full transition-all"
                            style={{ background: "rgba(29,158,117,0.1)", color: "#5DCAA5", border: "none", cursor: "pointer" }}
                        >
                            Resolve
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Code Review Page ───────────────────────────────────────
export default function CodeReview() {
    const { user }                          = useAuth();
    const [review,       setReview]         = useState(null);
    const [comments,     setComments]       = useState([]);
    const [code,         setCode]           = useState("");
    const [status,       setStatus]         = useState("pending");
    const [allReviews,   setAllReviews]     = useState([]);
    const [selectedReviewIdx, setSelectedReviewIdx] = useState(0);
    const [selectedLine, setSelectedLine]   = useState(null);
    const [commentText,  setCommentText]    = useState("");
    const [language,     setLanguage]       = useState("javascript");
    const [loading,      setLoading]        = useState(true);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submitForm, setSubmitForm] = useState({ project: "E-Commerce Platform", file: "newFeature.js", code: "" });
    const editorRef = useRef(null);
    const inputRef  = useRef(null);

    useEffect(() => {
        const fetchReviewData = async () => {
            try {
                const res = await getReviews();
                if (res.data && res.data.length > 0) {
                    setAllReviews(res.data);
                    const activeReview = res.data[0];
                    setReview(activeReview);
                    setComments(activeReview.comments || []);
                    setCode(activeReview.code || "");
                    setStatus(activeReview.status || "pending");
                }
            } catch (err) {
                console.error("Failed to load code review:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviewData();
    }, []);

    const handleEditorMount = (editor) => {
        editorRef.current = editor;
        editor.onMouseDown(e => {
            const line = e.target.position?.lineNumber;
            if (line) {
                setSelectedLine(line);
                setTimeout(() => inputRef.current?.focus(), 100);
            }
        });
        updateDecorations(editor);
    };

    const updateDecorations = (editor) => {
        if (!editor) return;
        const decorations = comments
            .filter(c => !c.resolved)
            .map(c => ({
                range: { startLineNumber: c.line, endLineNumber: c.line, startColumn: 1, endColumn: 1 },
                options: {
                    isWholeLine: true,
                    className: "commented-line",
                    glyphMarginClassName: "comment-glyph",
                    overviewRuler: { color: "#7F77DD", position: 1 },
                },
            }));
        editor.deltaDecorations([], decorations);
    };

    useEffect(() => {
        if (editorRef.current) updateDecorations(editorRef.current);
    }, [comments]);

    const handleAddComment = async () => {
        if (!commentText.trim() || !selectedLine || !review) return;
        try {
            const res = await addComment(review._id, selectedLine, commentText.trim());
            setReview(res.data);
            setComments(res.data.comments || []);
            setCommentText("");
            setSelectedLine(null);
        } catch (err) {
            console.error("Failed to add comment:", err);
        }
    };

    const handleSubmitReview = async () => {
        if (!submitForm.code.trim()) return;
        try {
            const res = await createReview(submitForm);
            setAllReviews([res.data, ...allReviews]);
            setReview(res.data);
            setComments(res.data.comments || []);
            setCode(res.data.code || "");
            setStatus(res.data.status || "pending");
            setSelectedReviewIdx(0); // newly added is at the top
            setShowSubmitModal(false);
            setSubmitForm({ project: "E-Commerce Platform", file: "newFeature.js", code: "" });
        } catch (err) {
            console.error("Failed to submit review:", err);
        }
    };

    const handleResolve = async (commentId) => {
        if (!review) return;
        try {
            const res = await resolveComment(review._id, commentId);
            setReview(res.data);
            setComments(res.data.comments || []);
        } catch (err) {
            console.error("Failed to resolve comment:", err);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!review) return;
        try {
            const res = await updateReviewStatus(review._id, newStatus);
            setReview(res.data);
            setStatus(res.data.status);
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const scrollToLine = (line) => {
        editorRef.current?.revealLineInCenter(line);
        setSelectedLine(line);
        inputRef.current?.focus();
    };

    const openComments = comments.filter(c => !c.resolved);
    const languages    = ["javascript", "typescript", "python", "html", "css"];

    const statusConfig = {
        pending:  { label: "Pending Review", bg: "rgba(186,117,23,0.12)",  color: "#FAC775" },
        approved: { label: "Approved",        bg: "rgba(29,158,117,0.12)",  color: "#5DCAA5" },
        changes:  { label: "Changes Needed",  bg: "rgba(224,75,74,0.12)",   color: "#E86C6B" },
    };

    return (
        <div className="h-screen flex flex-col" style={{ background: "#0a0a14" }}>

            {/* ── Header ── */}
            <div
                className="flex items-center justify-between px-5 py-3 flex-shrink-0"
                style={{ borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(135deg,#534AB7,#7F77DD)" }}
                    >
                        <i className="ti ti-code" aria-hidden="true" style={{ fontSize: "16px", color: "#fff" }} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-white">Code Review — {review?.project || "Project"}</div>
                        <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                            {review?.file || "file.js"} · Submitted by {review?.studentName || "Student"}
                        </div>
                    </div>
                    <span
                        className="text-[10px] px-2.5 py-1 rounded-full ml-2"
                        style={{ background: statusConfig[status].bg, color: statusConfig[status].color }}
                    >
                        {statusConfig[status].label}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Live indicator */}
                    <div className="flex items-center gap-1.5 text-xs mr-1" style={{ color: "#5DCAA5" }}>
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#1D9E75" }} />
                        Live
                    </div>

                    {/* Online members */}
                    <div className="flex items-center mr-1">
                        {[
                            { i: "MS", bg: "linear-gradient(135deg,#534AB7,#7F77DD)" },
                            { i: "SK", bg: "linear-gradient(135deg,#0F6E56,#1D9E75)" },
                        ].map((m, idx) => (
                            <div
                                key={idx}
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold text-white"
                                style={{ background: m.bg, border: "1.5px solid #0a0a14", marginLeft: idx === 0 ? 0 : "-6px" }}
                            >
                                {m.i}
                            </div>
                        ))}
                    </div>

                    {/* Language selector */}
                    <select
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                        className="px-2 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
                        style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
                    >
                        {languages.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>

                    {/* ✅ Instructor only — Approve and Request changes */}
                    {user?.role === "instructor" && (
                        <>
                            <button
                                onClick={() => handleStatusUpdate("approved")}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                style={{ background: "rgba(29,158,117,0.12)", color: "#5DCAA5", border: "none", cursor: "pointer" }}
                            >
                                <i className="ti ti-check" aria-hidden="true" style={{ fontSize: "13px" }} />
                                Approve
                            </button>
                            <button
                                onClick={() => handleStatusUpdate("changes")}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                style={{ background: "rgba(224,75,74,0.12)", color: "#E86C6B", border: "none", cursor: "pointer" }}
                            >
                                <i className="ti ti-x" aria-hidden="true" style={{ fontSize: "13px" }} />
                                Request changes
                            </button>
                        </>
                    )}

                    {/* ✅ Student only — Submit for review */}
                    {user?.role === "student" && (
                        <button
                            onClick={() => setShowSubmitModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                            style={{ background: "linear-gradient(135deg,#7F77DD,#1D9E75)", border: "none", cursor: "pointer" }}
                        >
                            <i className="ti ti-upload" aria-hidden="true" style={{ fontSize: "13px" }} />
                            Submit for review
                        </button>
                    )}
                </div>
            </div>

            {/* ── Body ── */}
            <div className="flex flex-1 overflow-hidden">
                {allReviews.length > 0 && (
                  <div className="w-48 flex-shrink-0 flex flex-col" style={{ borderRight: '0.5px solid rgba(255,255,255,0.07)', overflowY: 'auto' }}>
                    <div className="p-3 text-[10px] font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {user?.role === 'instructor' ? 'Student Submissions' : 'My Submissions'}
                    </div>
                    {allReviews.map((r, i) => (
                      <button key={r._id || i} onClick={() => {
                        setReview(r);
                        setComments(r.comments || []);
                        setCode(r.code || '');
                        setStatus(r.status || 'pending');
                        setSelectedReviewIdx(i);
                      }}
                        className="flex items-center gap-2 px-3 py-2.5 text-left transition-all"
                        style={{
                          background: selectedReviewIdx === i ? 'rgba(127,119,221,0.1)' : 'transparent',
                          borderLeft: selectedReviewIdx === i ? '2px solid #7F77DD' : '2px solid transparent',
                          border: 'none', cursor: 'pointer'
                        }}
                      >
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#534AB7,#7F77DD)' }}
                        >
                          {r.initials || r.studentName?.slice(0,2).toUpperCase() || 'ST'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{r.studentName || 'Student'}</div>
                          <div className="text-[9px] truncate" style={{ color: 'rgba(255,255,255,0.25)' }}>{r.file}</div>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: r.status === 'approved' ? '#1D9E75' : r.status === 'changes' ? '#E86C6B' : '#FAC775' }} />
                      </button>
                    ))}
                  </div>
                )}

                {/* ── Editor pane ── */}
                <div className="flex flex-col flex-1 overflow-hidden" style={{ borderRight: "0.5px solid rgba(255,255,255,0.07)" }}>
                    <div
                        className="flex items-center px-3 gap-1 flex-shrink-0"
                        style={{ background: "#0d0d1a", borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}
                    >
                        <div
                            className="flex items-center gap-1.5 px-3 py-2 text-xs cursor-pointer transition-all"
                            style={{
                                color: "#AFA9EC",
                                borderBottom: "1.5px solid #7F77DD",
                            }}
                        >
                            <i className="ti ti-file-code" aria-hidden="true" style={{ fontSize: "13px" }} />
                            {review?.file || "file.js"}
                        </div>
                    </div>

                    {selectedLine && (
                        <div
                            className="flex items-center justify-between px-4 py-2 flex-shrink-0 text-xs"
                            style={{ background: "rgba(127,119,221,0.08)", borderBottom: "0.5px solid rgba(127,119,221,0.2)" }}
                        >
                            <span style={{ color: "#AFA9EC" }}>
                                <i className="ti ti-message" aria-hidden="true" style={{ marginRight: "6px" }} />
                                Commenting on line {selectedLine}
                            </span>
                            <button
                                onClick={() => setSelectedLine(null)}
                                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "12px" }}
                            >
                                ✕ Cancel
                            </button>
                        </div>
                    )}

                    <div className="flex-1 overflow-hidden">
                        <Editor
                            height="100%"
                            language={language}
                            value={code}
                            theme="vs-dark"
                            onMount={handleEditorMount}
                            options={{
                                fontSize: 13,
                                fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                                fontLigatures: true,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                lineNumbers: "on",
                                glyphMargin: true,
                                folding: true,
                                renderLineHighlight: "all",
                                lineNumbersMinChars: 3,
                                padding: { top: 12 },
                                scrollbar: { verticalScrollbarSize: 4 },
                            }}
                        />
                    </div>
                </div>

                {/* ── Comment Sidebar ── */}
                <div className="flex flex-col flex-shrink-0" style={{ width: "260px", background: "#0d0d1a" }}>
                    <div
                        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                        style={{ borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}
                    >
                        <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>Comments</span>
                        <span
                            className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(127,119,221,0.15)", color: "#AFA9EC" }}
                        >
                            {openComments.length} open
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3">
                        {comments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
                                <i className="ti ti-message-off" aria-hidden="true" style={{ fontSize: "24px", color: "rgba(255,255,255,0.1)" }} />
                                <div className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>No comments yet</div>
                            </div>
                        ) : (
                            comments.map(c => (
                                <CommentCard
                                    key={c.id}
                                    comment={c}
                                    onResolve={handleResolve}
                                    onClick={() => scrollToLine(c.line)}
                                    userRole={user?.role}
                                />
                            ))
                        )}
                    </div>

                    <div className="flex-shrink-0 p-3" style={{ borderTop: "0.5px solid rgba(255,255,255,0.07)" }}>
                        <div className="text-[10px] mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                            {selectedLine
                                ? <span style={{ color: "#AFA9EC" }}>Commenting on line {selectedLine}</span>
                                : "Click a line in the editor to comment"
                            }
                        </div>
                        <textarea
                            ref={inputRef}
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                            placeholder="Add a comment... (Enter to send)"
                            rows={3}
                            className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none resize-none mb-2"
                            style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)", fontFamily: "inherit" }}
                        />
                        <button
                            onClick={handleAddComment}
                            disabled={!commentText.trim() || !selectedLine}
                            className="w-full py-2 rounded-lg text-xs font-medium text-white transition-all"
                            style={{
                                background: commentText.trim() && selectedLine
                                    ? "linear-gradient(135deg,#7F77DD,#1D9E75)"
                                    : "rgba(255,255,255,0.06)",
                                border: "none",
                                cursor: commentText.trim() && selectedLine ? "pointer" : "not-allowed",
                                color: commentText.trim() && selectedLine ? "#fff" : "rgba(255,255,255,0.25)",
                            }}
                        >
                            Send comment
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Submit Modal (Student Only) ── */}
            {showSubmitModal && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
                    onClick={e => { if (e.target === e.currentTarget) setShowSubmitModal(false); }}
                >
                    <div
                        className="w-[500px] rounded-2xl p-5"
                        style={{ background: "#12121f", border: "0.5px solid rgba(255,255,255,0.1)" }}
                    >
                        <h2 className="text-sm font-medium text-white mb-4">Submit Code for Review</h2>
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Project Name</label>
                                <input
                                    type="text"
                                    value={submitForm.project}
                                    onChange={e => setSubmitForm({...submitForm, project: e.target.value})}
                                    className="w-full rounded-lg px-3 py-2 text-xs outline-none text-white"
                                    style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>File Name</label>
                                <input
                                    type="text"
                                    value={submitForm.file}
                                    onChange={e => setSubmitForm({...submitForm, file: e.target.value})}
                                    className="w-full rounded-lg px-3 py-2 text-xs outline-none text-white"
                                    style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Code Snippet</label>
                                <textarea
                                    value={submitForm.code}
                                    onChange={e => setSubmitForm({...submitForm, code: e.target.value})}
                                    rows={8}
                                    className="w-full rounded-lg px-3 py-2 text-xs outline-none text-white resize-none"
                                    style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", fontFamily: "'Fira Code', monospace" }}
                                    placeholder="Paste your code here..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-5">
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                className="px-4 py-2 rounded-lg text-xs"
                                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "none", cursor: "pointer" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                disabled={!submitForm.code.trim()}
                                className="px-4 py-2 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                                style={{
                                    background: submitForm.code.trim() ? "linear-gradient(135deg,#7F77DD,#1D9E75)" : "rgba(255,255,255,0.06)",
                                    border: "none",
                                    cursor: submitForm.code.trim() ? "pointer" : "not-allowed",
                                    color: submitForm.code.trim() ? "#fff" : "rgba(255,255,255,0.25)",
                                }}
                            >
                                Submit Code
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
