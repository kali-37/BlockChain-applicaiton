/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            backgroundImage: {
                ant: "url('./src/assets/img/ant.png')",
                coin: "url('./src/assets/img/coin.png')",
            },
        },
    },
    plugins: [],
};
