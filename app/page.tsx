import Link from 'next/link';

export default function Home() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            gap: '20px'
        }}>
            <h1>AI Mood Game</h1>
            <Link href="/game" style={{
                padding: '10px 20px',
                background: 'white',
                color: 'black',
                textDecoration: 'none',
                borderRadius: '5px',
                fontWeight: 'bold'
            }}>
                Start Game
            </Link>
        </div>
    );
}
