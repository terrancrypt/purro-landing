import type { Template, TemplateConfig } from "../types/template";

export const templates: Template[] = [
    {
        id: "template1",
        name: "Ocean Breeze",
        description: "Clean and modern light theme with ocean-inspired colors",
        img: "/leaderboard/template1.png",
        mode: "light",
        category: "default",
        colors: {
            primary: "#005A5F",
            secondary: "#B1CAC4",
            background: "#F8FFFE",
            text: "#2C3E50",
            accent: "#00A8B5",
        },
    },
    {
        id: "template2",
        name: "Dark Ocean",
        description: "Sleek dark theme perfect for night traders",
        img: "/leaderboard/template2.png",
        mode: "dark",
        category: "default",
        colors: {
            primary: "#00D4AA",
            secondary: "#1A4D47",
            background: "#0A1A1A",
            text: "#FFFFFF",
            accent: "#00FFD1",
        },
    },
];

export const templateConfig: TemplateConfig = {
    templates,
    defaultTemplateId: "template1",
};

export const getTemplate = (templateId: string): Template | undefined => {
    return templates.find((template) => template.id === templateId);
};

export const getTemplatesByCategory = (category: string): Template[] => {
    return templates.filter((template) => template.category === category);
};

export const getTemplatesByMode = (mode: "light" | "dark"): Template[] => {
    return templates.filter((template) => template.mode === mode);
};
