import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Box, Typography, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, useMediaQuery } from "@mui/material";
import { ArrowLeft, Users, Clock, VideoCamera, Warning, SignOut, HandWaving } from "@phosphor-icons/react";
import type { LiveSession } from "../../Hooks/liveSessions";
import { useLeaveSessionApi } from "../../Hooks/liveSessions";
import Cookies from "js-cookie";
import { getFromStorage } from "../../utils/pwaUtils";
import { Capacitor } from "@capacitor/core";
import { ForegroundService, Importance, ServiceType } from "@capawesome-team/capacitor-android-foreground-service";
import { LocalNotifications } from "@capacitor/local-notifications";

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
    const isMobile = useMediaQuery("(max-width:600px)");
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const jitsiApiRef = useRef<any>(null);
    const jitsiInitialized = useRef(false);
    const unmounting = useRef(false);
    const [mounted, setMounted] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
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

        // Security check: Use dual storage to ensure user is logged in
        const finalName = userName || getFromStorage("name") || "Student";
        const finalEmail = userEmail || getFromStorage("email") || "";

        if (!finalEmail) {
            console.error("User must be logged in to join session");
            onExit();
            return;
        }

        jitsiInitialized.current = true;

        try {
            // Explicitly request permissions before Jitsi starts - this "primes" the browser prompt
            console.log("VideoRoom: Requesting media permissions...");
            try {
                // Add a timeout to the permission request to prevent hanging forever on iOS
                const permissionTimeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Permission request timed out")), 5000)
                );

                await Promise.race([
                    navigator.mediaDevices.getUserMedia({ audio: true, video: true }),
                    permissionTimeout
                ]).then((stream: any) => {
                    console.log("VideoRoom: Permissions granted.");
                    stream.getTracks().forEach((track: any) => track.stop());
                });
            } catch (permErr) {
                console.warn("VideoRoom: Pre-initialization permission request failed or timed out:", permErr);
            }

            console.log("VideoRoom: Loading Jitsi script...");
            await loadJitsiScript();
            console.log("VideoRoom: Jitsi script loaded.");

            // Use jitsi.riot.im (Element's Jitsi) - no lobby enforcement
            const domain = "jitsi.riot.im";
            // Simple room name without special characters
            const roomName = `skillup${session.roomId.replace(/-/g, '')}`;

            // Generate a unique user ID based on email + random suffix to allow multi-device joins
            const userId = `${btoa(userEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)}_${Math.random().toString(36).substring(2, 6)}`;

            const options = {
                roomName,
                width: "100%",
                height: "100%",
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: isHost ? `${finalName} (Host)` : finalName,
                    email: finalEmail,
                    id: userId, // Unique user ID to prevent duplicates
                },
                // Set proper meeting subject to show session title
                subject: session.title,
                configOverwrite: {
                    prejoinPageEnabled: false,
                    prejoinConfig: { enabled: false },
                    startWithAudioMuted: false, // Changed to false to fix iOS CoreAudio error
                    startWithVideoMuted: false, // Changed to false to fix iOS CoreAudio error
                    disableModeratorIndicator: !isHost,
                    enableWelcomePage: false,
                    enableClosePage: false,
                    // Mobile specific
                    disableDeepLinking: true,
                    mobileWebAppRequired: false,
                    // Screen Sharing
                    disableDesktopSharing: false,
                    desktopSharingChromeDisabled: false,
                    desktopSharingFirefoxDisabled: false,
                    desktopSharingChromeSources: ['screen', 'window', 'tab'],
                    enableFeaturesBasedOnChromeExtension: false,
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
                    disableSpeakerSelection: true,
                    gamepadServiceEnabled: false,
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
                        "settings",
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

            // Brave/Hardened Chromium Fix: Manually append display-capture to iframe allow attribute
            const iframe = jitsiApiRef.current.getIFrame();
            if (iframe) {
                const currentAllow = iframe.getAttribute('allow') || '';
                if (!currentAllow.includes('display-capture')) {
                    iframe.setAttribute('allow', `${currentAllow}${currentAllow ? '; ' : ''}display-capture`);
                }
            }

            jitsiApiRef.current.addListener("videoConferenceJoined", () => {
                setIsInitializing(false);
                // Programmatically mute non-hosts after join to ensure audio session is ready
                if (!isHost) {
                    jitsiApiRef.current.executeCommand('toggleAudio');
                    jitsiApiRef.current.executeCommand('toggleVideo');
                }
            });

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

            // Show persistent foreground service notification if on native Android
            if (Capacitor.getPlatform() === 'android') {
                const CHANNEL_ID = 'skillup_meeting_ongoing';

                try {
                    // 1. Request permissions for Android 13+
                    await ForegroundService.requestPermissions();

                    // 2. Create a dedicated silent channel
                    await ForegroundService.createNotificationChannel({
                        id: CHANNEL_ID,
                        name: 'Live Meeting',
                        description: 'Persistent alert for active meetings',
                        importance: Importance.Low // Low = No sound/vibration
                    });

                    // 3. Register listener BEFORE starting the service
                    const listener = await ForegroundService.addListener('buttonClicked', (event) => {
                        console.log('Foreground Service: Button clicked', event.buttonId);
                        if (event.buttonId === 1) {
                            handleExit();
                        }
                    });

                    const notificationOptions = {
                        id: 100,
                        title: `Meeting in Progress: ${session.title}`,
                        body: `Active session. Tap to return.`,
                        smallIcon: 'ic_notification',
                        notificationChannelId: CHANNEL_ID,
                        silent: true,
                        serviceType: ServiceType.Microphone, // Max priority for communication
                        buttons: [
                            {
                                id: 1,
                                title: 'Hang Up'
                            }
                        ]
                    };

                    // 4. Start the service
                    await ForegroundService.startForegroundService(notificationOptions);

                    // 5. Auto-Relaunch loop: Every 10 seconds, force startForegroundService
                    // This ensures it pops back up if the user manages to clear it on some device skins.
                    const timerId = setInterval(async () => {
                        await ForegroundService.startForegroundService(notificationOptions);
                    }, 100);

                    // 6. Cleanup registration
                    const currentJitsiApi = jitsiApiRef.current;
                    if (currentJitsiApi) {
                        const originalDispose = currentJitsiApi.dispose;
                        currentJitsiApi.dispose = function () {
                            clearInterval(timerId);
                            listener.remove();
                            ForegroundService.stopForegroundService();
                            return originalDispose.apply(this, arguments as any);
                        };
                    }
                } catch (svcErr) {
                    console.error("Foreground Service initialization failed:", svcErr);
                }
            } else if (Capacitor.getPlatform() === 'ios') {
                // Keep local notification for iOS (since foreground services work differently there)
                await LocalNotifications.requestPermissions();
                await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: `Meeting in Progress: ${session.title}`,
                            body: "Meeting active. Tap to return to session.",
                            id: 100,
                            ongoing: true,
                            autoCancel: false,
                            extra: { sessionId: session._id }
                        }
                    ]
                });
            }
        } catch (err) {
            console.error("Failed to load Jitsi:", err);
            setIsInitializing(false);
        }
    };

    const handleExit = (endForEveryone = false) => {
        // Remove notification if on native platform
        if (Capacitor.getPlatform() === 'android') {
            ForegroundService.stopForegroundService();
        } else if (Capacitor.getPlatform() === 'ios') {
            LocalNotifications.cancel({ notifications: [{ id: 100 }] });
        }

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
                // Safe area for bottom navigation - Android: 16px, iOS: env(), Desktop: 0
                pb: Capacitor.isNativePlatform()
                    ? Capacitor.getPlatform() === 'android'
                        ? "max(env(safe-area-inset-bottom, 0px), 16px)"
                        : "env(safe-area-inset-bottom, 0px)"
                    : 0,
            }}
        >
            {/* Header Bar */}
            <Box
                sx={{
                    height: { xs: 48, sm: 56 }, // Shorter header on mobile
                    // Add safe area top padding + actual header height
                    // Android: min 24px, iOS: use env(), Desktop: 0
                    pt: Capacitor.isNativePlatform()
                        ? Capacitor.getPlatform() === 'android'
                            ? "max(env(safe-area-inset-top, 0px), 24px)"
                            : "env(safe-area-inset-top, 0px)"
                        : 0,
                    boxSizing: "content-box", // Ensure padding adds to height
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
                        startIcon={<ArrowLeft size={isMobile ? 20 : 18} />}
                        sx={{
                            color: "#94a3b8",
                            minWidth: "auto",
                            fontSize: { xs: "12px", sm: "14px" },
                            px: { xs: 0.5, sm: 1.5 },
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
                                maxWidth: { xs: 100, sm: 160, md: 300 },
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {session.title}
                        </Typography>
                        <Box sx={{ display: { xs: "none", sm: "block" } }}>
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

                {isInitializing && (
                    <Box
                        className="animate-reveal"
                        sx={{
                            position: "absolute",
                            inset: 0,
                            zIndex: 10,
                            bgcolor: "#0f172a",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 5,
                            overflow: "hidden"
                        }}
                    >
                        {/* Abstract Tech Background */}
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                background: "radial-gradient(circle at 50% 50%, rgba(30, 58, 138, 0.15) 0%, transparent 70%)",
                                zIndex: 0
                            }}
                        />

                        {/* Animated Signal Waves */}
                        <Box sx={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Box className="animate-signal" sx={{ position: "absolute", width: 80, height: 80, borderRadius: "50%", border: "1px solid rgba(59, 130, 246, 0.3)" }} />
                            <Box className="animate-signal" sx={{ position: "absolute", width: 80, height: 80, borderRadius: "50%", border: "1px solid rgba(59, 130, 246, 0.2)", animationDelay: "0.6s" }} />
                            <Box className="animate-signal" sx={{ position: "absolute", width: 80, height: 80, borderRadius: "50%", border: "1px solid rgba(59, 130, 246, 0.1)", animationDelay: "1.2s" }} />

                            {/* Outer Slow Ring */}
                            <Box
                                sx={{
                                    width: 140,
                                    height: 140,
                                    borderRadius: "50%",
                                    border: "1px dashed rgba(71, 85, 105, 0.4)",
                                    animation: "spin 12s linear infinite",
                                }}
                            />

                            {/* Dual Concentric Rings */}
                            <Box
                                sx={{
                                    position: "absolute",
                                    width: 100,
                                    height: 100,
                                    borderRadius: "50%",
                                    border: "2px solid transparent",
                                    borderTopColor: "#3b82f6",
                                    borderRightColor: "rgba(59, 130, 246, 0.3)",
                                    animation: "spin 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite",
                                }}
                            />
                            <Box
                                sx={{
                                    position: "absolute",
                                    width: 70,
                                    height: 70,
                                    borderRadius: "50%",
                                    border: "2px solid transparent",
                                    borderBottomColor: "#60a5fa",
                                    borderLeftColor: "rgba(96, 165, 250, 0.3)",
                                    animation: "spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite reverse",
                                }}
                            />

                            {/* Center Point */}
                            <Box
                                sx={{
                                    position: "absolute",
                                    width: 12,
                                    height: 12,
                                    bgcolor: "#3b82f6",
                                    borderRadius: "50%",
                                    boxShadow: "0 0 20px #3b82f6, 0 0 40px rgba(59, 130, 246, 0.4)",
                                    animation: "pulse-glow 2s ease-in-out infinite",
                                }}
                            />
                        </Box>

                        <Box sx={{ textAlign: "center", zIndex: 2, px: 3 }}>
                            <Typography
                                sx={{
                                    color: "#f8fafc",
                                    fontWeight: 700,
                                    fontSize: "22px",
                                    letterSpacing: "-0.01em",
                                    mb: 1,
                                    fontFamily: "'Chivo', sans-serif",
                                    textShadow: "0 0 20px rgba(59, 130, 246, 0.3)"
                                }}
                            >
                                Secure Connection
                            </Typography>

                            <Typography
                                sx={{
                                    color: "#64748b",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: "11px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.3em",
                                    fontWeight: 500,
                                    opacity: 0.8
                                }}
                            >
                                Initializing Pipeline
                            </Typography>

                            <Box sx={{ mt: 3, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                {[0, 1, 2].map((i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            width: 6,
                                            height: 2,
                                            bgcolor: "#3b82f6",
                                            borderRadius: "1px",
                                            animation: "pulse-glow 1s infinite",
                                            animationDelay: `${i * 0.2}s`
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* HUD Meta Info */}
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: { xs: 40, sm: 60 },
                                textAlign: "center"
                            }}
                        >
                            <Typography
                                sx={{
                                    color: "#475569",
                                    fontSize: "10px",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                    mb: 1
                                }}
                            >
                                Active Stream ID
                            </Typography>
                            <Box
                                sx={{
                                    px: 2,
                                    py: 0.75,
                                    borderRadius: "8px",
                                    bgcolor: "rgba(30, 41, 59, 0.3)",
                                    border: "1px solid rgba(71, 85, 105, 0.2)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5
                                }}
                            >
                                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#22c55e", animation: "pulse-glow 1s infinite" }} />
                                <Typography sx={{ color: "#94a3b8", fontSize: "11px", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                                    {session.title.toUpperCase().replace(/\s/g, '_')}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}
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
