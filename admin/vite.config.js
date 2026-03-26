import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import openInEditor from "vite-plugin-open-in-editor";
// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),react(),openInEditor({
    editor: "code" // for VS Code
  })],
  server: {
    port: 5174, 
  },
})
