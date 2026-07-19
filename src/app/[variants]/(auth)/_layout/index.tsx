'use client';

import Link from 'next/link';
import { type FC, type PropsWithChildren } from 'react';

const AuthContainer: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div style={{ display:'flex', height:'100vh', width:'100vw', fontFamily:'Manrope, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>

      {/* LEFT PANEL */}
      <div style={{ width:'50%', height:'100vh', position:'relative', overflow:'hidden', background:'#fff', display:'flex', flexDirection:'column' }}>

        {/* Grid background with fade right */}
        <div style={{
          position:'absolute', inset:0, zIndex:0,
          backgroundImage:'linear-gradient(rgba(0,0,0,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.07) 1px, transparent 1px)',
          backgroundSize:'60px 60px',
          WebkitMaskImage:'linear-gradient(to right, black 0%, black 40%, transparent 100%)',
          maskImage:'linear-gradient(to right, black 0%, black 40%, transparent 100%)'
        }} />

        {/* Fi logo top left */}
        <div style={{ position:'relative', zIndex:2, padding:'36px 36px 0' }}>
          <Link href="/" style={{ textDecoration:'none', display:'inline-flex', alignItems:'center' }}>
            <img src="/logos/fi-icon-black.svg" alt="Fi" style={{ height:36, width:'auto', display:'block' }} />
          </Link>
        </div>

        {/* Headline centered */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 48px', position:'relative', zIndex:2 }}>
          <div>
            <h1 style={{ fontSize:26, fontWeight:700, color:'#111', letterSpacing:'-0.4px', lineHeight:1.3, margin:'0 0 10px 0', fontFamily:'Manrope, sans-serif' }}>
              For the ones who never stop thinking.
            </h1>
            <p style={{ fontSize:15, color:'#444', margin:0, fontFamily:'Manrope, sans-serif', lineHeight:1.5 }}>
              Every idea has a home here.
            </p>
          </div>
        </div>

        <div style={{ height:36 }} />

      </div>

      {/* RIGHT PANEL */}
      <div style={{ width:'50%', height:'100vh', background:'#fff', display:'flex', flexDirection:'column', borderLeft:'1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 52px' }}>
          <div style={{ width:'100%', maxWidth:'340px' }}>
            {children}
          </div>
        </div>
        <div style={{ padding:'0 0 28px', textAlign:'center' }}>
          <span style={{ fontSize:12, color:'#666', lineHeight:1.6 }}>
            By continuing, you agree to Fi&apos;s{' '}
            <a href="/terms" style={{ color:'#444', textDecoration:'underline', fontSize:12 }}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" style={{ color:'#444', textDecoration:'underline', fontSize:12 }}>Privacy Policy</a>
          </span>
        </div>
      </div>

    </div>
  );
};

export default AuthContainer;
