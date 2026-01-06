/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#e8f7f4',
                    100: '#d1f0e9',
                    200: '#a3e1d3',
                    300: '#75d2bd',
                    400: '#4cad9a',
                    500: '#4cad9a',
                    600: '#3d9c8b',
                    700: '#2e7a6d',
                    800: '#1f5a50',
                    900: '#103b34',
                },
                dark: {
                    50: '#f5f5f5',
                    100: '#e5e5e5',
                    200: '#cccccc',
                    300: '#999999',
                    400: '#666666',
                    500: '#333333',
                    600: '#1a1a1a',
                    700: '#141414',
                    800: '#0d0d0d',
                    900: '#0a0a0a',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'glow': '0 0 20px rgba(76, 173, 154, 0.3)',
                'glow-lg': '0 0 40px rgba(76, 173, 154, 0.4)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'fade-in': 'fadeIn 0.3s ease-out',
            },
            keyframes: {
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
