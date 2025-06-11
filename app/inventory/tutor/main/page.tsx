// app/inventory/tutor/main/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // useRouterは使いますが、認証リダイレクトは無効化します
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Calendar from '@/components/Calendar';
import axiosInstance from '../utils/axiosInstance'; // axiosInstanceのパスに合わせて調整

// イベントのデータ型定義（バックエンドのモデルに合わせるが、フロントエンドの表示用にstart/endを使用）
interface CalendarEvent {
  id: number;
  title: string;
  start: Date; // Dateオブジェクトとして扱う（フロントエンド表示用）
  end: Date;   // Dateオブジェクトとして扱う（フロントエンド表示用）
  description?: string;
  color?: string;
}

// 2025年の祝日データ（これはローカルで持つ）
const holidays2025 = {
  "2025-01-01": "元日",
  "2025-01-13": "成人の日",
  "2025-02-11": "建国記念の日",
  "2025-02-23": "天皇誕生日",
  "2025-03-20": "春分の日",
  "2025-04-29": "昭和の日",
  "2025-05-03": "憲法記念日",
  "2025-05-04": "みどりの日",
  "2025-05-05": "こどもの日",
  "2025-07-21": "海の日",
  "2025-08-11": "山の日",
  "2025-09-15": "敬老の日",
  "2025-09-23": "秋分の日",
  "2025-10-13": "スポーツの日",
  "2025-11-03": "文化の日",
  "2025-11-23": "勤労感謝の日",
};

