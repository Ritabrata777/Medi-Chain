import { config as dotenvConfig } from 'dotenv'

// Load env from standard files; also load config.env if present
dotenvConfig()
dotenvConfig({ path: 'config.env' })

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodyTimeout: 120, // Increase timeout to 120 seconds
        },
    },
    serverActions: {
        bodySizeLimit: '2mb',
    },
};

export default nextConfig;
