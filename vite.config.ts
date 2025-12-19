import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Tải các biến môi trường từ file .env dựa trên mode (development/production)
  // Tham số thứ ba '' cho phép tải tất cả các biến kể cả không có tiền tố VITE_
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Base phải khớp với tên Repository của bạn trên GitHub để load file static đúng (css, js)
    base: '/PdfToWord/',

    plugins: [react()],

    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    // Định nghĩa các biến toàn cục để sử dụng trong code phía client
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        // Thiết lập @ trỏ thẳng vào thư mục src (phổ biến và tiện dụng hơn)
        '@': path.resolve(__dirname, './src'),
      },
    },

    build: {
      // Đảm bảo thư mục đầu ra là dist để khớp với file YAML bạn đã tạo
      outDir: 'dist',
      // Tối ưu hóa việc chia nhỏ file để load nhanh hơn
      chunkSizeWarningLimit: 1000,
    },
  };
});
