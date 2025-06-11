// frontend/utils/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000', // Django APIのURL
  withCredentials: true, // クッキー（セッションIDなど）を送信するために必要
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（CSRFトークンなどが必要な場合）
// 例: Django REST FrameworkとCSRFを併用する場合
apiClient.interceptors.request.use((config) => {
  // CSRFトークンをCookieから取得し、ヘッダーに設定するロジック
  // Next.jsの環境に応じて、document.cookieから取得する必要がある
  // 例:
  // const csrfToken = getCookie('csrftoken'); // 'js-cookie'などのライブラリを使用すると便利
  // if (csrfToken) {
  //   config.headers['X-CSRFToken'] = csrfToken;
  // }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// レスポンスインターセプター（認証エラーなどを処理する場合）
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 認証エラーの場合、ログインページにリダイレクトするなど
      console.error('認証エラー: リフレッシュトークン期限切れか無効です');
      // router.push('/login'); // Next.jsのrouterをインポートして使用
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// ヘルパー関数 (js-cookie ライブラリを使うとより簡単)
// function getCookie(name: string) {
//   let cookieValue = null;
//   if (document.cookie && document.cookie !== '') {
//     const cookies = document.cookie.split(';');
//     for (let i = 0; i < cookies.length; i++) {
//       const cookie = cookies[i].trim();
//       if (cookie.substring(0, name.length + 1) === (name + '=')) {
//         cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//         break;
//       }
//     }
//   }
//   return cookieValue;
// }