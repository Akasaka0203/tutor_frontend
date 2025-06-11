// utils/axiosInstance.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000', // 環境変数から取得、なければデフォルト値
  withCredentials: true, // セッションクッキーなどのクレデンシャルを送信する
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;