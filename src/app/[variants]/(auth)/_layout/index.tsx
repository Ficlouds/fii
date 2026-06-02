'use client';

import Link from 'next/link';
import { type FC, type PropsWithChildren } from 'react';

const AuthContainer: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div style={{ display:'flex', height:'100vh', width:'100vw', overflow:'hidden', fontFamily:'-apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>

      {/* LEFT PANEL */}
      <div style={{ width:'50%', height:'100vh', background:'#fff', display:'flex', flexDirection:'column' }}>

        {/* Logo */}
        <div style={{ padding:'24px 32px', flexShrink:0 }}>
          <Link href={'/'} style={{ textDecoration:'none' }}>
            <span style={{ color:'#000', fontSize:20, fontWeight:700, letterSpacing:'-0.5px' }}>Fi</span>
          </Link>
        </div>

        {/* Form center */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 80px' }}>
          <div style={{ width:'100%', maxWidth:'340px' }}>
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif !important; }
              .ant-input-affix-wrapper { background:#fff !important; border:1px solid rgba(0,0,0,0.18) !important; border-radius:100px !important; box-shadow:none !important; padding:0 14px !important; height:46px !important; }
              .ant-input-affix-wrapper:hover { border-color:#000 !important; }
              .ant-input-affix-wrapper-focused, .ant-input-affix-wrapper:focus-within { border-color:#000 !important; box-shadow:none !important; outline:none !important; }
              .ant-input { background:transparent !important; color:#000 !important; font-size:14px !important; box-shadow:none !important; border:none !important; outline:none !important; height:44px !important; padding:0 4px !important; }
              .ant-input::placeholder { color:#bbb !important; }
              .ant-input:focus { box-shadow:none !important; outline:none !important; }
              .ant-input-prefix { color:#bbb !important; margin-right:6px !important; }
              .ant-input-suffix .ant-btn { height:34px !important; width:34px !important; padding:0 !important; border-radius:100px !important; background:#000 !important; border:none !important; color:#fff !important; min-width:34px !important; }
              .ant-btn { height:46px !important; border-radius:100px !important; font-size:14px !important; font-weight:500 !important; box-shadow:none !important; }
              .ant-btn-primary { background:#000 !important; border-color:#000 !important; color:#fff !important; font-weight:600 !important; }
              .ant-btn-primary:hover { background:#222 !important; }
              .ant-btn-default { background:#fff !important; border:1px solid rgba(0,0,0,0.15) !important; color:#000 !important; }
              .ant-btn-default:hover { border-color:#000 !important; background:#f8f8f8 !important; }
              .ant-btn-filled { background:#f0f0f0 !important; color:#000 !important; border:none !important; }
              .ant-divider { border-color:rgba(0,0,0,0.08) !important; margin:10px 0 !important; }
              .ant-divider-inner-text { color:#bbb !important; font-size:12px !important; }
              .ant-form-item { margin-bottom:10px !important; }
              .ant-badge-ribbon { display:none !important; }
              .ant-badge-ribbon-wrapper { width:100% !important; }
              h1 { color:#000 !important; font-size:26px !important; font-weight:600 !important; margin:0 0 28px 0 !important; letter-spacing:-0.5px !important; line-height:1.3 !important; text-align:center !important; font-family:'Inter', -apple-system, sans-serif !important; }
              a { color:#000 !important; text-decoration:none !important; }
              a:hover { text-decoration:underline !important; }
            `}</style>
            {children}
          </div>
        </div>

        {/* Terms — bottom */}
        <div style={{ padding:'20px 32px', flexShrink:0, textAlign:'center' }}>
          <span style={{ fontSize:12, color:'#bbb' }}>
            By continuing, you agree to Fi&apos;s{' '}
            <a href="/terms" style={{ color:'#bbb', textDecoration:'underline', fontSize:12 }}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" style={{ color:'#bbb', textDecoration:'underline', fontSize:12 }}>Privacy Policy</a>
          </span>
        </div>

      </div>

      {/* RIGHT PANEL */}
      <div style={{ width:'50%', height:'100%', background:'#000', position:'relative', overflow:'hidden' }}>
        <style>{`
          @keyframes pulseGlow { 0%,100%{opacity:.55} 50%{opacity:.9} }
          @keyframes rotC1 { to { transform: rotate(360deg); } }
          @keyframes rotC2 { to { transform: rotate(-360deg); } }
          .rp-glow { position:absolute; top:-25%; right:-20%; width:80%; height:80%; background:radial-gradient(circle, rgba(200,150,40,0.28) 0%, rgba(180,110,10,0.1) 45%, transparent 70%); animation:pulseGlow 5s ease-in-out infinite; pointer-events:none; }
          .rp-c1 { position:absolute; inset:-60%; width:220%; height:220%; background:conic-gradient(from 155deg at 72% 32%, rgba(255,255,255,0.9) 0deg, rgba(200,150,20,0.8) 18deg, transparent 75deg, transparent 348deg, rgba(255,255,255,0.9) 360deg); opacity:0.09; animation:rotC1 15s linear infinite; transform-origin:72% 32%; pointer-events:none; }
          .rp-c2 { position:absolute; inset:-60%; width:220%; height:220%; background:conic-gradient(from 0deg at 72% 68%, transparent 0deg, transparent 295deg, rgba(200,150,20,0.8) 338deg, rgba(255,255,255,0.9) 360deg); opacity:0.07; animation:rotC2 20s linear infinite; transform-origin:72% 68%; pointer-events:none; }
        `}</style>
        <div className="rp-glow" />
        <div className="rp-c1" />
        <div className="rp-c2" />
      </div>

    </div>
  );
};

export default AuthContainer;
