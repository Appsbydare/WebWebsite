/**
 * Server-side logger. No-ops in production to satisfy security protocol
 * (Zero Console in Prod). Use for API routes, webhooks, server actions.
 */
const isProd = process.env.NODE_ENV === "production";

export const logger = {
    error: (...args: unknown[]) => {
        if (!isProd) console.error(...args);
    },
    warn: (...args: unknown[]) => {
        if (!isProd) console.warn(...args);
    },
    info: (...args: unknown[]) => {
        if (!isProd) console.info(...args);
    },
};
