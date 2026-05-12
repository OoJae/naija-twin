import type { NextConfig } from "next";
import dotenv from "dotenv";
import path from "path";

// Load .env from monorepo root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {};

export default nextConfig;
