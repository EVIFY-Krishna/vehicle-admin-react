import React, { createContext } from 'react';
import { ConfigProvider, theme } from 'antd';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Hardcoded to VoltFleet Light Theme
    return (
        <ThemeContext.Provider value={{ isDarkMode: false, toggleTheme: () => {} }}>
            <ConfigProvider
                theme={{
                    algorithm: theme.defaultAlgorithm,
                    token: {
                        colorPrimary: '#2563eb',
                        borderRadius: 6,
                        fontFamily: 'Inter, sans-serif',
                        colorBgContainer: '#ffffff',
                        colorBgLayout: '#f8fafc',
                    }
                }}
            >
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};
