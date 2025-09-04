import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function truncateAddress(address: string, { length = 8 }: { length?: number } = {}) {
    return `${address.slice(0, length)}...${address.slice(-length)}`;
}