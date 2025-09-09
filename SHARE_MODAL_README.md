# Share Modal Component

## Mô tả
ShareModal là một component React cho phép người dùng chia sẻ thành tích leaderboard của họ lên mạng xã hội X (Twitter) hoặc tải xuống dưới dạng ảnh PNG.

## Tính năng
- 🖼️ **Tạo ảnh leaderboard**: Chuyển đổi thông tin trader thành một ảnh đẹp mắt
- 🐦 **Share lên X**: Tự động tạo tweet với nội dung và emoji phù hợp
- 💾 **Download ảnh**: Tải xuống ảnh PNG chất lượng cao (800x600px, 2x pixel ratio)
- 🎨 **Responsive design**: Tương thích với mọi kích thước màn hình
- 🏆 **Rank-based styling**: Màu sắc và emoji khác nhau dựa trên ranking

## Cách sử dụng

### 1. Import component
```tsx
import ShareModal from "./ShareModal";
```

### 2. Sử dụng trong component
```tsx
const [isShareModalOpen, setIsShareModalOpen] = useState(false);

// Trong JSX
<ShareModal
  isOpen={isShareModalOpen}
  onClose={() => setIsShareModalOpen(false)}
  traderData={traderData}
  timeframe={timeframe}
/>
```

### 3. Trigger modal
```tsx
<button onClick={() => setIsShareModalOpen(true)}>
  Share Achievement
</button>
```

## Props Interface
```tsx
interface ShareModalProps {
  isOpen: boolean;           // Trạng thái mở/đóng modal
  onClose: () => void;       // Function đóng modal
  traderData: {              // Dữ liệu trader
    address: string;
    rank: number;
    points: number;
    volume_usd: number;
    transactions: number;
    tokens: number;
  };
  timeframe: string;         // Khung thời gian ("1d", "7d", "30d", "all")
}
```

## Dependencies
- `html-to-image`: Chuyển đổi HTML element thành ảnh PNG
- `react`: Framework chính

## Styling
Component sử dụng Tailwind CSS với theme tối phù hợp với design system của Purro:
- Background: Gradient từ `#021919` đến `#081919`
- Border: `gray-700/30` với độ trong suốt
- Colors: Trắng cho text chính, xám cho text phụ

## Rank-based Features
- **Top 3**: 🥇🥈🥉 + màu vàng
- **Top 10**: 💎 + màu tím
- **Top 50**: 🚀 + màu xanh
- **Khác**: ⭐ + màu xám

## Tweet Template
```
{emoji} Just hit rank #{rank} on @PurroHQ leaderboard! 

📊 {points} points
💰 {volume} volume
🔄 {transactions} transactions

Ready to climb the ranks? 🐱

#Purro #DeFi #Hyperliquid
```

## Vị trí tích hợp
Component đã được tích hợp vào:
- `TraderDetailReact.tsx` - Trang chi tiết trader
- Nút "Share" nhỏ trong phần thông tin trader
- Nút "Share Achievement" lớn dưới stats overview
