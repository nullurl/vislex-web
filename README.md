# VisLex

VisLex 是一个面向 AI 生图工作流的视觉词典站点，用来浏览、搜索、组合常见 Prompt 关键词，并快速生成可复制的英文提示词。

当前仓库已经调整为适合静态托管的版本：

- 词典数据来自静态文件 `public/data/vislex.json`
- 组合历史保存在浏览器 `localStorage`
- 可部署到 Netlify、GitHub Pages 等静态站点平台

在线地址：

- Netlify: [https://vislex-web.netlify.app](https://vislex-web.netlify.app)
- GitHub Pages: [https://nullurl.github.io/vislex-web/](https://nullurl.github.io/vislex-web/)

## 功能概览

- 浏览词典分类与词条
- 按分类查看关键词、说明、标签和示例
- 全站搜索中英文关键词
- 将多个词条加入组合器并生成 Prompt
- 将组合结果保存到本地浏览器

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS

## 当前架构

当前线上版本以静态站点为主：

- 前端页面从 `public/data/vislex.json` 读取词典数据
- `src/hooks/useApi.ts` 负责静态数据读取和本地组合存储
- `server/` 目录和 SQLite 文件保留为早期数据来源与导出参考，不再是线上运行依赖

这意味着：

- Netlify 不需要 Node 服务端常驻运行
- GitHub Pages 可以直接托管 `docs/` 目录
- 线上“组合历史”是用户浏览器私有数据，不会跨设备同步

## 项目结构

```text
vislex-web/
├─ public/
│  ├─ data/vislex.json      # 静态词典数据
│  └─ favicon.svg
├─ src/
│  ├─ components/           # UI 组件
│  ├─ hooks/useApi.ts       # 数据读取与本地存储
│  ├─ pages/                # 页面视图
│  ├─ store/                # 组合器状态
│  ├─ App.tsx
│  └─ main.tsx
├─ server/                  # 早期 Fastify + SQLite 代码
├─ docs/                    # GitHub Pages 发布目录
├─ netlify.toml             # Netlify 构建配置
├─ vite.config.ts
└─ package.json
```

## 本地开发

安装依赖：

```bash
npm install
```

启动前端开发环境：

```bash
npm run dev:client
```

默认访问地址：

```text
http://localhost:5173
```

如果你只是维护当前静态站点，通常只需要 `npm run dev:client`。

## 可用脚本

```bash
npm run dev:client   # 启动 Vite 前端开发服务
npm run dev:server   # 启动旧版 Fastify 服务
npm run dev          # 同时启动前端 + 旧服务端
npm run build        # 生成 Netlify / 通用静态部署产物到 dist/
npm run build:github # 生成 GitHub Pages 使用的构建
npm run start        # 启动旧版 Node 服务
npm run seed         # 运行旧版 SQLite 数据种子脚本
npm run setup        # 旧版初始化流程
```

## 部署

### Netlify

仓库已包含 [netlify.toml](/Users/marvin/.cola/outputs/VisLex-·-AI-生图参数视觉词典/vislex-web/netlify.toml:1)：

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

部署要点：

- 构建命令使用 `npm run build`
- 发布目录使用 `dist`
- 已配置 SPA 回退到 `index.html`

如果 Netlify 页面出现“空白页”或引用了 `/src/main.tsx`，通常说明它发布了源码目录而不是 `dist`，检查 `publish` 配置即可。

### GitHub Pages

仓库采用 `main` 分支下的 `docs/` 目录作为发布源。

发布流程：

```bash
npm run build:github
mkdir -p docs
cp -R dist/. docs/
touch docs/.nojekyll
```

然后提交并推送 `docs/` 内容。

注意：

- GitHub Pages 部署在子路径 `/vislex-web/`
- 数据读取必须使用 `import.meta.env.BASE_URL`
- 如果把数据路径写死为 `/data/vislex.json`，页面会出现“数据为空”

## 数据来源

当前线上使用的词典文件：

- [public/data/vislex.json](/Users/marvin/.cola/outputs/VisLex-·-AI-生图参数视觉词典/vislex-web/public/data/vislex.json)

仓库里仍保留了旧版 SQLite 相关文件：

- `vislex.db`
- `server/db.ts`
- `server/seed.ts`

这些文件目前主要用于：

- 保留原始数据来源
- 后续重新导出静态 JSON
- 需要时恢复服务端版本

## 常见问题

### 1. 页面打开空白

优先检查：

- 静态托管平台是否发布了 `dist/`
- 首页是否引用了 `/assets/...` 而不是 `/src/main.tsx`
- 数据文件 `data/vislex.json` 是否可访问

### 2. 页面有壳子但没有数据

优先检查：

- `public/data/vislex.json` 是否已随构建一起发布
- 数据地址是否跟随 `import.meta.env.BASE_URL`
- GitHub Pages 是否错误使用了根路径 `/data/...`

### 3. 组合历史为什么换设备就没了

因为组合历史保存在浏览器本地 `localStorage`，不是服务端数据库。

## 后续建议

- 如果希望组合历史跨设备同步，可以重新接入后端或数据库服务
- 如果希望继续纯静态部署，建议把“数据导出脚本”正式沉淀为一个 npm script
- 如果未来继续维护 GitHub Pages，可把 `docs/` 的生成流程改成 GitHub Actions 自动化
