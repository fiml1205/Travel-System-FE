'use client';

import { useState } from 'react';

export default function Upload360Form() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fileInput = e.currentTarget.elements.namedItem('image') as HTMLInputElement;
    if (!fileInput?.files?.length) return;

    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('projectID', '1');

    setUploading(true);
    try {
      const res = await fetch('/api/convert360-cube', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        alert('✅ Xử lý thành công!');
        // Có thể redirect hoặc preview kết quả tại đây
      } else {
        alert('❌ Lỗi khi xử lý ảnh!');
      }
    } catch (error) {
      console.error(error);
      alert('❌ Đã xảy ra lỗi');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input type="file" name="image" accept="image/*" required className="mb-4" />
      <br />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={uploading}
      >
        {uploading ? 'Đang xử lý...' : 'Chuyển đổi'}
      </button>
    </form>
  );
}
