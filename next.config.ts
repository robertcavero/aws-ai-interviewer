import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Isso força o Next.js a injetar a variável DENTRO da pasta .next durante o build
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
};

export default nextConfig;