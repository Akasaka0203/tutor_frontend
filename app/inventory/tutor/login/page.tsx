// app/inventory/tutor/login/page.tsx
'use client'; 

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '../utils/axiosInstance'; // パスはそのまま

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      // ★ここを修正: '/api/' は baseURL に含まれるため、ここでは不要です。
      // 'tutor/login/' に変更します。
      const response = await axiosInstance.post('/api/tutor/login/', { 
        username,
        password,
      });

      if (response.status === 200) {
        setMessage('ログイン成功！');
        router.push('/inventory/tutor/main');
      } else {
        setMessage('ログイン失敗: ' + (response.data.message || '不明なエラー'));
      }
    } catch (error: any) {
      if (error.response) {
        setMessage('ログイン失敗: ' + (error.response.data.message || error.response.statusText));
      } else if (error.request) {
        setMessage('ログイン失敗: サーバーからの応答がありません。ネットワークまたはサーバーの状態を確認してください。');
      } else {
        setMessage('ログイン失敗: ' + error.message);
      }
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>ログイン</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">ユーザー名(必須)</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">パスワード(必須)</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">ログイン</button>
        </form>
        {message && <p className="login-message">{message}</p>}
      </div>
    </div>
  );
};

export default LoginPage;