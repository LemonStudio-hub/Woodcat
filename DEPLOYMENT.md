# Woodcat 用户系统部署指南

## 概述

本文档说明如何部署 Woodcat 项目的用户系统，包括 Cloudflare Workers、D1 数据库和 Turnstile 验证的配置。

## 前置要求

1. Cloudflare 账号
2. Node.js 18+ 和 pnpm
3. Wrangler CLI

## 安装 Wrangler CLI

```bash
pnpm add -D wrangler
# 或全局安装
npm install -g wrangler
```

## 登录 Cloudflare

```bash
wrangler login
```

## 步骤 1: 创建 D1 数据库

```bash
# 创建 D1 数据库
wrangler d1 create woodcat_db
```

创建后，复制返回的 `database_id`，更新 `wrangler.toml` 中的 `database_id`。

## 步骤 2: 执行数据库迁移

```bash
# 执行 schema.sql 创建表结构
wrangler d1 execute woodcat_db --file=./schema.sql
```

## 步骤 3: 创建 KV 存储命名空间

```bash
# 创建 KV 命名空间
wrangler kv:namespace create SESSIONS
```

创建后，复制返回的 `id`，更新 `wrangler.toml` 中的 `id`。

## 步骤 4: 获取 Turnstile 密钥

1. 访问 [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. 创建新的站点
3. 复制 `Site Key`（前端使用）和 `Secret Key`（后端使用）

## 步骤 5: 配置环境变量

### 更新 wrangler.toml

将以下占位符替换为实际值：

```toml
[[d1_databases]]
binding = "DB"
database_name = "woodcat_db"
database_id = "your-actual-database-id"

[[kv_namespaces]]
binding = "SESSIONS"
id = "your-actual-kv-namespace-id"

[env.production.vars]
JWT_SECRET = "your-actual-jwt-secret"
TURNSTILE_SECRET_KEY = "your-actual-turnstile-secret-key"
```

### 创建前端环境变量文件

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

更新 `.env` 文件：

```env
VITE_API_BASE_URL=https://your-workers-subdomain.workers.dev
VITE_TURNSTILE_SITE_KEY=your-turnstile-site-key
```

### 生成 JWT 密钥

```bash
# 使用 OpenSSL 生成安全的随机密钥
openssl rand -base64 32
```

将生成的密钥用作 `JWT_SECRET`。

## 步骤 6: 安装依赖

```bash
pnpm install
```

## 步骤 7: 部署 Cloudflare Workers

```bash
# 部署到生产环境
wrangler deploy
```

部署完成后，你会获得一个 Workers URL，例如：
`https://woodcat.your-subdomain.workers.dev`

## 步骤 8: 构建和部署前端

```bash
# 构建前端
pnpm build

# 将 dist 目录部署到 Cloudflare Pages 或其他静态托管服务
# 或使用 wrangler pages 部署
wrangler pages deploy dist
```

## 步骤 9: 配置 CORS

如果前端和后端域名不同，需要在 API 中配置 CORS。已默认配置：

```typescript
// src/api/index.ts
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://your-domain.com'],
  credentials: true,
}));
```

更新为你的实际域名。

## 本地开发

### 启动本地开发服务器

```bash
# 启动前端开发服务器
pnpm dev

# 在另一个终端启动 Workers 本地开发服务器
wrangler dev
```

### 本地开发环境变量

创建 `.env.local` 文件：

```env
VITE_API_BASE_URL=http://localhost:8787
VITE_TURNSTILE_SITE_KEY=your-turnstile-site-key
```

## 安全建议

1. **使用强密码**：JWT 密钥应至少 32 字符的随机字符串
2. **启用 HTTPS**：生产环境必须使用 HTTPS
3. **定期更新依赖**：定期运行 `pnpm update`
4. **监控日志**：在 Cloudflare Dashboard 中监控 Workers 日志
5. **备份 D1 数据库**：定期导出 D1 数据库备份

## 测试

1. 访问前端应用
2. 点击"注册"按钮
3. 填写注册信息并完成 Turnstile 验证
4. 登录并验证 IP 和浏览器信息是否正确记录
5. 编辑个人资料并保存

## 故障排除

### Turnstile 验证失败

- 确认 Site Key 和 Secret Key 配置正确
- 检查浏览器控制台是否有错误
- 确认 Turnstile 脚本已正确加载

### D1 数据库错误

- 检查 `wrangler.toml` 中的 `database_id` 是否正确
- 确认数据库表结构已正确创建
- 查看 Cloudflare Dashboard 中的 D1 日志

### JWT 验证失败

- 确认 `JWT_SECRET` 配置正确
- 检查 token 是否过期（默认 30 天）
- 查看浏览器 localStorage 中的 token 是否正确

## 环境变量说明

### 前端环境变量（.env）

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_API_BASE_URL` | API 基础 URL | `https://woodcat.workers.dev` |
| `VITE_TURNSTILE_SITE_KEY` | Turnstile Site Key | `0x4AAAA...` |

### 后端环境变量（wrangler.toml）

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `JWT_SECRET` | JWT 签名密钥 | `your-secret-key` |
| `TURNSTILE_SECRET_KEY` | Turnstile Secret Key | `0x4AAAA...` |

## 数据库表结构

### users 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 用户 ID（主键） |
| email | TEXT | 邮箱（唯一） |
| username | TEXT | 用户名（唯一） |
| password_hash | TEXT | 密码哈希 |
| avatar_url | TEXT | 头像 URL |
| bio | TEXT | 个人简介 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |
| last_login_at | DATETIME | 最后登录时间 |
| last_login_ip | TEXT | 最后登录 IP |
| last_login_user_agent | TEXT | 最后登录 User-Agent |
| is_verified | BOOLEAN | 是否已验证 |

### sessions 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 会话 ID（主键） |
| user_id | INTEGER | 用户 ID |
| token | TEXT | 会话 token |
| ip_address | TEXT | IP 地址 |
| user_agent | TEXT | User-Agent |
| created_at | DATETIME | 创建时间 |
| expires_at | DATETIME | 过期时间 |

### login_history 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 历史 ID（主键） |
| user_id | INTEGER | 用户 ID |
| ip_address | TEXT | IP 地址 |
| user_agent | TEXT | User-Agent |
| login_at | DATETIME | 登录时间 |
| login_status | TEXT | 登录状态（success/failed） |

## 联系支持

如有问题，请查看：
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Cloudflare Turnstile 文档](https://developers.cloudflare.com/turnstile/)