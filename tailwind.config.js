/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {},
            animation: {
                'ping-slow': 'ping 1.2s linear infinite',
              }        
        },
    },
    plugins: [],
};
