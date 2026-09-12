import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({

    plugins: [

        react(),

        VitePWA({

            registerType: "autoUpdate",

            devOptions: {
                enabled: true
            },

            manifest: {

                name: "Hospital Management System",

                short_name: "Hospital Management System",

                description:
                    "Hospital Management System",

                theme_color: "#0b5d3b",

                background_color: "#ffffff",

                display: "standalone",

                start_url: "/",

                icons: []

            }

        })

    ]

});