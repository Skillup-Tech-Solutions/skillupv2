import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Box, Typography, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { ArrowLeft, Users, Clock, VideoCamera, Warning, SignOut, HandWaving } from "@phosphor-icons/react";
import type { LiveSession } from "../../Hooks/liveSessions";
import { useLeaveSessionApi } from "../../Hooks/liveSessions";
import Cookies from "js-cookie";

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

interface VideoRoomProps {
    session: LiveSession;
    userName: string;
    userEmail: string;
    isHost?: boolean;
    onExit: () => void;
    onEndSession?: () => void; // Added for hosts to end meeting for everyone
}

const VideoRoom = ({ session, userName, userEmail, isHost = false, onExit, onEndSession }: VideoRoomProps) => {
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const jitsiApiRef = useRef<any>(null);
    const jitsiInitialized = useRef(false);
    const unmounting = useRef(false);
    const [mounted, setMounted] = useState(false);
    // Initialize with 1 if it's the host, or use the active count from session
    const [participantCount, setParticipantCount] = useState(
        isHost ? Math.max(1, session.activeParticipantsCount || 0) : (session.activeParticipantsCount || 1)
    );
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const { mutate: leaveSessionApi } = useLeaveSessionApi();

    // Securely get base URL from config for beacon
    const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

    useEffect(() => {
        setMounted(true);

        const handleBeforeUnload = () => {
            // Fetch with keepalive is more reliable and supports headers
            if (session._id) {
                const token = Cookies.get("skToken");
                const url = `${BASE_URL}live-sessions/${session._id}/leave`;

                fetch(url, {
                    method: 'POST',
                    keepalive: true,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    },
                    body: JSON.stringify({})
                });
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            unmounting.current = true;
            window.removeEventListener("beforeunload", handleBeforeUnload);

            // Cleanup Jitsi on unmount
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
                jitsiApiRef.current = null;
            }
            jitsiInitialized.current = false;
            // Removed direct leaveSessionApi call from here to prevent 'too strict' ghost leaves during remounts/screen sharing
        };
    }, [session._id, BASE_URL]);

    useEffect(() => {
        if (mounted && session.roomId) {
            initJitsi();
        }
    }, [mounted, session.roomId]);

    const loadJitsiScript = () => {
        return new Promise<void>((resolve, reject) => {
            if (window.JitsiMeetExternalAPI) {
                resolve();
                return;
            }
            const script = document.createElement("script");
            // Use jitsi.riot.im (Element's Jitsi) - no lobby restrictions
            script.src = "https://jitsi.riot.im/external_api.js";
            script.async = true;
            script.onload = () => resolve();
            script.onerror = reject;
            document.body.appendChild(script);
        });
    };

    const initJitsi = async () => {
        // Prevent duplicate initialization
        if (jitsiInitialized.current || jitsiApiRef.current) {
            console.log("Jitsi already initialized, skipping...");
            return;
        }
        if (!jitsiContainerRef.current) return;

        // Security check: Ensure user is logged in
        if (!userName || !userEmail) {
            console.error("User must be logged in to join session");
            onExit();
            return;
        }

        jitsiInitialized.current = true;

        try {
            // Explicitly request permissions before Jitsi starts - this "primes" the browser prompt
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                // Stop the tracks immediately, we just wanted to trigger the system prompt
                stream.getTracks().forEach(track => track.stop());
            } catch (permErr) {
                console.warn("Pre-initialization permission request failed or denied:", permErr);
                // We'll still try to load Jitsi as it has its own internal error handling
            }

            await loadJitsiScript();

            // Use jitsi.riot.im (Element's Jitsi) - no lobby enforcement
            const domain = "jitsi.riot.im";
            // Simple room name without special characters
            const roomName = `skillup${session.roomId.replace(/-/g, '')} `;

            // Generate a unique user ID based on email + random suffix to allow multi-device joins
            const userId = `${btoa(userEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)}_${Math.random().toString(36).substring(2, 6)} `;

            const options = {
                roomName,
                width: "100%",
                height: "100%",
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: isHost ? `${userName} (Host)` : userName,
                    email: userEmail,
                    id: userId, // Unique user ID to prevent duplicates
                },
                // Set proper meeting subject to show session title
                subject: session.title,
                configOverwrite: {
                    prejoinPageEnabled: false,
                    prejoinConfig: { enabled: false },
                    startWithAudioMuted: !isHost,
                    startWithVideoMuted: !isHost,
                    disableModeratorIndicator: !isHost,
                    enableWelcomePage: false,
                    enableClosePage: false,
                    // Mobile specific
                    disableDeepLinking: true,
                    mobileWebAppRequired: false,
                    // Screen Sharing
                    disableDesktopSharing: false,
                    desktopSharingFrameRate: {
                        min: 5,
                        max: 5,
                    },
                    // Bandwidth & Quality Optimization
                    constraints: {
                        video: {
                            height: {
                                ideal: 480,
                                max: 720,
                                min: 240
                            }
                        }
                    },
                    disableAudioLevels: false,
                    // Disable lobby completely - first person joins as moderator
                    lobbyModeEnabled: false,
                    // Skip knock screen for everyone
                    enableLobby: false,
                    hideConferenceSubject: false,
                    hideConferenceTimer: false,
                    disableLocalVideoFlip: true,
                    // Security: Disable external invite options
                    disableInviteFunctions: true,
                    hideRecordingLabel: true,
                    // Disable features that could be used to share room externally
                    disableRemoteMute: !isHost,
                    remoteVideoMenu: {
                        disableKick: !isHost,
                        disableGrantModerator: true,
                        disablePrivateChat: false,
                    },
                    whiteboard: {
                        enabled: false, // Disabled as requested previously
                    },
                    toolbarButtons: [
                        "microphone",
                        "camera",
                        "desktop",
                        "fullscreen",
                        "fodeviceselection",
                        "hangup",
                        "chat",
                        "raisehand",
                        "videoquality",
                        "tileview",
                        "participants-pane",
                    ],
                },
                interfaceConfigOverwrite: {
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    SHOW_BRAND_WATERMARK: false,
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                    HIDE_INVITE_MORE_HEADER: true,
                    // Security: Hide invite button
                    TOOLBAR_ALWAYS_VISIBLE: false,
                    TOOLBAR_BUTTONS: [
                        "microphone",
                        "camera",
                        "desktop",
                        "fullscreen",
                        "hangup",
                        "chat",
                        "raisehand",
                        "tileview",
                        "whiteboard",
                    ],
                    // Prevent copying meeting link
                    SHOW_CHROME_EXTENSION_BANNER: false,
                    GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
                    DISPLAY_WELCOME_FOOTER: false,
                    DISPLAY_WELCOME_PAGE_ADDITIONAL_CARD: false,
                    DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
                },
            };

            jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

            jitsiApiRef.current.addListener("participantJoined", () => {
                setParticipantCount((prev) => prev + 1);
            });

            jitsiApiRef.current.addListener("participantLeft", () => {
                setParticipantCount((prev) => Math.max(1, prev - 1));
            });

            jitsiApiRef.current.addListener("videoConferenceLeft", () => {
                handleExit();
            });

            jitsiApiRef.current.addListener("readyToClose", () => {
                handleExit();
            });
        } catch (err) {
            console.error("Failed to load Jitsi:", err);
        }
    };

    const handleExit = (endForEveryone = false) => {
        if (jitsiApiRef.current) {
            jitsiApiRef.current.dispose();
            jitsiApiRef.current = null;
        }
        jitsiInitialized.current = false;

        if (endForEveryone && onEndSession) {
            onEndSession();
        } else {
            // Explicitly notify backend that WE are leaving
            if (session._id) {
                leaveSessionApi(session._id);
            }
            onExit();
        }
        setShowExitConfirm(false);
    };

    const handleExitClick = () => {
        if (isHost) {
            setShowExitConfirm(true);
        } else {
            handleExit();
        }
    };

    // Room content to be portaled to body for fullscreen experience
    const roomContent = (
        <Box
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000,
                width: "100%",
                height: "100dvh", // Use dynamic viewport height for mobile
                display: "flex",
                flexDirection: "column",
                bgcolor: "#0f172a",
                overflow: "hidden",
                touchAction: "none",
            }}
        >
            {/* Header Bar */}
            <Box
                sx={{
                    height: { xs: 48, sm: 56 }, // Shorter header on mobile
                    bgcolor: "#1e293b",
                    borderBottom: "1px solid rgba(71, 85, 105, 0.4)",
                    px: { xs: 1.5, sm: 2 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
                    <Button
                        onClick={handleExitClick}
                        startIcon={<ArrowLeft size={18} />}
                        sx={{
                            color: "#94a3b8",
                            minWidth: "auto",
                            fontSize: { xs: "12px", sm: "14px" },
                            px: { xs: 1, sm: 1.5 },
                            "&:hover": { color: "#f8fafc", bgcolor: "rgba(255,255,255,0.1)" },
                        }}
                    >
                        {/* Hide text on very small screens */}
                        <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                            Exit
                        </Box>
                    </Button>
                    <Box sx={{ height: 20, width: 1, bgcolor: "rgba(71, 85, 105, 0.4)", display: { xs: "none", sm: "block" } }} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5 } }}>
                        <VideoCamera size={18} style={{ color: "#22c55e" }} weight="fill" />
                        <Typography
                            sx={{
                                color: "#f8fafc",
                                fontWeight: 600,
                                fontSize: { xs: "13px", sm: "14px" },
                                maxWidth: { xs: 120, sm: 200, md: 300 },
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {session.title}
                        </Typography>
                        <Chip
                            label="LIVE"
                            size="small"
                            sx={{
                                bgcolor: "#22c55e",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: "9px",
                                height: 18,
                                px: 0.5,
                                animation: "pulse 2s infinite",
                                "@keyframes pulse": {
                                    "0%": { opacity: 1 },
                                    "50%": { opacity: 0.7 },
                                    "100%": { opacity: 1 },
                                },
                            }}
                        />
                    </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 3 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "#94a3b8" }}>
                        <Users size={16} />
                        <Typography sx={{ fontSize: { xs: "11px", sm: "13px" } }}>
                            {participantCount}
                        </Typography>
                    </Box>
                    <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1, color: "#94a3b8" }}>
                        <Clock size={16} />
                        <Typography sx={{ fontSize: "13px" }}>{session.durationMinutes} min</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Main Content Area */}
            <Box sx={{ flex: 1, display: "flex", position: "relative", width: "100%", bgcolor: "#000" }}>
                <Box ref={jitsiContainerRef} sx={{ position: "absolute", inset: 0 }} />
            </Box>

            {/* Host Exit Confirmation Dialog */}
            <Dialog
                open={showExitConfirm}
                onClose={() => setShowExitConfirm(false)}
                PaperProps={{
                    sx: {
                        bgcolor: "#1e293b",
                        backgroundImage: "none",
                        border: "1px solid rgba(71, 85, 105, 0.4)",
                        borderRadius: "12px",
                        maxWidth: "400px"
                    }
                }}
            >
                <DialogTitle sx={{ color: "#f8fafc", px: 3, pt: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Warning size={24} weight="duotone" color="#eab308" />
                    Leave Session
                </DialogTitle>
                <DialogContent sx={{ px: 3, py: 2 }}>
                    <Typography sx={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.6 }}>
                        You are about to leave the live session. What would you like to do?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 4, pt: 1, gap: 1.5, flexDirection: "column", alignItems: "stretch" }}>
                    <Button
                        onClick={() => handleExit(true)}
                        variant="contained"
                        startIcon={<SignOut size={18} />}
                        sx={{
                            bgcolor: "#ef4444",
                            color: "#fff",
                            fontWeight: 700,
                            textTransform: "none",
                            "&:hover": { bgcolor: "#dc2626" }
                        }}
                    >
                        End Session for Everyone
                    </Button>
                    <Button
                        onClick={() => handleExit(false)}
                        variant="outlined"
                        startIcon={<HandWaving size={18} />}
                        sx={{
                            color: "#94a3b8",
                            borderColor: "rgba(71, 85, 105, 0.4)",
                            fontWeight: 600,
                            textTransform: "none",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.05)", borderColor: "rgba(71, 85, 105, 0.6)" }
                        }}
                    >
                        Just Leave (Keep session active)
                    </Button>
                    <Button
                        onClick={() => setShowExitConfirm(false)}
                        sx={{ color: "#64748b", fontWeight: 500, fontSize: "13px", textTransform: "none" }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );

    // Use portal to render outside the normal DOM hierarchy for fullscreen
    if (mounted && typeof document !== "undefined") {
        return createPortal(roomContent, document.body);
    }

    return null;
};

export default VideoRoom;
