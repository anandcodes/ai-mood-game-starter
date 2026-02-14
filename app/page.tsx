"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div style={{ background: '#000', height: '100vh' }} />;

    return (
        <main style={containerStyle}>
            {/* Immersive Background Elements */}
            <div style={blob1Style} />
            <div style={blob2Style} />
            <div style={noiseStyle} />

            {/* Content Container */}
            <div style={contentStyle}>
                <header style={headerStyle}>
                    <div style={brandBadgeStyle}>v2.0 ARCADE</div>
                    <h1 style={titleStyle}>
                        AERIS
                    </h1>
                    <div style={titleUnderlineStyle} />
                    <p style={taglineStyle}>
                        The AI Sensory Experience
                    </p>
                </header>

                <div style={menuStyle}>
                    <Link href="/game" style={playButtonStyle}>
                        <span style={buttonTextStyle}>START JOURNEY</span>
                        <div style={buttonGlowStyle} />
                    </Link>

                    <div style={infoGridStyle}>
                        <div style={infoItemStyle}>
                            <span style={infoLabelStyle}>REACTIVE</span>
                            <span style={infoDescStyle}>World shifts with your mood</span>
                        </div>
                        <div style={infoItemStyle}>
                            <span style={infoLabelStyle}>INFINITE</span>
                            <span style={infoDescStyle}>Procedural quest system</span>
                        </div>
                        <div style={infoItemStyle}>
                            <span style={infoLabelStyle}>AUDITORY</span>
                            <span style={infoDescStyle}>Dynamic musical feedback</span>
                        </div>
                    </div>
                </div>

                <footer style={footerStyle}>
                    CREATED BY DEEPMIND AGENTS • 2026
                </footer>
            </div>

            {/* Global Animations */}
            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-20px) scale(1.05); }
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.3; filter: blur(40px); }
                    50% { opacity: 0.6; filter: blur(60px); }
                }
                @keyframes drift {
                    from { background-position: 0 0; }
                    to { background-position: 100% 100%; }
                }
                button:hover {
                    transform: scale(1.05);
                }
            `}</style>
        </main>
    );
}

// ── Styles ────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
    position: 'relative',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#000',
    overflow: 'hidden',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
};

const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '40px',
    padding: '40px',
};

const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
};

const brandBadgeStyle: React.CSSProperties = {
    fontSize: '10px',
    letterSpacing: '4px',
    color: '#ffcc00',
    marginBottom: '10px',
    fontWeight: 900,
    padding: '4px 12px',
    border: '1px solid rgba(255,204,0,0.3)',
    borderRadius: '20px',
};

const titleStyle: React.CSSProperties = {
    fontSize: 'clamp(4rem, 15vw, 8rem)',
    fontWeight: 900,
    margin: 0,
    letterSpacing: '-2px',
    background: 'linear-gradient(180deg, #fff 0%, #aaa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 10px 30px rgba(0,0,0,0.5)',
};

const titleUnderlineStyle: React.CSSProperties = {
    width: '60px',
    height: '4px',
    background: '#ff4488',
    marginTop: '-10px',
    borderRadius: '2px',
    boxShadow: '0 0 20px #ff4488',
};

const taglineStyle: React.CSSProperties = {
    fontSize: '14px',
    opacity: 0.6,
    letterSpacing: '8px',
    textTransform: 'uppercase',
    marginTop: '20px',
};

const menuStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '60px',
};

const playButtonStyle: React.CSSProperties = {
    position: 'relative',
    padding: '24px 64px',
    fontSize: '16px',
    fontWeight: 800,
    color: '#000',
    background: '#fff',
    textDecoration: 'none',
    borderRadius: '100px',
    letterSpacing: '4px',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    overflow: 'hidden',
};

const buttonTextStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
};

const buttonGlowStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.8), transparent)',
    transform: 'translateX(-100%)',
    transition: 'transform 0.6s ease',
};

// Background Elements
const blob1Style: React.CSSProperties = {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: '40vw',
    height: '40vw',
    background: 'radial-gradient(circle, #2a1b5e 0%, transparent 70%)',
    filter: 'blur(80px)',
    animation: 'pulse-glow 10s infinite alternate',
};

const blob2Style: React.CSSProperties = {
    position: 'absolute',
    bottom: '10%',
    right: '10%',
    width: '50vw',
    height: '50vw',
    background: 'radial-gradient(circle, #5e1b3a 0%, transparent 70%)',
    filter: 'blur(80px)',
    animation: 'pulse-glow 8s infinite alternate-reverse',
};

const noiseStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    opacity: 0.05,
    pointerEvents: 'none',
    backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")',
    filter: 'contrast(150%) brightness(150%)',
};

const infoGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '30px',
    width: '100%',
    maxWidth: '800px',
};

const infoItemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '8px',
};

const infoLabelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 900,
    color: '#ffcc00',
    letterSpacing: '2px',
};

const infoDescStyle: React.CSSProperties = {
    fontSize: '12px',
    opacity: 0.4,
    lineHeight: '1.4',
};

const footerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '40px',
    fontSize: '10px',
    opacity: 0.3,
    letterSpacing: '4px',
};
