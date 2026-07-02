import React, { useState } from "react";

function Footer() {
    return (
        <footer className="h-16 border-t-3 border-[#1E2240] px-8"
            style={{
                background: "#0d0d1a",
                borderRight: "0.5px solid rgba(255,255,255,0.07)",
            }}
        >
            <div className="h-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                        style={{
                            background:
                                "linear-gradient(135deg,#7F77DD,#1D9E75)",
                        }}
                    >
                        UX
                    </div>

                    <span className="text-white font-semibold text-base tracking-tight">
                        Upgrade<span style={{ color: "#7F77DD" }}>X</span>
                    </span>
                </div>

                <p className="text-gray-500 text-sm">
                    © 2026 All Rights Reserved.
                </p>
            </div>
        </footer>
    );
}

export default Footer