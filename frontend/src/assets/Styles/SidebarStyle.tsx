export const SidebarBox = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    backgroundColor: '#020617', // slate-950
}
export const SidebarBoxOne = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'start',
    gap: "10px",
    paddingBottom: "12px",
    marginTop: '25px',
    paddingLeft: "10px",
    paddingRight: "10px",
    "& img": {
        width: '80px',
    },
    "& h3": {
        fontFamily: "'Chivo', sans-serif",
        fontSize: '20px',
        color: '#f8fafc', // slate-50
        fontWeight: 700,
    },
    borderBottom: "1px solid rgba(71, 85, 105, 0.4)" // slate-600/40
}
export const SidebarBoxTwo = {
    marginTop: '12px',
    "h4": {
        fontFamily: "'JetBrains Mono', monospace",
        color: '#64748b', // slate-500
        fontSize: '11px',
        paddingLeft: "10px",
        paddingRight: "10px",
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
    },
}
export const SidebarBoxThree = {
    marginTop: '20px',
    "h4": {
        fontFamily: "'JetBrains Mono', monospace",
        color: '#64748b', // slate-500
        fontSize: '11px',
        paddingLeft: "10px",
        paddingRight: "10px",
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
    },
}
export const SidebarLinks = {
    marginTop: '12px',
    "& a": {
        fontFamily: "'Inter', sans-serif",
        color: '#94a3b8', // slate-400
        fontSize: '14px',
        textDecoration: 'none',
    },
    "& div": {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'start',
        gap: "10px",
        padding: "10px 12px",
        margin: "4px 8px",
        borderRadius: "6px",
        transition: "all 0.2s ease",
    },
    "& div:hover": {
        backgroundColor: 'rgba(51, 65, 85, 0.5)', // slate-700/50
        color: '#f8fafc', // slate-50
    },
}
export const SidebarBottom = {
    borderTop: "1px solid rgba(71, 85, 105, 0.4)", // slate-600/40
    padding: "12px 14px",
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)', // slate-900/50
    "& img": {
        width: '40px',
        borderRadius: '100%',
    },
    "& h2": {
        fontSize: '14px',
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
        color: '#f8fafc', // slate-50
        paddingBottom: "4px",
    },
    "& h3": {
        fontSize: '12px',
        fontFamily: "'JetBrains Mono', monospace",
        color: '#64748b', // slate-500
    },
    "& svg": {
        fontSize: '18px',
        color: '#94a3b8', // slate-400
    },
}
export const LogoutBox = {
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    "&:hover": {
        backgroundColor: 'rgba(239, 68, 68, 0.2)', // red-500/20
        "& svg": {
            color: '#ef4444', // red-500
        }
    }
}
export const SidebarBottomLeft = {
    display: 'flex',
    justifyContent: 'start',
    gap: "10px",
    alignItems: 'center',
}