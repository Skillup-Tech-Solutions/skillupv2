// Premium HUD Aesthetic - Inspired by frontend-copy
// Using Slate palette and CRT-style scanlines

export const relative = {
    position: "relative"
}

export const LoginStyle = {
    display: 'flex',
    width: '100%',
    minHeight: '100dvh', // Dynamic height for mobile browsers
    backgroundColor: '#020617', // slate-950
    backgroundImage: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    // Handling iPhone notch and Home Indicator
    paddingTop: 'calc(20px + env(safe-area-inset-top))',
    paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
    paddingLeft: 'calc(20px + env(safe-area-inset-left))',
    paddingRight: 'calc(20px + env(safe-area-inset-right))',
    position: 'relative',
    overflowY: 'auto', // Allow scrolling if content overflows on small screens
    WebkitOverflowScrolling: 'touch',
    overscrollBehavior: 'none', // Prevent pull-to-refresh and rubber-banding
    fontFamily: "'Inter', sans-serif",
    userSelect: 'none', // Prevent accidental text selection on mobile
    WebkitUserSelect: 'none',
}

// CRT Scanlines Effect
export const scanlineOverlay = {
    pointerEvents: 'none',
    position: 'fixed',
    inset: 0,
    zIndex: 5,
    background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
    backgroundSize: '100% 2px, 3px 100%',
    opacity: 0.2,
}

export const backdropOverlay = {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    backdropFilter: 'blur(8px)',
    zIndex: 1,
}

// Main card container - Exactly matching frontend-copy
export const boxTwo = {
    display: "flex",
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    width: "100%",
    maxWidth: '420px',
    padding: "40px 32px",
    backgroundColor: 'rgba(15, 23, 42, 0.9)', // slate-900/90
    border: '1px solid #334155', // slate-700
    borderRadius: '4px', // rounded-sm
    position: 'relative',
    zIndex: 10,
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',

    "& h1, & h3": {
        fontSize: '28px',
        fontFamily: "'Chivo', sans-serif",
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: '#f8fafc',
        textAlign: 'center',
        margin: 0,
    },
    "& p, & h6": {
        fontSize: '14px',
        fontFamily: "'Inter', sans-serif",
        color: '#94a3b8',
        marginTop: '8px',
        textAlign: 'center',
    },
    "& form": {
        width: "100%",
        marginTop: '32px',
    }
}

// Label styling exactly matching reference
export const labelStyleHUD = {
    display: 'block',
    fontSize: '11px',
    fontFamily: "'JetBrains Mono', monospace",
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '8px',
}

// Input styling exactly matching reference
export const inputHUD = {
    width: '100%',
    backgroundColor: '#020617', // slate-950
    border: '1px solid #334155',
    borderRadius: '4px',
    color: '#f8fafc',
    fontFamily: "'JetBrains Mono', monospace",
    padding: '12px 14px 12px 40px',
    outline: 'none',
    transition: 'all 0.2s ease',
    "&:focus": {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 1px #3b82f6',
    },
    "&::placeholder": {
        color: '#475569',
    },
    // Prevent zoom on focus on iOS
    fontSize: '16px',
    "@media (min-width: 600px)": {
        fontSize: '14px',
    }
}

export const inputContainerHUD = {
    position: 'relative',
    marginBottom: '20px',
}

export const inputIconHUD = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b',
    display: 'flex',
}

export const eyeIconHUD = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b',
    cursor: 'pointer',
    "&:hover": {
        color: '#94a3b8',
    }
}

// Button styling with blue glow and active state feedback
export const buttonHUD = {
    width: '100%',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    padding: '16px 24px', // Slightly larger for better touch targets
    borderRadius: '4px', // matching boxTwo rounded-sm
    border: 'none',
    cursor: 'pointer',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
    transition: 'all 0.15s ease',
    marginTop: '10px',
    "&:hover": {
        backgroundColor: '#3b82f6',
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)',
    },
    "&:active": {
        transform: 'scale(0.98)',
        opacity: 0.9,
    },
    "&:disabled": {
        opacity: 0.5,
        cursor: 'not-allowed',
        boxShadow: 'none',
    }
}

export const errorHUD = {
    fontSize: '12px',
    fontFamily: "'Inter', sans-serif",
    color: '#ef4444',
    marginTop: '4px',
}

export const boxThreeHUD = {
    width: "100%",
    textAlign: 'center',
    marginTop: '32px',
    "& h4": {
        fontSize: '12px',
        color: '#64748b',
        fontFamily: "'JetBrains Mono', monospace",
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    }
}

export const forgotPasswordHUD = {
    fontSize: '12px',
    fontFamily: "'Inter', sans-serif",
    color: '#3b82f6',
    textAlign: 'right',
    cursor: 'pointer',
    marginBottom: '20px',
    transition: 'color 0.2s',
    "&:hover": {
        color: '#60a5fa',
    }
}

export const demoHUD = {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: 'rgba(2, 6, 23, 0.5)',
    border: '1px solid #1e293b',
    borderRadius: '2px',
    "& p": {
        fontSize: '11px',
        color: '#64748b',
        textTransform: 'uppercase',
        fontFamily: "'JetBrains Mono', monospace",
        textAlign: 'left',
        marginBottom: '8px',
    },
    "& div": {
        fontSize: '12px',
        fontFamily: "'JetBrains Mono', monospace",
        color: '#94a3b8',
        display: 'flex',
        justifyContent: 'space-between',
    }
}

// Legacy exports to prevent crashes while migrating pages to HUD design
export const LoginLeft = {};
export const LoginRight = {};
export const LoginImage = {};
export const LoginOverLay = {};
export const LoginContentOverlay = {};
export const blueStarOne = {};
export const blueStarTwo = {};
export const whiteStar = {};
export const boxOne = {};
export const boxThree = {};
export const loginLogo = {};
export const microsoftBottom = {};
export const loginOr = {};
export const microsoftBtn = {};
export const marginBottom10 = {};
export const ForgetButton = {};
export const width100 = { width: '100%' };