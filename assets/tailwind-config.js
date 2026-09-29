// Shared Tailwind (Play CDN) theme so every page uses the same tokens.
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#00BFFF",
                "primary-container": "#00BFFF",
                "on-primary-container": "#002d63",
                "surface": "#f9f9f9",
                "on-surface": "#1a1c1c",
                "on-surface-variant": "#3d4850",
                "surface-variant": "#e2e2e2",
                "surface-container-low": "#f3f3f3",
                "surface-container-high": "#e8e8e8",
                "surface-container-highest": "#e2e2e2",
                "secondary": "#5e5e5e",
                "outline": "#6d7981",
                "tertiary": "#ba1a20",
            },
            borderRadius: { "DEFAULT": "0px" },
            fontFamily: {
                "headline": ["Space Grotesk", "sans-serif"],
                "body": ["Inter", "sans-serif"],
            },
        },
    },
};
