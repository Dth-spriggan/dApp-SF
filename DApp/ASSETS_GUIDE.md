# SilverFlag PC Asset Guide

Dung file nay de bo sung anh va du lieu cho ban web demo.

## Thu muc

- `assets/images/products/`: anh san pham
- `assets/images/banners/`: banner chinh va banner phu
- `assets/images/brands/`: logo thuong hieu
- `assets/icons/`: icon UI, wallet, NFT, DAO
- `data/`: du lieu JSON

## Anh san pham nen chuan bi

- `assets/images/products/rtx-4090.jpg`
- `assets/images/products/ryzen-7950x3d.jpg`
- `assets/images/products/rog-z790-apex.jpg`
- `assets/images/products/gskill-z5-64gb.jpg`
- `assets/images/products/samsung-990-pro-2tb.jpg`

## Banner nen chuan bi

- `assets/images/banners/hero-rtx5090.jpg`
- `assets/images/banners/banner-amd-9950x.jpg`
- `assets/images/banners/banner-ddr5-sale.jpg`
- `assets/images/banners/banner-crypto.jpg`

## Logo hang nen chuan bi

- `assets/images/brands/nvidia.svg`
- `assets/images/brands/amd.svg`
- `assets/images/brands/intel.svg`
- `assets/images/brands/asus.svg`
- `assets/images/brands/msi.svg`
- `assets/images/brands/corsair.svg`
- `assets/images/brands/gskill.svg`
- `assets/images/brands/samsung.svg`

## Dinh dang khuyen nghi

- Anh san pham: `jpg` hoac `webp`, ti le vuong
- Banner: `webp` hoac `jpg`, ngang 16:9 hoac 21:9
- Logo: uu tien `svg`, neu khong co thi `png`

## Viec ban can gui cho minh

1. Anh san pham that hoac bo demo.
2. Logo thuong hieu.
3. Danh sach san pham, it nhat gom:
   - `id`
   - `name`
   - `category`
   - `brand`
   - `price`
   - `oldPrice`
   - `image`
   - `specs`
   - `nft`
   - `warranty`

## Buoc tiep theo

Khi ban co file anh va du lieu, minh se:

1. Noi web sang `data/products.json`
2. Hien anh that thay cho emoji
3. Tach banner, logo, va product card sang du lieu dung lai duoc
