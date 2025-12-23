/**
 * Button Styles - Standardized Design System
 * All buttons throughout the app should use these styles to match landing page design
 */

export const primaryButtonStyle = {
    backgroundColor: "var(--webprimary)",
    color: "var(--white)",
    border: "solid 1px var(--webprimary)",
    fontFamily: "Medium_W",
    fontSize: "12px",
    textTransform: "capitalize",
    padding: "8px 20px",
    transition: "all 0.3s ease",
    "&:hover": {
        backgroundColor: "transparent",
        color: "var(--webprimary)",
        borderColor: "var(--webprimary)",
    }
};

export const outlinedButtonStyle = {
    backgroundColor: "transparent",
    color: "var(--webprimary)",
    border: "solid 1px var(--webprimary)",
    fontFamily: "Medium_W",
    fontSize: "12px",
    textTransform: "capitalize",
    padding: "8px 20px",
    transition: "all 0.3s ease",
    "&:hover": {
        backgroundColor: "var(--webprimary)",
        color: "var(--white)",
    }
};

export const cancelButtonStyle = {
    backgroundColor: "transparent",
    color: "var(--title)",
    border: "solid 1px var(--borderColor)",
    fontFamily: "Medium_W",
    fontSize: "12px",
    textTransform: "capitalize",
    padding: "8px 20px",
    transition: "all 0.3s ease",
    "&:hover": {
        backgroundColor: "var(--borderColorOne)",
        borderColor: "var(--title)",
    }
};

export const submitButtonStyle = {
    backgroundColor: "var(--webprimary)",
    color: "var(--white)",
    border: "solid 1px var(--webprimary)",
    fontFamily: "Medium_W",
    fontSize: "12px",
    textTransform: "capitalize",
    padding: "8px 20px",
    transition: "all 0.3s ease",
    "&:hover": {
        backgroundColor: "transparent",
        color: "var(--webprimary)",
        borderColor: "var(--webprimary)",
    }
};

export const smallPrimaryButton = {
    backgroundColor: "var(--webprimary)",
    color: "var(--white)",
    border: "solid 1px var(--webprimary)",
    fontFamily: "Medium_W",
    fontSize: "11px",
    textTransform: "none",
    padding: "6px 12px",
    transition: "all 0.2s ease",
    "&:hover": {
        backgroundColor: "transparent",
        color: "var(--webprimary)",
    }
};

export const dangerButtonStyle = {
    backgroundColor: "#ef4444",
    color: "var(--white)",
    border: "solid 1px #ef4444",
    fontFamily: "Medium_W",
    fontSize: "12px",
    textTransform: "none",
    padding: "6px 12px",
    "&:hover": {
        backgroundColor: "transparent",
        color: "#ef4444",
    }
};

export const textLinkStyle = {
    textTransform: "none",
    fontSize: "0.75rem",
    padding: 0,
    minWidth: 0,
    color: "var(--webprimary)",
    backgroundColor: "transparent",
    "&:hover": {
        textDecoration: "underline",
        backgroundColor: "transparent",
    }
};
