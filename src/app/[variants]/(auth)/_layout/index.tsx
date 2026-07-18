'use client';

import Link from 'next/link';
import { type FC, type PropsWithChildren } from 'react';

const AuthContainer: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div style={{ display:'flex', height:'100vh', width:'100vw', overflow:'hidden', fontFamily:'Manrope, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>

      {/* LEFT PANEL */}
      <div style={{ width:'52%', height:'100vh', position:'relative', overflow:'hidden' }}>
        <img
          src="/images/fi-login-bg.jpg"
          alt=""
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }}
        />
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.08)' }} />

        <div style={{ position:'absolute', top:32, left:32, zIndex:2 }}>
          <Link href="/" style={{ textDecoration:'none' }}>
            <span style={{ fontSize:18, fontWeight:700, color:'#111', letterSpacing:'-0.4px', background:'rgba(255,255,255,0.85)', backdropFilter:'blur(8px)', padding:'5px 14px', borderRadius:20 }}>Fi</span>
          </Link>
        </div>

        <div style={{ position:'absolute', bottom:40, left:32, right:32, zIndex:2 }}>
          <div style={{ background:'rgba(255,255,255,0.82)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderRadius:20, padding:'24px 28px', boxShadow:'0 8px 32px rgba(0,0,0,0.12)', border:'1px solid rgba(255,255,255,0.95)' }}>
            <div style={{ fontSize:28, fontWeight:700, color:'#111', letterSpacing:'-0.5px', lineHeight:1.2 }}>Think it.</div>
            <div style={{ fontSize:28, fontWeight:700, color:'#111', letterSpacing:'-0.5px', lineHeight:1.2 }}>Fi gets it.</div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width:'48%', height:'100vh', background:'#fff', display:'flex', flexDirection:'column', borderLeft:'1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 10%' }}>
          <div style={{ width:'100%', maxWidth:'340px' }}>
            {children}
          </div>
        </div>
        <div style={{ padding:'24px 10%', textAlign:'center' }}>
          <span style={{ fontSize:11, color:'#ccc', lineHeight:1.6 }}>
            By continuing, you agree to Fi&apos;s{' '}
            <a href="/terms" style={{ color:'#ccc', textDecoration:'underline', fontSize:11 }}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" style={{ color:'#ccc', textDecoration:'underline', fontSize:11 }}>Privacy Policy</a>
          </span>
        </div>
      </div>

    </div>
  );
};

export default AuthContainer;
