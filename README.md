# Integrated Author - AI小说创作平台

整合了91Writing和Author两个优秀项目的AI小说创作平台。

## 特性

### AI全流程创作能力
- **大纲生成**：输入主题关键词，自动生成完整的小说大纲
- **章节续写**：根据大纲和前文内容，AI自动生成章节内容
- **智能润色**：支持语法润色、文风优化、情感增强等多种润色类型
- **写作建议**：AI分析文章并提供专业的写作建议

### RAG系统
- **向量化检索**：支持长篇巨著的上下文理解
- **语义搜索**：基于cosine相似度的智能匹配
- **个性化创作**：参考语料库风格进行创作

### 云同步
- **Firebase集成**：多设备实时同步
- **Google登录**：一键登录，数据云端存储
- **本地优先**：IndexedDB本地存储，离线可用

### 高级编辑器
- **Tiptap富文本编辑**：支持多种格式
- **实时预览**：所见即所得的编辑体验
- **章节管理**：左侧边栏管理所有章节
- **字数统计**：实时显示字数和阅读时间

### 多格式导出
- **纯文本**：通用文本格式
- **Markdown**：支持格式的轻量级标记语言
- **HTML**：网页格式
- **JSON**：结构化数据

### 备份恢复
- **手动备份**：随时保存项目快照
- **导入导出**：支持备份文件导入导出
- **自动管理**：保留最近10个备份

### 多AI模型支持
- **智谱AI**：GLM-4系列
- **DeepSeek**：DeepSeek Chat
- **OpenAI**：GPT-3.5/4系列
- **Google Gemini**：Gemini Pro/1.5

## 技术栈

- **框架**：Next.js 14
- **编辑器**：Tiptap
- **状态管理**：Zustand
- **样式**：Tailwind CSS
- **AI服务**：多供应商支持
- **云服务**：Firebase
- **存储**：IndexedDB + LocalStorage

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm start
```

## 使用指南

### 1. 配置AI服务

首次使用需要配置AI API密钥：
1. 点击左侧边栏的"设置"
2. 在"API设置"标签页中填入API密钥
3. 选择AI提供商和模型
4. 保存设置

### 2. 创建小说大纲

1. 打开右侧AI助手面板
2. 在"大纲"标签页输入小说主题/关键词
3. 点击"生成大纲"按钮
4. 等待AI生成完整大纲

### 3. 生成章节内容

1. 在左侧边栏点击"新建章节"
2. 选择章节标题
3. 打开右侧AI助手面板的"续写"标签
4. 点击"生成章节内容"
5. 等待AI生成内容
6. 点击"插入到编辑器"

### 4. 润色优化

1. 选中需要润色的内容
2. 在AI助手面板的"润色"标签页选择润色类型
3. 点击"一键润色"

### 5. 导出小说

1. 点击左侧边栏的"导出"
2. 选择导出格式（文本/Markdown/HTML/JSON）
3. 配置导出选项
4. 点击"导出"按钮

### 6. 备份恢复

1. 点击左侧边栏的"备份"
2. 查看现有备份列表
3. 点击"创建备份"保存当前进度
4. 如需恢复，选择备份并点击恢复按钮

## 项目结构

```
integrated-author/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── page.js       # 主页面
│   │   ├── layout.js     # 布局组件
│   │   └── globals.css   # 全局样式
│   ├── components/        # React组件
│   │   ├── Editor.jsx    # 富文本编辑器
│   │   ├── Sidebar.jsx   # 侧边栏
│   │   ├── AISidebar.jsx # AI助手面板
│   │   ├── SettingsModal.jsx
│   │   ├── LoginModal.jsx
│   │   ├── ExportModal.jsx
│   │   ├── BackupRestore.jsx
│   │   └── Toast.jsx
│   ├── lib/              # 工具函数
│   │   ├── utils.js      # 通用工具
│   │   ├── firebase.js   # Firebase配置
│   │   └── embeddings.js # RAG向量化
│   ├── services/         # 业务服务
│   │   ├── aiService.js # AI服务
│   │   └── projectIO.js  # 项目存储
│   └── store/            # 状态管理
│       └── useAppStore.js
├── public/               # 静态资源
├── package.json
├── next.config.js
└── tailwind.config.js
```

## 开发说明

### 添加新的AI模型

在 `src/services/aiService.js` 中的 `PROVIDER_CONFIGS` 对象添加新的提供商配置：

```javascript
your_provider: {
  baseURL: 'https://api.example.com',
  models: {
    'model-id': { name: '模型名称', maxTokens: 128000 }
  }
}
```

### 自定义导出格式

在 `src/components/ExportModal.jsx` 中添加新的导出格式处理逻辑。

### 添加新组件

1. 在 `src/components/` 目录创建新组件
2. 在 `src/store/useAppStore.js` 中添加相关状态
3. 在需要的页面中导入使用

## 许可证

MIT License

## 致谢

本项目整合自以下优秀开源项目：

- [91Writing](https://github.com/ponysb/91Writing) - AI小说创作工具
- [Author](https://github.com/yuanshijiloong/author) - 大模型应用框架
