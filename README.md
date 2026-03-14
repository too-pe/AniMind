# AniMind 🎬✨

🌈 超萌AI智能动漫搜索应用，让你轻松找到心仪的番剧～
使用硅基流动AI服务，为你带来智能动漫推荐体验！

交流qq群:669272778 

## 🎁 功能特点

- 🤖 **智能搜索**：使用强大的硅基流动AI，理解你的搜索意图
- 📺 **精准推荐**：根据你的喜好，推荐最匹配的日本番剧
- 🎨 **精美展示**：展示番剧海报、评分、标签和热门评价
- 🔗 **多平台链接**：提供豆瓣、B站和TMDB的直达链接

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置API密钥

1. 创建 `.env.local` 文件（这个文件不会被提交到GitHub哦～）
2. 在文件中填入你的API密钥
3. （可选）配置TMDB API密钥，获取真实番剧海报

```
# 硅基流动API配置（必填）
SILICONFLOW_API_KEY=你的硅基流动密钥
SILICONFLOW_API_URL=https://api.siliconflow.cn/v1/chat/completions

# TMDB API配置（可选，用于获取真实番剧海报）
TMDB_API_KEY=你的TMDB密钥
TMDB_API_URL=https://api.themoviedb.org/3
```

### 🎟️ 获取TMDB API密钥

1. 访问 [TMDB官网](https://www.themoviedb.org/)，注册一个账号
2. 登录后，在用户设置中找到 "API" 选项
3. 申请API密钥，按照提示操作即可
4. 将获得的API密钥填入 `.env.local` 文件

如果不配置TMDB API密钥，系统会使用默认的可爱图片作为海报～

### 📱 获取硅基流动API密钥

1. 访问 [硅基流动平台](https://cloud.siliconflow.cn/)，注册并完成实名认证
2. 登录后，在左侧菜单找到 "API密钥" 选项
3. 创建并复制你的专属API密钥

### 3. 启动开发服务器

```bash
npm run dev
```

1. 打开浏览器访问 `http://localhost:3000`，开始你的动漫探索之旅～

## 🛠️ 技术栈

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- 硅基流动AI服务
- TMDB API

## 📁 项目结构

```
├── app/
│   ├── page.tsx          # 主页面组件，超萌的搜索界面
│   └── layout.tsx        # 页面布局
├── pages/
│   └── api/
│       └── search.ts     # API端点，调用AI进行搜索
├── public/               # 静态资源，包含可爱的像素风格图片
├── .env.local           # 本地环境变量，存储敏感API密钥
├── .env                 # 公共环境变量
└── package.json         # 项目依赖
```

## 🎨 设计风格

- 🖼️ 像素风格：可爱的像素猫咪搜索框，充满复古游戏感
- 🎭 二次元元素：萌系设计，色彩明快
- 📱 响应式布局：适配各种设备，随时随地都能使用

## 📝 注意事项

- 🔒 敏感信息：API密钥请妥善保管，不要泄露到GitHub上
- 📡 网络连接：使用时需要保持网络畅通，以便调用AI服务
- 🎯 搜索建议：尽量使用清晰的描述，比如"女主是反派的动漫"或"治愈系日常番"

## ⚠️ 免责声明

本项目搜索结果由AI提供，可能会出现一些AI暴论或完全不准确的内容，目前还在努力优化中\~本项目只做个人学习交流使用，不作为商业用途！

## 🤝 贡献

欢迎各位二次元小伙伴贡献代码，一起让AniMind变得更萌更强大～

## 📄 许可证

MIT License

***

✨ **AniMind** - 让动漫搜索变得更有趣！✨
