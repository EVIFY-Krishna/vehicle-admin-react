import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            height: '48px',
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
        }}>
            &copy; {new Date().getFullYear()} EVIFY Admin. All rights reserved.
        </footer>
    );
};

export default Footer;
