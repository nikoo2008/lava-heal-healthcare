import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Hardcoded specifically for standard local offline machine development
export default defineConfig({
  plugins: [react()],
  base: '/' // <-- Set this back to a single slash!
})