'use client';

import Link from 'next/link';
import { type FC, type PropsWithChildren } from 'react';

const AuthContainer: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div style={{ display:'flex', height:'100vh', width:'100vw', overflow:'hidden', fontFamily:'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>

      {/* LEFT PANEL */}
      <div style={{ width:'50%', height:'100vh', background:'#fff', display:'flex', flexDirection:'column' }}>

        {/* Logo */}
        <div style={{ padding:'28px 40px', flexShrink:0 }}>
          <Link href={'/'} style={{ textDecoration:'none' }}>
            <span style={{ fontSize:22, fontWeight:700, color:'#000', letterSpacing:'-0.5px' }}>Fi</span>
          </Link>
        </div>

        {/* Form center */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 80px' }}>
          <div style={{ width:'100%', maxWidth:'360px' }}>
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif !important; }
              .ant-input-affix-wrapper { background:#fff !important; border:1px solid rgba(0,0,0,0.18) !important; border-radius:100px !important; box-shadow:none !important; padding:0 16px !important; height:44px !important; transition: border-color 0.2s !important; }
              .ant-input-affix-wrapper:hover { border-color:rgba(0,0,0,0.4) !important; }
              .ant-input-affix-wrapper-focused, .ant-input-affix-wrapper:focus-within { border-color:#000 !important; box-shadow:none !important; outline:none !important; }
              .ant-input { background:transparent !important; color:#000 !important; font-size:14px !important; box-shadow:none !important; border:none !important; outline:none !important; height:42px !important; padding:0 4px !important; }
              .ant-input::placeholder { color:#aaa !important; font-size:14px !important; }
              .ant-input:focus { box-shadow:none !important; outline:none !important; }
              .ant-input-prefix { color:#aaa !important; margin-right:8px !important; }
              .ant-input-suffix .ant-btn { height:32px !important; width:32px !important; padding:0 !important; border-radius:100px !important; background:#000 !important; border:none !important; color:#fff !important; min-width:32px !important; }
              .ant-btn { height:44px !important; border-radius:100px !important; font-size:14px !important; font-weight:500 !important; box-shadow:none !important; }
              .ant-btn-primary { background:#000 !important; border-color:#000 !important; color:#fff !important; font-weight:600 !important; }
              .ant-btn-primary:hover { background:#1a1a1a !important; }
              .ant-btn-default { background:#fff !important; border:1px solid rgba(0,0,0,0.18) !important; color:#000 !important; }
              .ant-btn-default:hover { border-color:rgba(0,0,0,0.4) !important; background:#fafafa !important; }
              .ant-btn-filled { background:#f5f5f5 !important; color:#000 !important; border:none !important; }
              .ant-divider { border-color:rgba(0,0,0,0.08) !important; margin:12px 0 !important; }
              .ant-divider-inner-text { color:#aaa !important; font-size:12px !important; font-weight:400 !important; }
              .ant-form-item { margin-bottom:10px !important; }
              .ant-badge-ribbon { display:none !important; }
              .ant-badge-ribbon-wrapper { width:100% !important; }
              h1 { color:#000 !important; font-size:26px !important; font-weight:600 !important; margin:0 0 24px 0 !important; letter-spacing:-0.5px !important; line-height:1.3 !important; text-align:center !important; font-family:'Inter', -apple-system, sans-serif !important; }
              a { color:#000 !important; text-decoration:none !important; }
              a:hover { text-decoration:underline !important; }
            `}</style>
            {children}
          </div>
        </div>

        {/* Terms — bottom */}
        <div style={{ padding:'24px 40px', flexShrink:0, textAlign:'center' }}>
          <span style={{ fontSize:12, color:'#aaa', lineHeight:1.5 }}>
            By continuing, you agree to Fi&apos;s{' '}
            <a href="/terms" style={{ color:'#aaa', textDecoration:'underline', fontSize:12, fontWeight:400 }}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" style={{ color:'#aaa', textDecoration:'underline', fontSize:12, fontWeight:400 }}>Privacy Policy</a>
          </span>
        </div>

      </div>

      {/* RIGHT PANEL */}
      <div style={{ width:'50%', height:'100%', background:'#0a0a0a', position:'relative', overflow:'hidden' }}>
        <style>{`
          @keyframes pulseGlow { 0%,100%{opacity:.5} 50%{opacity:.9} }
          @keyframes rotC1 { to { transform: rotate(360deg); } }
          @keyframes rotC2 { to { transform: rotate(-360deg); } }
          .rp-glow { position:absolute; top:-10%; right:-10%; width:80%; height:80%; background:radial-gradient(circle, rgba(210,160,40,0.35) 0%, rgba(180,110,10,0.15) 40%, transparent 70%); animation:pulseGlow 6s ease-in-out infinite; pointer-events:none; }
          .rp-glow2 { position:absolute; bottom:-20%; left:-10%; width:55%; height:55%; background:radial-gradient(circle, rgba(180,120,20,0.12) 0%, transparent 65%); animation:pulseGlow 9s ease-in-out infinite 3s; pointer-events:none; }
          .rp-c1 { position:absolute; inset:-60%; width:220%; height:220%; background:conic-gradient(from 155deg at 72% 32%, rgba(255,255,255,0.95) 0deg, rgba(210,160,20,0.85) 18deg, transparent 70deg, transparent 345deg, rgba(255,255,255,0.95) 360deg); opacity:0.12; animation:rotC1 18s linear infinite; transform-origin:72% 32%; pointer-events:none; }
          .rp-c2 { position:absolute; inset:-60%; width:220%; height:220%; background:conic-gradient(from 0deg at 72% 68%, transparent 0deg, transparent 290deg, rgba(210,160,20,0.85) 335deg, rgba(255,255,255,0.95) 360deg); opacity:0.09; animation:rotC2 24s linear infinite; transform-origin:72% 68%; pointer-events:none; }
        `}</style>
        <div className="rp-glow" />
        <div className="rp-glow2" />
        <div className="rp-c1" />
        <div className="rp-c2" />
      </div>

    </div>
  );
};

export default AuthContainer;
