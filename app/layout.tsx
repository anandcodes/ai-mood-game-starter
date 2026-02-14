import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'AI Mood Game',
    description: 'A browser-based AI Mood Game',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
