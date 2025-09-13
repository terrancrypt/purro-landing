import type { Template, TemplateConfig } from "../types/template";

export const templates: Template[] = [
    {
        id: "template1",
        name: "Ocean Breeze",
        img: "/leaderboard/template1.png",
        mode: "light",
        colors: {
            primary: "#00A8B5",
            secondary: "#B1CAC4",
            background: "#FFFFFF",
            text: "#2C3E50",
            accent: "#00D4AA",
        },
    },
    {
        id: "template2",
        name: "Dark Ocean",
        img: "/leaderboard/template2.png",
        mode: "dark",
        colors: {
            primary: "#00D4AA",
            secondary: "#1A4D47",
            background: "#0A1A1A",
            text: "#FFFFFF",
            accent: "#00FFD1",
        },
    },
    {
        id: "template3",
        name: "Ocean Breeze Alt",
        img: "/leaderboard/template3.png",
        mode: "light",
        colors: {
            primary: "#00A8B5",
            secondary: "#B1CAC4",
            background: "#FFFFFF",
            text: "#2C3E50",
            accent: "#00D4AA",
        },
    },
    {
        id: "template4",
        name: "Dark Ocean Alt",
        img: "/leaderboard/template4.png",
        mode: "dark",
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

export const getTemplatesByMode = (mode: "light" | "dark"): Template[] => {
    return templates.filter((template) => template.mode === mode);
};
