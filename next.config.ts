import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración de imágenes para avatares de Google
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },

  // Logging mejorado para debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Optimización de paquetes externos en server components (Next.js 16)
  serverExternalPackages: ['@node-rs/argon2', 'bcrypt'],
};

export default nextConfig;
