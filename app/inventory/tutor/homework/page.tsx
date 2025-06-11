// frontend/app/inventory/tutor/homework/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '../utils/apiClient'; // APIクライアントをインポート

// バックエンドのHomeworkモデルに合わせたデータ型
interface Homework {
  id: number;
  title: string;
  due_date: string; // dueDate を due_date に変更
  status: 'pending' | 'submitted' | 'completed'; // ステータスをバックエンドの値に合わせる
  tutor: number; // 講師のID
  attachment?: string | null; // 添付ファイルのURLまたはパス
  attachment_name?: string | null; // 添付ファイル名
  created_at: string;
  updated_at: string;
  questions?: any[]; // 課題作成時に使用されるが、リスト表示では必須ではない
}

const HomeworkPage: React.FC = () => {
  const router = useRouter();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // コンポーネントマウント時に課題データをフェッチ
  useEffect(() => {
    const fetchHomeworks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get('/api/tutor/homeworks/'); // APIエンドポイントのURL
        setHomeworks(response.data);
      } catch (err) {
        console.error('課題の取得中にエラーが発生しました:', err);
        setError('課題の読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeworks();
  }, []); // 空の依存配列で初回マウント時のみ実行

  const handleCreateHomework = () => {
    router.push('/inventory/tutor/homework/create');
  };

  const handleDeleteHomework = async (id: number) => {
    if (confirm('この課題を削除してもよろしいですか？')) {
      try {
        await apiClient.delete(`/api/tutor/homeworks/${id}/`); // APIエンドポイントのURL
        setHomeworks(prevHomeworks => prevHomeworks.filter(homework => homework.id !== id));
        alert('課題を削除しました！');
      } catch (err) {
        console.error(`課題ID: ${id} の削除中にエラーが発生しました:`, err);
        alert('課題の削除に失敗しました。');
        setError('課題の削除に失敗しました。');
      }
    }
  };

  // 編集機能は、将来的に課題詳細ページでの編集に繋がる可能性もあるため、今回はアラートのまま
  // `handleEditHomework` 関数は、ボタンが削除されるため不要になりますが、
  // もし将来的に再利用する可能性があれば残しておいても構いません。
  const handleEditHomework = (id: number) => {
    alert(`課題ID: ${id} を編集します（この機能はまだ実装されていません）。`);
  };

  // ステータス表示を日本語に変換するヘルパー関数
  const getStatusDisplayName = (status: Homework['status']): string => {
    switch (status) {
      case 'pending':
        return '未提出';
      case 'submitted':
        return '提出済み';
      case 'completed':
        return '完了';
      default:
        return '不明';
    }
  };

  if (loading) {
    return (
      <div className="container">
        <Header />
        <div className="main-content">
          <Sidebar />
          <main className="content-area">
            <p>課題を読み込み中...</p>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <Header />
        <div className="main-content">
          <Sidebar />
          <main className="content-area">
            <p className="error-message">{error}</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Header />
      <div className="main-content">
        <Sidebar />
        <main className="content-area">
          <section className="homework-section">
            <h2>課題管理</h2>
            <button className="create-homework-btn" onClick={handleCreateHomework}>
              + 課題を作成する
            </button>

            <div className="homework-list">
              {homeworks.length === 0 ? (
                <p>課題はまだありません。</p>
              ) : (
                <ul>
                  {homeworks.map(homework => (
                    <li key={homework.id} className="homework-item">
                      {/* Linkコンポーネントで課題詳細ページへのリンクを設定 */}
                      <Link href={`/inventory/tutor/homework/${homework.id}`} className="homework-item-link">
                        <div className="homework-item-content">
                          <h3>{homework.title}</h3>
                          <p className="homework-meta">
                            提出期限: {homework.due_date} | ステータス: {getStatusDisplayName(homework.status)}
                          </p>
                        </div>
                      </Link>
                      <div className="homework-actions">
                        <button className="delete-btn" onClick={() => handleDeleteHomework(homework.id)}>削除</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default HomeworkPage;