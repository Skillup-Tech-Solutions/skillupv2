import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Box, Typography, Chip, Button } from "@mui/material";
import { ArrowLeft, Users, Clock, VideoCamera } from "@phosphor-icons/react";
import type { LiveSession } from "../../Hooks/liveSessions";

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
}

const VideoRoom = ({ session, userName, userEmail, isHost = false, onExit }: VideoRoomProps) => {
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const jitsiApiRef = useRef<any>(null);
    const jitsiInitialized = useRef(false);
    const [mounted, setMounted] = useState(false);
    const [participantCount, setParticipantCount] = useState(1);

    useEffect(() => {
        setMounted(true);

        return () => {
            // Cleanup Jitsi on unmount
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
                jitsiApiRef.current = null;
            }
            jitsiInitialized.current = false;
        };
    }, []);

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
            await loadJitsiScript();

            // Use jitsi.riot.im (Element's Jitsi) - no lobby enforcement
            const domain = "jitsi.riot.im";
            // Simple room name without special characters
            const roomName = `skillup${session.roomId.replace(/-/g, '')}`;

            // Generate a unique user ID based on email (consistent across sessions)
            const userId = btoa(userEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);

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
                    // Disable lobby completely - first person joins as moderator
                    lobbyModeEnabled: false,
                    // Skip knock screen for everyone
                    enableLobby: false,
                    disableDeepLinking: true,
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
                        enabled: true,
                        collabServerBaseUrl: "https://excalidraw-backend.jitsi.net",
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
                        "whiteboard",
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

    const handleExit = () => {
        if (jitsiApiRef.current) {
            jitsiApiRef.current.dispose();
            jitsiApiRef.current = null;
        }
        jitsiInitialized.current = false;
        onExit();
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
                zIndex: 99999,
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                bgcolor: "#0f172a",
                overflow: "hidden",
            }}
        >
            {/* Header Bar */}
            <Box
                sx={{
                    height: 56,
                    bgcolor: "#1e293b",
                    borderBottom: "1px solid rgba(71, 85, 105, 0.4)",
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Button
                        onClick={handleExit}
                        startIcon={<ArrowLeft size={20} />}
                        sx={{
                            color: "#94a3b8",
                            "&:hover": { color: "#f8fafc", bgcolor: "rgba(255,255,255,0.1)" },
                        }}
                    >
                        Exit
                    </Button>
                    <Box sx={{ height: 24, width: 1, bgcolor: "rgba(71, 85, 105, 0.4)" }} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <VideoCamera size={20} style={{ color: "#22c55e" }} weight="fill" />
                        <Typography
                            sx={{
                                color: "#f8fafc",
                                fontWeight: 600,
                                fontSize: "14px",
                                maxWidth: 200,
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
                                fontSize: "10px",
                                height: 20,
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

                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1, color: "#94a3b8" }}>
                        <Users size={18} />
                        <Typography sx={{ fontSize: "13px" }}>
                            {participantCount} participant{participantCount !== 1 ? "s" : ""}
                        </Typography>
                    </Box>
                    <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1, color: "#94a3b8" }}>
                        <Clock size={18} />
                        <Typography sx={{ fontSize: "13px" }}>{session.durationMinutes} min</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Main Content Area */}
            <Box sx={{ flex: 1, display: "flex", position: "relative", width: "100%" }}>
                {/* Jitsi Container */}
                <Box
                    sx={{
                        position: "relative",
                        bgcolor: "#000",
                        width: "100%",
                    }}
                >
                    <Box ref={jitsiContainerRef} sx={{ position: "absolute", inset: 0 }} />
                </Box>
            </Box>
        </Box>
    );

    // Use portal to render outside the normal DOM hierarchy for fullscreen
    if (mounted && typeof document !== "undefined") {
        return createPortal(roomContent, document.body);
    }

    return null;
};

export default VideoRoom;
