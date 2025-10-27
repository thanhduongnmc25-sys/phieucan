
# Sử dụng một hệ điều hành Linux (Node 18)
FROM node:18-slim

# Cập nhật hệ điều hành và CÀI ĐẶT LIBREOFFICE
RUN apt-get update && apt-get install -y \
    libreoffice-calc \
    && rm -rf /var/lib/apt/lists/*

# Tạo thư mục làm việc
WORKDIR /app

# Sao chép file package.json và cài đặt thư viện
COPY package*.json ./
RUN npm install --omit=dev

# Sao chép toàn bộ code còn lại (server.js, template.xlsx, thư mục public)
COPY . .

# Render yêu cầu chạy web ở cổng 10000
EXPOSE 10000

# Lệnh khởi động máy chủ
CMD ["node", "server.js"]