export const HeaderStyle = {
    background: 'rgba(15, 23, 42, 0.8)', // slate-900/80
    backdropFilter: 'blur(12px)',
    borderRadius: '6px',
    border: '1px solid rgba(71, 85, 105, 0.4)', // slate-600/40
    padding: "8px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "10px",
    "& h4": {
        color: "#94a3b8", // slate-400
        fontSize: "14px",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
    },
    "& svg": {
        color: "#94a3b8", // slate-400
        fontSize: "18px",
        cursor: "pointer",
        transition: "color 0.2s ease",
        "&:hover": {
            color: "#f8fafc", // slate-50
        }
    },
}