/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  // `STATIC_EXPORT=1 npm run build` writes a static site to ./out
  ...(process.env.STATIC_EXPORT ? { output: "export", images: { unoptimized: true } } : {}),
};

export default nextConfig;
