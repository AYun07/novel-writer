# Integrated Author - 完整功能说明文档

## 🎉 项目简介

本项目是 **91Writing** 和 **Author** 两个项目的完全融合，整合了两个项目的所有功能特性。

## ✨ 完整功能清单

### 来自91Writing的功能
- ✅ AI全流程创作系统
- ✅ 大纲生成
- ✅ 章节续写（流式输出）
- ✅ 智能润色（6种类型）
- ✅ 写作建议和摘要
- ✅ 角色设定管理
- ✅ 世界观设定管理
- ✅ 小说信息管理
- ✅ 语料库系统

### 来自Author的功能
- ✅ Next.js 14架构
- ✅ RAG向量化检索
- ✅ Firebase云同步
- ✅ Function Calling联网搜索
- ✅ 多AI模型支持
- ✅ TipTap富文本编辑器
- ✅ 数据备份恢复
- ✅ 多格式导出

### 新增整合功能
- ✅ 模板管理系统
- ✅ 对话历史管理
- ✅ 统计面板
- ✅ 统一侧边栏导航
- ✅ 响应式设计

## 📁 组件说明

### 核心组件
- `Editor.jsx` - TipTap富文本编辑器（30+编辑工具）
- `Sidebar.jsx` - 统一导航侧边栏
- `AISidebar.jsx` - AI助手面板
- `StatsPanel.jsx` - 创作统计面板

### 管理组件
- `CharacterManager.jsx` - 角色设定管理
- `WorldSettingsManager.jsx` - 世界观设定管理
- `NovelInfoManager.jsx` - 小说信息管理
- `CorpusManager.jsx` - 语料库管理
- `TemplateManager.jsx` - 模板管理
- `SessionManager.jsx` - 对话历史管理

### 工具组件
- `SettingsModal.jsx` - API和系统设置
- `ExportModal.jsx` - 多格式导出
- `BackupRestore.jsx` - 数据备份恢复
- `LoginModal.jsx` - Google登录
- `Toast.jsx` - 通知提示

## 🔧 使用指南

### 快速开始

```bash
cd integrated-author
npm install
npm run dev
```

访问 http://localhost:3000

### 功能入口说明

所有功能通过左侧侧边栏访问：

1. **小说信息** - 管理小说基本信息
2. **章节列表** - 管理所有章节
3. **对话管理** - AI对话历史
4. **角色设定** - 完整角色档案管理
5. **世界观设定** - 8分类设定管理
6. **语料库** - 素材收集和分类
7. **模板管理** - 快速启动模板
8. **设置** - API和系统配置
9. **备份** - 数据备份恢复
10. **导出** - 多格式导出
11. **账号** - Google登录

### AI功能说明

右侧AI助手面板提供：

- **大纲生成** - 输入关键词自动生成大纲
- **章节续写** - 根据大纲和上下文生成内容
- **智能润色** - 6种润色类型：语法、文风、情感、逻辑、精简、扩写
- **AI对话** - 自由对话模式

### 模板系统

内置5个默认模板：

1. 标准小说大纲
2. 章节结构模板
3. 角色设定卡
4. 场景描写模板
5. 对话模板

## 📊 统计面板说明

实时显示：

- 总字数和阅读时间
- 完成章节数和完成率
- 角色、设定、语料数量
- 进度条可视化

## 🔌 AI服务支持

### 支持的模型提供商

| 提供商 | 支持模型 |
|--------|----------|
| 智谱AI | glm-4-flash, glm-4, glm-4-plus |
| DeepSeek | deepseek-chat, deepseek-coder |
| OpenAI | gpt-3.5-turbo, gpt-4 |
| Gemini | gemini-pro, gemini-1.5-pro |

## 📤 导出格式

- 纯文本（TXT）
- Markdown
- HTML
- JSON（完整数据）

## ☁️ Firebase云同步

配置步骤：

1. 在Firebase创建项目
2. 在 `.env.local` 配置环境变量
3. 使用Google登录启用云同步

## 📦 桌面应用构建

使用Electron打包：

```bash
npm run electron-dev    # 开发模式
npm run electron-build  # 打包应用
```

## 🎨 界面布局

```
┌─────────────────────────────────────────────────────────┐
│  左侧边栏 (288px)        │  主编辑区           │  AI助手 (320px)
│  - 小说信息               │  - 富文本编辑器       │  - 大纲生成
│  - 章节列表               │  - 字数统计           │  - 章节续写
│  - 对话管理               │  - 统计面板 (lg+)    │  - 智能润色
│  - 角色设定               │                      │  - AI对话
│  - 世界观设定             │                      │
│  - 语料库                 │                      │
│  - 模板管理               │                      │
│  - 设置/备份/导出/账号    │                      │
└─────────────────────────────────────────────────────────┘
```

## 🔄 数据持久化

使用两种存储机制：

1. **IndexedDB** - 本地持久化存储
2. **LocalStorage** - Zustand状态管理
3. **Firebase** - 云同步（可选）

## 🎯 写作工作流建议

1. 配置API密钥（设置面板）
2. 填写小说信息（小说信息）
3. 创建角色设定（角色管理）
4. 创建世界观设定（设定管理）
5. AI生成大纲（AI助手）
6. 创建章节（章节列表）
7. AI生成内容（AI助手）
8. 编辑和润色
9. 定期备份（备份面板）
10. 最终导出（导出面板）

## 🔧 技术栈

- **框架**: Next.js 14
- **编辑器**: TipTap
- **状态管理**: Zustand
- **样式**: Tailwind CSS
- **AI服务**: OpenAI兼容API
- **存储**: IndexedDB + Firebase
- **图标**: Lucide React

## 📄 项目文件结构

```
integrated-author/
├── src/
│   ├── app/
│   │   ├── page.js              # 主页面
│   │   ├── layout.js            # 布局
│   │   └── globals.css          # 全局样式
│   ├── components/              # 18个组件
│   │   ├── Editor.jsx
│   │   ├── Sidebar.jsx
│   │   ├── AISidebar.jsx
│   │   ├── StatsPanel.jsx
│   │   ├── CharacterManager.jsx
│   │   ├── WorldSettingsManager.jsx
│   │   ├── NovelInfoManager.jsx
│   │   ├── CorpusManager.jsx
│   │   ├── TemplateManager.jsx
│   │   ├── SessionManager.jsx
│   │   ├── SettingsModal.jsx
│   │   ├── ExportModal.jsx
│   │   ├── BackupRestore.jsx
│   │   ├── LoginModal.jsx
│   │   └── Toast.jsx
│   ├── services/
│   │   ├── aiService.js         # AI服务
│   │   └── projectIO.js         # 项目存储
│   ├── lib/
│   │   ├── utils.js
│   │   ├── firebase.js
│   │   └── embeddings.js
│   └── store/
│       └── useAppStore.js       # Zustand状态管理
├── electron/                     # 桌面端配置
├── public/
├── package.json
├── next.config.js
└── tailwind.config.js
```

## 🚀 未来扩展

可添加功能：

- 多语言支持
- 深色/浅色主题切换
- 协作编辑
- Git版本控制
- 发布工具
- 阅读器模式
- 移动应用

---

**享受创作！** ✨
