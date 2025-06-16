import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { voteProject } from '@/app/api/project';
import { useUser } from '@/contexts/UserContext';
import { useAuthModal } from '@/contexts/AuthModalContext';

interface VoteStatsProps {
  vote: {
    averageRating: number;
    totalVotes: number;
    userVote: any;
    votes: { rating: number; count: number }[];
  };
  projectId: Number;
  projectOwnerId: Number;
}

export default function VoteStats({ vote, projectId, projectOwnerId }: VoteStatsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(!vote.userVote ? 0 : vote.userVote);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const userInfor = useUser();
  const { openModal } = useAuthModal();

  const submitVote = async () => {
    setSubmitting(true);
    try {
      try {
        await voteProject({
          projectId: projectId,
          rating: selected,
        });
        alert(`✅ Đánh giá thành công!`);
        setIsOpen(false)
      } catch (error) {
        console.error(error);
        alert('❌ Gửi thông báo thất bại. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error("Vote error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const checLogin = () => {
    if (!userInfor) {
      openModal(1)
      return
    }
    setIsOpen(true)
  }

  return (
    <div className="w-full border rounded-md mt-6 p-4 bg-gray-50">
      <div className="flex gap-8 select-none">
        {/* Cột trái */}
        <div className="text-center w-1/3">
          <p className="text-2xl font-bold">{vote.averageRating.toFixed(1)}/5</p>
          <div className="flex justify-center mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${i < Math.round(vote.averageRating) ? "text-yellow-400" : "text-gray-300"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09L5.636 12 1 7.91l6.059-.877L10 2l2.941 5.033L19 7.91 14.364 12l1.514 6.09z" />
              </svg>
            ))}
          </div>
          <p className="text-sm text-gray-600">{vote.totalVotes} đánh giá</p>
        </div>

        {/* Cột phải */}
        <div className="w-2/3 select-none">
          {vote.votes.map(({ rating, count }) => {
            const percent = vote.totalVotes ? (count / vote.totalVotes) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-2 mb-1">
                <span className="text-sm w-4">{rating}</span>
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09L5.636 12 1 7.91l6.059-.877L10 2l2.941 5.033L19 7.91 14.364 12l1.514 6.09z" />
                </svg>
                <div className="flex-1 bg-gray-200 h-2 rounded">
                  <div className="bg-yellow-400 h-2 rounded" style={{ width: `${percent}%` }}></div>
                </div>
                <span className="text-sm w-5 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {(!userInfor || (userInfor.userId !== projectOwnerId)) && (
        <div className="text-center mt-4">
          {
            (!vote.userVote
              ?
              <p className="text-sm mb-2">Bạn đánh giá sao cho tour này</p>
              :
              <div className='flex items-center text-sm mb-2 gap-0.5 justify-center'>
                <span className="">Bạn đã đánh giá {vote.userVote}</span>
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09L5.636 12 1 7.91l6.059-.877L10 2l2.941 5.033L19 7.91 14.364 12l1.514 6.09z" />
                </svg>
                <span>cho tour này</span>
              </div>
            )
          }

          <Button onClick={() => checLogin()} className="">
            Đánh giá ngay
          </Button>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[999] bg-black bg-opacity-40 flex justify-center items-center layout">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-3">Đánh giá tour</h2>
            <div className="flex justify-center gap-2 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  onClick={() => setSelected(i + 1)}
                  className={`w-8 h-8 cursor-pointer ${i < selected ? "text-yellow-400" : "text-gray-300"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09L5.636 12 1 7.91l6.059-.877L10 2l2.941 5.033L19 7.91 14.364 12l1.514 6.09z" />
                </svg>
              ))}
            </div>
            {!done ? (
              <div className="flex justify-between">
                <button onClick={() => setIsOpen(false)} className="px-4 py-2 rounded border">Hủy</button>
                <button
                  onClick={submitVote}
                  disabled={submitting || selected === 0}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-green-600">🎉 Cảm ơn bạn đã đánh giá!</p>
                <button onClick={() => setIsOpen(false)} className="mt-4 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">
                  Đóng
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
