'use client';

import { X } from "lucide-react";
import AuthForm from "./AuthForm";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { Button } from "@/components/ui/button";

export default function AuthModal() {
  const { isOpen, closeModal, mode, userType, setUserType, setMode } = useAuthModal();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black bg-opacity-40 flex justify-center items-center layout">
      <div className="bg-white relative p-6 rounded w-full max-w-md">
        <X className="absolute top-3 right-3 cursor-pointer" onClick={closeModal} />
        <p className="text-lg font-semibold mb-4 text-center">
          {mode === 1 ? "Đăng nhập" : `Đăng ký ${userType === 1 ? "khách hàng" : "công ty"}`}
        </p>

        {mode === 2 && (
          <div className="flex mb-3">
            <Button className={`w-1/2 rounded-none ${userType === 1 ? 'bg-default-color' : 'bg-gray-200 hover:bg-white text-black'}`} onClick={() => setUserType(1)}>Khách hàng</Button>
            <Button className={`w-1/2 rounded-none ${userType === 2 ? 'bg-default-color' : 'bg-gray-200 hover:bg-white text-black'}`} onClick={() => setUserType(2)}>Công ty</Button>
          </div>
        )}

        <AuthForm
          mode={mode}
          userType={userType}
          onSuccess={() => {
            closeModal();
            window.location.reload();
          }}
          setMode={setMode}
        />
      </div>
    </div>
  );
}
