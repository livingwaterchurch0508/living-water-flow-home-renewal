import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {
     env: { 
    TZ: "Asia/Seoul",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
        port: "",
        pathname: "/vi/**",
        search: "",
      },
    ],
  },
};
 
const withNextIntl = createNextIntlPlugin("./app/lib/i18n/request.ts");
export default withNextIntl(nextConfig);