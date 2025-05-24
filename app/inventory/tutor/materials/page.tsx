"use client"; // クライアントコンポーネントとしてマーク

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

// 仮のデータ型定義
interface Material {
  id: number;
  fileName: string;
  uploadDate: string;
  uploader: string;
  fileSize: string;
  fileType: string;
  filePath: string; // ダウンロード用のパス (仮)
}

// 仮の資料データ
const initialMaterials: Material[] = [
  {
    id: 1,
    fileName: '数学_微積分入門.pdf',
    uploadDate: '2025-05-15 09:30',
    uploader: '講師A',
    fileSize: '2.5 MB',
    fileType: 'PDF',
    filePath: '/materials/sample_math_doc.pdf', // 仮のパス
  },
  {
    id: 2,
    fileName: '英語_文法要点.docx',
    uploadDate: '2025-05-18 14:00',
    uploader: '講師B',
    fileSize: '0.8 MB',
    fileType: 'DOCX',
    filePath: '/materials/sample_english_doc.docx', // 仮のパス
  },
  {
    id: 3,
    fileName: '物理_力学演習問題.zip',
    uploadDate: '2025-05-20 11:00',
    uploader: '講師A',
    fileSize: '5.1 MB',
    fileType: 'ZIP',
    filePath: '/materials/sample_physics_zip.zip', // 仮のパス
  },
];

const MaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('ファイルを選択してください。');
      return;
    }

    // ここでファイルのアップロード処理をシミュレート
    // 実際には FormData を使ってAPIにファイルを送信します
    console.log('アップロードするファイル:', selectedFile.name);

    const newMaterial: Material = {
      id: materials.length + 1, // 仮のID
      fileName: selectedFile.name,
      uploadDate: new Date().toLocaleString(),
      uploader: '現在のユーザー (仮)', // 実際にはログインユーザー名
      fileSize: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB', // MBに変換
      fileType: selectedFile.name.split('.').pop()?.toUpperCase() || '不明',
      filePath: `/materials/${selectedFile.name}`, // 仮のダウンロードパス
    };

    setMaterials([...materials, newMaterial]);
    setSelectedFile(null); // ファイル選択をクリア
    alert(`${selectedFile.name} をアップロードしました！ (実際にはAPI送信)`);
  };

  const handleDelete = (id: number) => {
    if (confirm('この資料を削除してもよろしいですか？')) {
      // 実際にはAPIを呼び出して削除
      setMaterials(materials.filter(material => material.id !== id));
      alert('資料を削除しました (実際にはAPI削除)');
    }
  };

  return (
    <div className="container">
      <Header />
      <div className="main-content">
        <Sidebar />
        <main className="content-area">
          <div className="materials-section">
            <h2>資料一覧</h2>

            <div className="upload-section">
              <h3>資料をアップロード</h3>
              <form onSubmit={handleUpload}>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <button type="submit" className="upload-btn" disabled={!selectedFile}>
                  アップロード
                </button>
                {selectedFile && <span className="selected-file-name">選択中のファイル: {selectedFile.name}</span>}
              </form>
            </div>

            {materials.length === 0 ? (
              <p>まだ資料はありません。</p>
            ) : (
              <div className="material-list">
                <table>
                  <thead>
                    <tr>
                      <th>ファイル名</th>
                      <th>種類</th>
                      <th>サイズ</th>
                      <th>アップロード日</th>
                      <th>アップロード者</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((material) => (
                      <tr key={material.id}>
                        <td>{material.fileName}</td>
                        <td>{material.fileType}</td>
                        <td>{material.fileSize}</td>
                        <td>{material.uploadDate}</td>
                        <td>{material.uploader}</td>
                        <td>
                          <a
                            href={material.filePath}
                            download // download属性でファイル名を指定
                            className="download-btn"
                          >
                            ダウンロード
                          </a>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(material.id)}
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MaterialsPage;