/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Requis par @privy-io/react-auth v3 pour ses wallets Solana :
    // ces paquets doivent rester externes au bundle webpack.
    // (Non nécessaire si vous basculez sur Turbopack.)
    config.externals["@solana/kit"] = "commonjs @solana/kit";
    config.externals["@solana-program/memo"] = "commonjs @solana-program/memo";
    config.externals["@solana-program/system"] = "commonjs @solana-program/system";
    config.externals["@solana-program/token"] = "commonjs @solana-program/token";
    return config;
  },
};

module.exports = nextConfig;
