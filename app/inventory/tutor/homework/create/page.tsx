// frontend/app/inventory/tutor/homework/create/page.tsx

"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
// import apiClient from '@/utils/apiClient'; 
import apiClient from '../../utils/apiClient'; // 相対パスに修正済みの場合、こちらを使用

// 問題の型定義
interface Question {
  id: number;
  type: 'text' | 'choice'; // 'text' for free text, 'choice' for multiple choice
  questionText: string; // 問題文 (フロントエンド用)
  choices?: string[]; // 選択肢の場合のみ
}

const CreateHomeworkPage: React.FC = () => {
  const router = useRouter();
  const [homeworkTitle, setHomeworkTitle] = useState('');
  const [homeworkDueDate, setHomeworkDueDate] = useState('');
  const [questions, setQuestions] = useState<Question[]>([ // 複数の問題を管理する配列
    { id: 1, type: 'text', questionText: '' } // 最初の問題はデフォルトで文章形式
  ]);
  const [attachment, setAttachment] = useState<File | null>(null);

  // 問題を追加するハンドラ
  const handleAddQuestion = () => {
    const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
    setQuestions([...questions, { id: newId, type: 'text', questionText: '' }]);
  };

  // 問題を削除するハンドラ
  const handleRemoveQuestion = (id: number) => {
    if (questions.length <= 1) {
      alert('課題には少なくとも1つの問題が必要です。');
      return;
    }
    setQuestions(questions.filter(q => q.id !== id));
  };

  // 問題のタイプを変更するハンドラ
  const handleQuestionTypeChange = (id: number, type: 'text' | 'choice') => {
    setQuestions(questions.map(q =>
      q.id === id
        ? { ...q, type, choices: type === 'choice' ? ['', ''] : undefined } // タイプ変更時に選択肢を初期化
        : q
    ));
  };

  // 問題文を変更するハンドラ
  const handleQuestionTextChange = (id: number, text: string) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, questionText: text } : q
    ));
  };

  // 選択肢を追加するハンドラ
  const handleAddChoice = (questionId: number) => {
    setQuestions(questions.map(q =>
      q.id === questionId && q.choices
        ? { ...q, choices: [...q.choices, ''] }
        : q
    ));
  };

  // 選択肢のテキストを変更するハンドラ
  const handleChoiceChange = (questionId: number, choiceIndex: number, value: string) => {
    setQuestions(questions.map(q =>
      q.id === questionId && q.choices
        ? {
            ...q,
            choices: q.choices.map((c, i) => (i === choiceIndex ? value : c))
          }
        : q
    ));
  };

  // 選択肢を削除するハンドラ
  const handleRemoveChoice = (questionId: number, choiceIndex: number) => {
    setQuestions(questions.map(q =>
      q.id === questionId && q.choices && q.choices.length > 2
        ? {
            ...q,
            choices: q.choices.filter((_, i) => i !== choiceIndex)
          }
        : q
    ));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    } else {
      setAttachment(null);
    }
  };

  // handleSubmit 関数を async に変更し、API呼び出しロジックを追加
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called'); // デバッグ用

    if (!homeworkTitle || !homeworkDueDate) {
      alert('課題名と期限は必須です。');
      return;
    }

    // 問題の内容が空でないかチェック
    for (const q of questions) {
      if (!q.questionText.trim()) {
        alert('すべての問題文を入力してください。');
        return;
      }
      if (q.type === 'choice') {
        if (!q.choices || q.choices.length < 2 || q.choices.some(choice => !choice.trim())) {
          alert('選択肢形式の問題は2つ以上の選択肢をすべて入力してください。');
          return;
        }
      }
    }

    // バックエンドのシリアライザーのフィールド名に合わせる
    const formattedQuestions = questions.map(q => ({
      question_text: q.questionText, // フロントエンドの questionText を バックエンドの question_text にマッピング
      question_type: q.type,         // フロントエンドの type を バックエンドの question_type にマッピング
      choices: q.choices && q.choices.length > 0 ? q.choices : null, // 選択肢がない場合はnullにする
    }));

    // FormData を使用して、ファイルとJSONデータを送信
    const formData = new FormData();
    formData.append('title', homeworkTitle);
    formData.append('due_date', homeworkDueDate);
    formData.append('status', 'pending'); // 初期ステータスを設定 (バックエンドのデフォルトと一致)
    formData.append('questions', JSON.stringify(formattedQuestions)); // 問題リストをJSON文字列として追加

    if (attachment) {
      formData.append('attachment', attachment); // ファイルがあれば追加
    }

    // デバッグ用: FormData の内容をコンソールに出力
    // FormData は直接ログ出力すると中身が見えないため、以下のようにイテレートします。
    for (let pair of formData.entries()) {
        console.log(pair[0]+ ': ' + pair[1]);
    }

    try {
      // APIクライアントで POST リクエストを送信
      const response = await apiClient.post('/api/tutor/homeworks/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // FormData を送る際は必須
        },
      });

      console.log('課題登録成功:', response.data);
      alert('課題を登録しました！');

      // 登録後、課題管理画面に戻る
      router.push('/inventory/tutor/homework');
      router.refresh(); // 課題管理画面のデータを再フェッチして更新

    } catch (error: any) {
      console.error('課題の登録に失敗しました:', error);
      if (error.response) {
        // バックエンドからのエラーレスポンスがある場合
        console.error('APIレスポンスエラー:', error.response.data);
        alert(`課題の登録に失敗しました: ${JSON.stringify(error.response.data)}`);
      } else {
        // ネットワークエラーなど
        alert('課題の登録に失敗しました。ネットワーク接続を確認してください。');
      }
    }
  };

  return (
    <div className="container">
      <Header />
      <div className="main-content">
        <Sidebar />
        <main className="content-area">
          <section className="homework-creation-section">
            <h2>課題作成</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="homework-name">課題名:</label>
                <input
                  type="text"
                  id="homework-name"
                  value={homeworkTitle}
                  onChange={(e) => setHomeworkTitle(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="homework-due-date">期限:</label>
                <input
                  type="date"
                  id="homework-due-date"
                  value={homeworkDueDate}
                  onChange={(e) => setHomeworkDueDate(e.target.value)}
                  required
                />
              </div>

              <div className="questions-container">
                <h3>問題設定</h3>
                {questions.map((question, qIndex) => (
                  <div key={question.id} className="question-item-form">
                    <div className="question-header-form">
                      <h4>問題 {qIndex + 1}</h4>
                      {questions.length > 1 && (
                        <button type="button" onClick={() => handleRemoveQuestion(question.id)} className="remove-question-btn">
                          問題を削除
                        </button>
                      )}
                    </div>
                    <div className="input-group">
                      <label htmlFor={`question-text-${question.id}`}>問題文:</label>
                      <textarea
                        id={`question-text-${question.id}`}
                        rows={3}
                        value={question.questionText}
                        onChange={(e) => handleQuestionTextChange(question.id, e.target.value)}
                        placeholder="問題文をここに入力してください。"
                        required
                      ></textarea>
                    </div>

                    <div className="input-group">
                      <label>形式:</label>
                      <div>
                        <label>
                          <input
                            type="radio"
                            value="text"
                            checked={question.type === 'text'}
                            onChange={() => handleQuestionTypeChange(question.id, 'text')}
                          />
                          文章解答
                        </label>
                        <label style={{ marginLeft: '20px' }}>
                          <input
                            type="radio"
                            value="choice"
                            checked={question.type === 'choice'}
                            onChange={() => handleQuestionTypeChange(question.id, 'choice')}
                          />
                          選択肢
                        </label>
                      </div>
                    </div>

                    {question.type === 'choice' && (
                      <div className="input-group">
                        <label>選択肢:</label>
                        {question.choices?.map((choice, cIndex) => (
                          <div key={cIndex} className="choice-input-group">
                            <input
                              type="text"
                              value={choice}
                              onChange={(e) => handleChoiceChange(question.id, cIndex, e.target.value)}
                              placeholder={`選択肢 ${cIndex + 1}`}
                              required
                            />
                            {question.choices && question.choices.length > 2 && (
                              <button type="button" onClick={() => handleRemoveChoice(question.id, cIndex)} className="remove-choice-btn">
                                X
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={() => handleAddChoice(question.id)} className="add-choice-btn">
                          + 選択肢を追加
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddQuestion} className="add-question-btn">
                  + 問題を追加する
                </button>
              </div>

              <div className="input-group">
                <label htmlFor="homework-attachment">添付ファイル:</label>
                <input
                  type="file"
                  id="homework-attachment"
                  onChange={handleFileChange}
                />
                {attachment && <p className="selected-file-name">選択中のファイル: {attachment.name}</p>}
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">登録</button>
                <button type="button" className="cancel-btn" onClick={() => router.push('/inventory/tutor/homework')}>キャンセル</button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};

export default CreateHomeworkPage;