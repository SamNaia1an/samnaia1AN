/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader:false,
  images:{unoptimized:true},
  async headers(){return [{source:"/:path*",headers:[
    {key:"X-Content-Type-Options",value:"nosniff"},
    {key:"X-Frame-Options",value:"DENY"},
    {key:"Referrer-Policy",value:"no-referrer"},
    {key:"Permissions-Policy",value:"camera=(self), microphone=(), geolocation=()"},
    {key:"X-Robots-Tag",value:"noindex, nofollow, noarchive"}
  ]}];}
};
export default nextConfig;
