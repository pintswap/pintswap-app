/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            backgroundSize: {
                'size-200': '200% 200%',
              },
              backgroundPosition: {
                'pos-0': '0% 0%',
                'pos-100': '100% 100%',
              },
            screens: {
                '3xl': '1920px',
            },
            colors: {
                brand: {
                    dashboard: '#0a0a0a',
                    purple: '#4f46e5',
                    pink: '#f472b6',
                    blue: '#0ea5e9',
                },
            },
            maxWidth: {
                '8xl': '1920px',
            },
            width: {
                '8xl': '1920px',
            },
            animation: {
                'ping-slow': 'ping 1.2s linear infinite',
                'drip-1': 'drip cubic-bezier(0.86, 0.1, 0.8, 0.36) 3s infinite',
                'drip-2': 'drip cubic-bezier(0.96, 0.1, 0.8, 0.3) 3.2s infinite',
                'drip-3': 'drip cubic-bezier(0.96, 0.1, 0.8, 0.3) 3.3s infinite',
                'drip-4': 'drip cubic-bezier(0.96, 0.1, 0.8, 0.33) 3.4s infinite',
            },
            keyframes: {
                drip: {
                    '40%': {
                        background: '#f472b6',
                    },
                    '100%': {
                        transform: 'translateY(140vh)',
                        background: '#38bdf8',
                    },
                },
            },
            fontFamily: {
                titillium: ['Titillium Web', 'sans-serif'],
                'gothic-bold': ['Dela Gothic One', 'cursive'],
                gothic: ['Pathway Gothic One', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
