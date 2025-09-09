export interface Template {
    id: string;
    name: string;
    description: string;
    img: string;
    mode: "light" | "dark";
    category?: "default" | "premium" | "seasonal";
    colors: {
        primary: string;
        secondary: string;
        text: string;
        accent?: string;
        background?: string;
    };
}

export interface TemplateConfig {
    templates: Template[];
    defaultTemplateId: string;
}

export interface ShareCardData {
    address: string;
    rank: number;
    points: number;
    volume_usd: number;
    transactions: number;
    tokens: number;
}

export interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    traderData: ShareCardData;
    timeframe: string;
    hlName?: string;
}
