# Woca — 视频去字幕 & 画质增强平台

pnpm + lerna Monorepo，包含 PC Web、微信小程序、NestJS 后端三个子包。

## 目录结构

```
woca/
├── packages/
│   ├── web/          # PC端 React + Vite + Ant Design
│   ├── miniapp/      # 微信小程序 Taro + React
│   └── server/       # 后端 NestJS + TypeORM + Bull
├── scripts/
│   ├── init.sql      # 数据库初始化（套餐种子数据）
│   └── backup.sh     # MySQL 定时备份脚本
├── docker-compose.yml
├── .env.example
└── pnpm-workspace.yaml
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 填写微信 AppID/Secret、支付密钥、去字幕 API 密钥等
```

### 3. 本地开发

```bash
# 启动 MySQL + Redis
docker-compose up mysql redis -d

# 启动所有服务
pnpm dev
```

各服务地址：
- Web：http://localhost:3000
- Server：http://localhost:3001
- Swagger 文档：http://localhost:3001/docs

### 4. 生产部署（Docker）

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看日志
docker-compose logs -f server
```

## 数据库备份

```bash
# 手动备份
bash scripts/backup.sh

# 设置每天凌晨 2 点自动备份（crontab）
0 2 * * * /path/to/woca/scripts/backup.sh >> /var/log/woca-backup.log 2>&1
```

## 技术栈

| 层     | 技术                              |
|--------|-----------------------------------|
| PC端   | React 18 + Vite + Ant Design 5   |
| 小程序 | Taro 4 + React                   |
| 后端   | NestJS + TypeORM + Bull + Passport |
| 数据库 | MySQL 8 + Redis 7                |
| 部署   | Docker + Docker Compose + Nginx  |

## 第三方 API

去字幕能力调用外部 API，需在 `.env` 中填写 `SUBTITLE_SECRET_ID` 和 `SUBTITLE_SECRET_KEY`。
