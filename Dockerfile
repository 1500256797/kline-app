# 使用 Node.js 20 作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 安装 yarn
RUN apk add --no-cache yarn

# 复制 package.json 和 yarn.lock
COPY package.json yarn.lock ./

# 安装依赖
RUN yarn install --frozen-lockfile

# 复制所有源代码
COPY . .

# 构建应用
RUN yarn build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["yarn", "start"] 