# SilverFlag PC - E-Commerce Web3 Platform

SilverFlag PC là một nền tảng thương mại điện tử chuyên bán lẻ các thiết bị phần cứng máy tính và PC Build. Điểm nổi bật của nền tảng là sự kết hợp giữa mô hình mua sắm truyền thống và các công nghệ Web3 (Blockchain) đột phá như thanh toán qua Crypto (tiền điện tử), Smart Contract Escrow (Khóa quỹ đảm bảo) và bảo hành dưới dạng NFT (NFT Warranty).

## Tính năng chính

### 1. Dành cho Khách hàng (User)
- **Danh mục Sản phẩm:** Tìm kiếm, lọc sản phẩm theo các danh mục như CPU, Mainboard, VGA, RAM, SSD, Màn hình, Case & PSU, Tản nhiệt, Thiết bị ngoại vi, PC Gaming.
- **Giỏ hàng (Cart):** Quản lý các sản phẩm muốn mua, tính toán tổng tiền, và lưu trữ trạng thái người dùng (Persistent Cart qua LocalStorage).
- **Thanh toán Đa dạng:**
  - Thanh toán thông thường: COD (Thanh toán khi nhận hàng), Chuyển khoản ngân hàng (Upload ảnh minh chứng giao dịch).
  - Thanh toán Web3: Thanh toán bằng Crypto thông qua ví MetaMask. Giao dịch được bảo vệ bằng hợp đồng thông minh Escrow.
- **Bảo hành NFT (NFT Warranty):** Khách hàng mua các sản phẩm được hỗ trợ sẽ nhận được một NFT lưu trữ trên Blockchain, đại diện cho quyền lợi bảo hành vĩnh viễn không thể làm giả.
- **Quản lý Đơn hàng:** Xem lịch sử mua hàng, trạng thái vận chuyển, khả năng "Xác nhận nhận hàng" (chạy on-chain) và "Yêu cầu hoàn tiền" (Refund).

### 2. Dành cho Quản trị viên (Admin)
- **Bảng điều khiển (Dashboard):** Xem tổng quan doanh thu, số lượng khách hàng, đơn hàng mới nhất và các sản phẩm sắp hết hàng.
- **Quản lý Sản phẩm:**
  - Thêm, sửa, xóa thông tin sản phẩm, cấu hình giá VND và giá Crypto.
  - Upload ảnh trực tiếp lên hệ thống (`wwwroot/image/`).
  - Kích hoạt/Vô hiệu hóa tính năng bảo hành NFT cho từng sản phẩm.
- **Quản lý Đơn hàng:**
  - Cập nhật trạng thái xử lý, vận chuyển.
  - Duyệt ảnh minh chứng chuyển khoản của khách hàng.
  - **Hoàn tiền On-chain (MetaMask):** Phê duyệt các yêu cầu hoàn tiền cho các đơn hàng Crypto trực tiếp trên Dashboard bằng cách kết nối ví Admin và tương tác với Smart Contract.
- **Quản lý Người dùng:** Theo dõi khách hàng, số lượng đơn hàng đã đặt và số NFT bảo hành đang sở hữu.

## Công nghệ sử dụng (Tech Stack)

### Backend
- **Framework:** ASP.NET Core MVC (C#).
- **Cơ sở dữ liệu:** Entity Framework Core (Database tuỳ chọn SQL Server / SQLite tuỳ môi trường).
- Kiến trúc API (`CheckoutApiController`) cung cấp endpoint cho giao diện tĩnh.

### Frontend
- **Giao diện:** HTML5, CSS3, Vanilla JavaScript.
- Tương tác DOM trực tiếp, quản lý State (Local Storage) ở Client-side cho giỏ hàng.
- Web3: **Ethers.js v6** để kết nối MetaMask, ký giao dịch.

### Blockchain & Smart Contracts
- **Mạng lưới (Network):** Oasis Sapphire Testnet (`chainId: 0x5aff`).
- **Token:** Sử dụng TEST token cho thanh toán.
- **Escrow Contract:** Quản lý logic Deposit (đặt cọc), Confirm Delivery (xác nhận giao hàng) và Refund Buyer (hoàn tiền) bảo vệ quyền lợi cả hai bên mua/bán.

## Cài đặt và Chạy dự án

1. **Yêu cầu hệ thống:**
   - [.NET SDK 8.0](https://dotnet.microsoft.com/download) (hoặc tương ứng với project setup).
   - Trình duyệt cài sẵn tiện ích mở rộng [MetaMask](https://metamask.io/).

2. **Cấu hình CSDL:**
   - Chạy lệnh Update Database để áp dụng các Migration mới nhất:
     ```bash
     dotnet ef database update
     ```

3. **Chạy ứng dụng:**
   - Trong thư mục chứa file `.csproj`, chạy lệnh:
     ```bash
     dotnet watch run
     ```
   - Truy cập vào địa chỉ `http://localhost:<port>` trên trình duyệt.

4. **Tài khoản Admin (Mặc định nếu có):**
   - Truy cập `/Admin`
   - Đăng nhập qua session lưu trữ (xem cấu hình trong code hoặc test data).

## Cấu trúc thư mục đáng chú ý
- `Controllers/`: Chứa `AdminController` và `CheckoutApiController`.
- `Models/`: Các Entity của DB và DTO/ViewModel dùng cho giao diện.
- `Views/`: Chứa các file Razor `.cshtml` (bao gồm `Views/Admin/`).
- `wwwroot/`:
  - `js/demo3_4_enhanced.js`: Xử lý toàn bộ logic frontend cho người dùng (giỏ hàng, thanh toán Crypto, load NFT).
  - `js/admin_refund.js`: Tích hợp ví MetaMask riêng biệt dành cho trang Admin khi hoàn tiền.
  - `image/`: Nơi lưu trữ hình ảnh sản phẩm được upload lên hệ thống.

---
*SilverFlag PC mang đến trải nghiệm linh kiện máy tính tiên phong, dẫn đầu kỷ nguyên số.*