const MainPage: React.FC = () => {
  const router = useRouter(); 

  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]); 
  const [loading, setLoading] = useState(true); 
  // const [error, setError] = useState<string | null>(null); // エラー状態の管理を完全に削除（表示しないため）

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStartDate, setNewEventStartDate] = useState('');
  const [newEventStartTime, setNewEventStartTime] = useState('');
  const [newEventEndDate, setNewEventEndDate] = useState('');
  const [newEventEndTime, setNewEventEndTime] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventColor, setNewEventColor] = useState('#FFDDC1');

  // イベントデータのフェッチ
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    // setError(null); // エラー状態の管理を完全に削除

    const token = localStorage.getItem('authToken'); 
    // トークンチェックとリダイレクトのロジックを完全に削除
    console.log('MainPage (Auth & Error Ignored): fetchEvents called. Token from localStorage:', token ? 'Exists' : 'Does NOT exist');

    try {
      console.log('MainPage: Attempting to fetch events with token.');
      // イベントAPIエンドポイントは /api/tutor/events/ を想定
      const response = await axiosInstance.get('/api/tutor/lesson-schedules/');
      // バックエンドからのデータをフロントエンドのCalendarEvent型に変換
      const fetchedEvents: CalendarEvent[] = response.data.map((schedule: any) => ({
        id: schedule.id,
        title: schedule.title,
        start: new Date(schedule.start_time), // バックエンドの 'start_time' を使用
        end: schedule.end_time ? new Date(schedule.end_time) : undefined, // バックエンドの 'end_time' を使用
        description: schedule.description,
        color: schedule.color,
      }));
      setEvents(fetchedEvents);
      console.log('MainPage: Events fetched successfully.');
    } catch (err: any) {
      console.error('MainPage: イベントの取得に失敗しました:', err);
      // エラーメッセージの設定も完全に削除
      console.log('MainPage: イベント読み込みエラーが発生しましたが、無視して続行します。');
    } finally {
      setLoading(false);
      console.log('MainPage: fetchEvents finished.');
    }
  }, []); 

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]); 

  const handlePrevMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // 「日程を追加する」ボタンクリック
  const handleAddEventClick = () => {
    setSelectedEvent(null);
    setNewEventTitle('');
    setNewEventStartDate('');
    setNewEventStartTime('');
    setNewEventEndDate('');
    setNewEventEndTime('');
    setNewEventDescription('');
    setNewEventColor('#FFDDC1');
    setIsEventModalOpen(true);
  };

  // イベントクリック時（詳細/編集用）
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setNewEventTitle(event.title);
    setNewEventStartDate(event.start.toISOString().split('T')[0]);
    setNewEventStartTime(event.start.toTimeString().substring(0, 5));
    if (event.end) {
        setNewEventEndDate(event.end.toISOString().split('T')[0]);
        setNewEventEndTime(event.end.toTimeString().substring(0, 5));
    } else {
        // 終了日時がない場合、日付と時刻をクリア
        setNewEventEndDate('');
        setNewEventEndTime('');
    }
    setNewEventDescription(event.description || '');
    setNewEventColor(event.color || '#FFDDC1');
    setIsEventModalOpen(true);
  };

  // イベント追加/更新フォームの送信
  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEventTitle || !newEventStartDate || !newEventStartTime) {
      alert('タイトル、開始日、開始時間を入力してください。');
      return;
    }

    const startDateTime = new Date(`${newEventStartDate}T${newEventStartTime}`);
    let endDateTime: Date | undefined;
    if (newEventEndDate && newEventEndTime) {
      endDateTime = new Date(`${newEventEndDate}T${newEventEndTime}`);
      if (endDateTime < startDateTime) {
          alert('終了時間は開始時間より後に設定してください。');
          return;
      }
    } else {
        // 終了日時がない場合は、開始日時から1時間後をデフォルトとする
        endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
    }

    // バックエンドのフィールド名に合わせて 'start_time' と 'end_time' を使用
    const eventDataToSend = {
      title: newEventTitle,
      start_time: startDateTime.toISOString(), // ★ ここを修正
      end_time: endDateTime ? endDateTime.toISOString() : null, // ★ ここを修正
      description: newEventDescription,
      color: newEventColor,
    };

    try {
      if (selectedEvent) {
        // イベント更新
        await axiosInstance.put(`/api/tutor/lesson-schedules/${selectedEvent.id}/`, eventDataToSend);
        alert('イベントを更新しました！');
      } else {
        // イベント追加
        await axiosInstance.post('/api/tutor/lesson-schedules/', eventDataToSend);
        alert('イベントを追加しました！');
      }
      setIsEventModalOpen(false);
      await fetchEvents(); // 成功したらイベントを再フェッチしてUIを更新
    } catch (err: any) {
      console.error('MainPage: イベントの保存に失敗しました:', err); 
      // エラーメッセージの設定を完全に削除
      console.log('MainPage: イベント保存エラーが発生しましたが、無視して続行します。');
    }
  };

  // イベント削除
  const handleDeleteEvent = async () => {
    if (selectedEvent && confirm('このイベントを削除してもよろしいですか？')) {
      try {
        await axiosInstance.delete(`/api/tutor/lesson-schedules/${selectedEvent.id}/`);
        alert('イベントを削除しました！');
        setIsEventModalOpen(false);
        setSelectedEvent(null);
        await fetchEvents(); // 成功したらイベントを再フェッチしてUIを更新
      } catch (err: any) {
        console.error('MainPage: イベントの削除に失敗しました:', err); 
        // エラーメッセージの設定を完全に削除
        console.log('MainPage: イベント削除エラーが発生しましたが、無視して続行します。');
      }
    }
  };

  if (loading) {
    return <div className="loading-container">読み込み中...</div>;
  }

  // エラー表示の条件を完全に削除
  // if (error) {
  //   return <div className="error-container">エラー: {error}</div>;
  // }

  return (
    <div className="container">
      <Header />
      <div className="main-content">
        <Sidebar />
        <main className="content-area">
          <div className="calendar-section">
            <div className="calendar-controls">
              <button onClick={handlePrevMonth}>&lt; 前の月</button>
              <h2>{currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月</h2>
              <button onClick={handleNextMonth}>次の月 &gt;</button>
            </div>
            <button className="add-event-btn" onClick={handleAddEventClick}>
              + 日程を追加する
            </button>
            <Calendar
              currentDate={currentDate}
              events={events.filter(event =>
                event.start.getFullYear() === currentDate.getFullYear() &&
                event.start.getMonth() === currentDate.getMonth()
              )}
              holidays={holidays2025}
              onEventClick={handleEventClick}
            />
          </div>

          {/* イベント追加/詳細モーダル */}
          {isEventModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>{selectedEvent ? 'イベントを編集' : '新しい日程を追加'}</h3>
                <form onSubmit={handleSubmitEvent}>
                  <div className="input-group">
                    <label htmlFor="event-title">タイトル:</label>
                    <input
                      type="text"
                      id="event-title"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="event-start-date">開始日時:</label>
                    <input
                      type="date"
                      id="event-start-date"
                      value={newEventStartDate}
                      onChange={(e) => setNewEventStartDate(e.target.value)}
                      required
                    />
                    <input
                      type="time"
                      id="event-start-time"
                      value={newEventStartTime}
                      onChange={(e) => setNewEventStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="event-end-date">終了日時 (任意):</label>
                    <input
                      type="date"
                      id="event-end-date"
                      value={newEventEndDate}
                      onChange={(e) => setNewEventEndDate(e.target.value)}
                    />
                    <input
                      type="time"
                      id="event-end-time"
                      value={newEventEndTime}
                      onChange={(e) => setNewEventEndTime(e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="event-description">説明:</label>
                    <textarea
                      id="event-description"
                      rows={3}
                      value={newEventDescription}
                      onChange={(e) => setNewEventDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="input-group">
                    <label htmlFor="event-color">色:</label>
                    <input
                      type="color"
                      id="event-color"
                      value={newEventColor}
                      onChange={(e) => setNewEventColor(e.target.value)}
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="submit-btn">
                      {selectedEvent ? '更新する' : '追加する'}
                    </button>
                    {selectedEvent && (
                      <button type="button" className="delete-btn" onClick={handleDeleteEvent}>
                        削除する
                      </button>
                    )}
                    <button type="button" className="cancel-btn" onClick={() => setIsEventModalOpen(false)}>
                      キャンセル
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MainPage;