// app/inventory/tutor/utils/axiosInstance.ts
import axios from 'axios';

// APIのベースURLを設定。Next.jsの環境変数を使用するか、デフォルトでバックエンドのルートURLを指定。
// ★ここを修正: '/api' を削除します。
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'; 

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // 5秒のタイムアウト
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター (例: 認証トークンの付与)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // localStorageからトークンを取得
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Authorizationヘッダーにトークンを追加
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター (例: エラーハンドリング)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // 認証エラーの場合、ログインページにリダイレクトなど
      console.error('認証エラー: トークンの期限切れまたは無効');
      // 例: window.location.href = '/login'; // 必要に応じて有効化
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;