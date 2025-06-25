import { useEffect, useState } from "react";
import { useUser } from '@/contexts/UserContext';
import { comment, editComment, deleteComment, getComment } from "@/app/api/project";
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { API_BASE_URL } from "@/utilities/config";

interface Comment {
  _id: string;
  userId: number;
  content: string;
  createdAt: string;
  userName: string;
  avatar?: string;
}

interface CommentBoxProps {
  projectId: Number;
}

export default function CommentBox({ projectId }: CommentBoxProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const userInfor = useUser();
  const [visibleCount, setVisibleCount] = useState(10);
  const { openModal } = useAuthModal();

  useEffect(() => {
    const callGetComment = async () => {
      try {
        const res = await getComment(projectId)
        if (res.success) {
          setComments(res.comments || []);
        }
      } catch (error) {
      }
    }
    callGetComment()
  }, [projectId]);

  const handlePost = async () => {
    if (!userInfor) {
      openModal(1)
      return
    }
    if (!newComment.trim()) return;
  
    try {
      const res = await comment({ projectId, content: newComment });
      if (res.success) {
        setComments([res.comment, ...comments]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Lỗi khi gửi comment:", err);
    }
  }

  const handleUpdate = async (id: string) => {
    try {
      const res = await editComment({ id, content: editingContent });
      if (res.success) {
        setComments(
          comments.map((c) => (c._id === id ? { ...c, content: editingContent } : c))
        );
        setEditingId(null);
      }
    } catch (err) {
      console.error("Lỗi khi sửa comment:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xoá bình luận này?")) return;

    try {
      const res = await deleteComment(id);
      if (res.success) {
        setComments(comments.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error("Lỗi khi xoá comment:", err);
    }
  };

  return (
    <div className="mt-6 w-full border rounded-md pt-4 px-4 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Bình luận</h3>

      {/* Khung nhập bình luận */}
      <div className="mb-6">
        <textarea
          className="w-full border rounded p-2"
          placeholder="Nhập bình luận của bạn..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button
          className=""
          onClick={handlePost}
        >
          Gửi bình luận
        </Button>
      </div>

      {/* Danh sách bình luận */}
      <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
        {comments.slice(0, visibleCount).map((c) => (
          <div key={c._id} className="flex items-start gap-3 border-b pb-3">
            {c.avatar ?
              <img
                src={`${API_BASE_URL}${c.avatar}` || "/default-avatar.png"}
                className="w-10 h-10 rounded-full object-cover"
                alt="avatar"
              />
              : <User className="w-8 h-8" />
            }
            <div className="flex-1">
              {/* Khung tên + bình luận */}
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
                <p className="font-medium text-gray-800">{c.userName}</p>

                {editingId === c._id ? (
                  <>
                    <textarea
                      className="w-full border rounded mt-2 p-1"
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleUpdate(c._id)}
                        className="text-sm text-white bg-green-500 px-2 py-1 rounded cursor-pointer"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-sm text-gray-600 px-2 cursor-pointer"
                      >
                        Huỷ
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="mt-1 text-gray-800 whitespace-pre-line">{c.content}</p>
                )}
              </div>

              {/* Thời gian */}
              <p className="text-xs text-gray-500 mt-1">
                {new Date(c.createdAt).toLocaleString("vi-VN")}
              </p>

              {/* Sửa / Xoá */}
              {userInfor && userInfor.userId == c.userId && editingId !== c._id && (
                <div className="flex gap-2 mt-1 text-sm text-blue-600">
                  <button
                    className="cursor-pointer"
                    onClick={() => {
                      setEditingId(c._id);
                      setEditingContent(c.content);
                    }}
                  >
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(c._id)} className="text-red-500 cursor-pointer">
                    Xoá
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Nút xem thêm */}
      {comments.length > visibleCount && (
        <div className="text-center mt-4">
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="text-indigo-600 text-sm hover:underline"
          >
            Xem thêm bình luận
          </button>
        </div>
      )}
    </div>

  );
}
