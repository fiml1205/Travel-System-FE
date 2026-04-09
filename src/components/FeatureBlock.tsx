import { Globe, MessageCircle, Headset } from "lucide-react";

export default function FeatureBlock() {
  const features = [
    {
      icon: <Globe size={36} className="text-sky-500" />,
      title: "Trải nghiệm thực tế 360°",
      desc: "Dạo quanh điểm đến như thật với công nghệ ảnh 360 độ sắc nét.",
    },
    {
      icon: <MessageCircle size={36} className="text-emerald-500" />,
      title: "Chia sẻ & đánh giá",
      desc: "Tự do bình luận, chia sẻ cảm nhận và xem đánh giá thực tế từ cộng đồng.",
    },
    {
      icon: <Headset size={36} className="text-violet-500" />,
      title: "Hỗ trợ 24/7",
      desc: "Đội ngũ tư vấn chuyên nghiệp luôn sẵn sàng hỗ trợ mọi lúc, mọi nơi.",
    },
  ];

  return (
    <section className="py-12 bg-white dark:bg-slate-900 rounded-[8px]">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          Tại sao chọn <span className="text-default-color">Travel VR360</span>?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center bg-gray-50 p-6 rounded-2xl shadow hover:shadow-lg transition-all duration-300 dark:bg-slate-700"
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-center">{item.title}</h3>
              <p className="text-gray-600 text-center dark:text-[white]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
