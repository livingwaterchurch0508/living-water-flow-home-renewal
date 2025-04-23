import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {
     env: { 
    TZ: "Asia/Seoul",
  },
  images: {
    domains: ['storage.googleapis.com'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
        port: "",
        pathname: "/vi/**",
        search: "",
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/livingwater-424005.appspot.com/**',
      },
    ],
  },
};
 
const withNextIntl = createNextIntlPlugin("./app/lib/i18n/request.ts");
export default withNextIntl(nextConfig);