export const tokens = {
  colors: {
    primary: "var(--primary)",
    secondary: "var(--secondary)",
    accent: "var(--accent)",
    background: "var(--background)",
    foreground: "var(--foreground)",
    text: "var(--foreground)",
    textMuted: "var(--muted-foreground)",
    muted: "var(--muted-foreground)",
    soft: "var(--secondary)",
    softAccent: "var(--muted)",
    danger: "var(--destructive)",
    success: "var(--success)",
    warning: "var(--warning)",
    white: "#FFFFFF",
    black: "#000000",
  },
  animations: {
    duration: 0.3, // 300ms as per design brief
    ease: [0.4, 0, 0.2, 1],
  },
  typography: {
    baseSize: "16px",
    headingSize: "24px",
    sectionSize: "20px",
    labelSize: "13px",
  },
  radius: {
    card: "20px",
    button: "14px",
    input: "12px",
    section: "16px",
    sheet: "24px",
    pill: "999px",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    base: "16px",
    cardPad: "20px",
    sectionGap: "24px",
    largeGap: "32px",
    tapTarget: "44px",
  }
};
