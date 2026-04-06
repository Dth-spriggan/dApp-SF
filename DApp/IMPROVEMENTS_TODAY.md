# Bao Cao Cai Tien Web Demo SilverFlag PC

File lien quan:
- `D:\Code\thi2\demo3_4_enhanced.html`

## 1. Muc tieu chung

Da phat trien them chuc nang cho web demo theo huong:
- giu bo cuc va mau sac dac trung cua web cu
- tang tinh tuong tac de demo thuyet phuc hon
- bo sung hinh anh minh hoa va luong mua hang hop ly hon

## 2. Cac cai tien da hoan thanh

### 2.1. Catalog san pham

- Bien khu `San pham noi bat` tu danh sach tinh thanh khu co the loc that.
- Ho tro:
  - tim kiem san pham
  - loc theo tab
  - loc `Chi NFT`
  - loc `Dang giam gia`
  - sap xep theo gia/tieu de/noi bat
- Co trang thai rong khi khong co ket qua.
- Co nut `Xoa bo loc`.

### 2.2. The san pham

- Moi card san pham da co:
  - `Them vao gio`
  - `Yeu thich`
  - `Xem nhanh`
- Da sua layout de khi loc con it san pham thi card khong bi phong qua to.

### 2.3. Yeu thich

- Nut `Yeu thich` tren header da hoat dong that.
- Co badge dem so luong san pham da luu.
- Co modal danh sach yeu thich.
- Tu modal yeu thich co the:
  - xem nhanh
  - them vao gio

### 2.4. Xem nhanh san pham

- Them modal `Xem nhanh`.
- Hien:
  - ten
  - gia
  - gia cu
  - specs
  - tag NFT/giam gia
  - nut them vao gio
  - nut yeu thich

### 2.5. Dieu huong header va quick category

- Cac the nav va quick category da khong con chi toast.
- Khi bam se:
  - cuon den catalog
  - loc theo nhom lien quan
  - doi trang thai active tren nav

### 2.6. Mo rong san pham demo

- Ban dau chi co it nhom.
- Da bo sung them san pham demo cho cac nhom:
  - Man hinh
  - Case & PSU
  - Tan nhiet
  - Ngoai vi
  - PC Gaming
- Muc tieu: de cac the dieu huong chinh deu loc ra co san pham de demo.

### 2.7. Hinh anh demo

- Da tao bo hinh minh hoa demo cho san pham.
- Da tao them:
  - hero banner
  - banner phu
  - logo thuong hieu demo
- San pham demo hien uu tien render bang artwork inline de mo file local on dinh hon.

### 2.8. Toi uu hien thi

- Da sua loi truong hop mo file local bi mat hinh/fallback.
- Da sua loi bo loc cu lam catalog ve 0 san pham khi reload.
- Da giam nguy co vo layout khi chi con it san pham hien thi.

### 2.9. Luong gio hang va thanh toan

- Van cho phep:
  - xem san pham
  - them gio
  - sua gio
  - ap voucher
- Da chinh lai logic thanh toan:
  - chua dang nhap thi khong duoc checkout
  - bam `Dat hang ngay` se mo modal dang nhap
  - neu chua dang nhap ma tim cach vao checkout thi van bi chan khi xac nhan thanh toan

## 3. Cac nhom chuc nang hien da dung duoc tot cho demo

- Tim kiem
- Loc san pham
- Sap xep san pham
- Them gio hang
- Gio hang
- Yeu thich
- Xem nhanh
- Dang nhap / dang ky demo
- Chan checkout neu chua dang nhap
- Wallet modal
- Checkout co luong co ban

## 4. Cac phan van con co the lam tiep

### Muc uu tien cao

- Lam day them du lieu san pham cho moi nhom
- Bien brand logo thanh bo loc theo hang
- Bien cac banner thanh CTA that
- Them noi dung that hon cho `Web3 / NFT / DAO`

### Muc uu tien vua

- Them trang chi tiet san pham rieng
- Them so sanh san pham
- Them combo build PC
- Them du lieu tu JSON tach rieng khoi HTML

### Muc uu tien thap

- Hoan thien account page
- Footer link that
- Chinh sua noi dung/chu tieng Viet bi loi ma hoa o mot so doan cu

## 5. File va tai nguyen da tao them

- `D:\Code\thi2\demo3_4_enhanced.html`
- `D:\Code\thi2\ASSETS_GUIDE.md`
- `D:\Code\thi2\data\products.sample.json`
- `D:\Code\thi2\assets\images\products\...`
- `D:\Code\thi2\assets\images\banners\...`
- `D:\Code\thi2\assets\images\brands\...`

## 6. Ghi chu cho buoi lam viec tiep theo

Neu lam tiep, nen uu tien theo thu tu:

1. Brand logo filter
2. Banner CTA
3. Web3 / NFT / DAO modal
4. Them san pham cho tung nhom
5. Tach du lieu san pham ra file JSON that
