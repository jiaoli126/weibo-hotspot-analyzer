# 🚀 部署指南 - 一步步完成

## 📁 项目文件已准备完毕

所有文件已生成在：`C:\Users\79302\Documents\weibo-hotspot-github\`

```
weibo-hotspot-github/
├── .github/
│   └── workflows/
│       └── analyze-hotspot.yml          # GitHub Actions 配置
├── src/
│   ├── index.js                         # 主入口
│   ├── weibo-api.js                     # 微博 API 模块
│   ├── github-models-analyzer.js        # GitHub Models 分析模块
│   └── html-generator.js                # HTML 生成模块
├── package.json                         # 依赖配置
├── README.md                            # 项目说明
└── .gitignore                           # Git 忽略文件
```

---

## 🎯 接下来的步骤

### Step 1: 上传代码到 GitHub（5分钟）

#### 方式 A：使用 GitHub 网页界面（推荐）

1. **打开你的 GitHub 仓库**
   - 访问：https://github.com/YOUR_USERNAME/weibo-hotspot-analyzer
   - （如果还没有仓库，先创建一个）

2. **上传文件**
   - 点击 "Add file" → "Upload files"
   - 将 `C:\Users\79302\Documents\weibo-hotspot-github\` 目录下的所有文件拖拽到网页
   - **重要**：确保保持文件夹结构（`.github/workflows/` 和 `src/`）

3. **提交**
   - 在底部填写提交信息：`🎉 初始化项目（GitHub Models 免费版）`
   - 点击 "Commit changes"

#### 方式 B：使用 Git 命令行

```bash
# 1. 打开命令行，进入项目目录
cd C:\Users\79302\Documents\weibo-hotspot-github

# 2. 初始化 Git（如果还没有）
git init

# 3. 关联远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/weibo-hotspot-analyzer.git

# 4. 添加所有文件
git add .

# 5. 提交
git commit -m "🎉 初始化项目（GitHub Models 免费版）"

# 6. 推送到 GitHub
git branch -M main
git push -u origin main
```

---

### Step 2: 配置 GitHub Secrets（2分钟）

1. **进入仓库设置**
   - 打开你的 GitHub 仓库
   - 点击 `Settings` → `Secrets and variables` → `Actions`

2. **添加 Secret 1：WEIBO_API_URL**
   - 点击 `New repository secret`
   - Name: `WEIBO_API_URL`
   - Value: `https://weibo.com/ajax/side/hotSearch`
   - 点击 `Add secret`

3. **添加 Secret 2：WEIBO_API_HEADERS（可选但推荐）**
   - 点击 `New repository secret`
   - Name: `WEIBO_API_HEADERS`
   - Value: 
     ```json
     {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36", "Referer": "https://weibo.com"}
     ```
   - 点击 `Add secret`

**注意**：`GITHUB_TOKEN` 无需配置，GitHub Actions 会自动提供！

---

### Step 3: 启用 GitHub Actions（1分钟）

1. **进入 Actions 页面**
   - 在仓库页面点击 `Actions` 标签

2. **启用 Workflows**
   - 如果看到提示，点击 "I understand my workflows, go ahead and enable them"

3. **确认 Workflow 已显示**
   - 应该能看到 "微博热搜产品创意分析（GitHub Models 免费版）" workflow

---

### Step 4: 手动触发测试（2分钟）

1. **触发 Workflow**
   - 在 Actions 页面，点击 "微博热搜产品创意分析（GitHub Models 免费版）"
   - 点击右侧 `Run workflow` 按钮
   - 填写参数：
     - `max_hotspots`: `5`（测试时用小数量）
     - `ai_model`: `gpt-4o`
   - 点击绿色的 `Run workflow` 按钮

2. **查看执行进度**
   - 刷新页面，看到新的运行记录
   - 点击进入，查看实时日志
   - 等待执行完成（约 3-5 分钟）

3. **查看日志**
   - 展开每个 step 查看详细日志
   - 确认是否有错误

---

### Step 5: 下载并查看报告（1分钟）

1. **下载报告**
   - 执行完成后，滚动到页面底部
   - 在 `Artifacts` 区域找到 `weibo-hotspot-report-xxx`
   - 点击下载 ZIP 文件

2. **查看报告**
   - 解压 ZIP 文件
   - 用浏览器打开 `weibo_hotspot_analysis_xxxxxxxx.html`
   - 检查报告内容是否正常

---

## ✅ 验证成功标志

如果看到以下内容，说明部署成功：

1. ✅ Actions 页面显示绿色的 ✓
2. ✅ 日志中显示：
   ```
   ✅ 成功抓取 5 条热搜
   🤖 开始 AI 分析...
   ✅ HTML 报告已生成
   ✨ 任务完成！
   ```
3. ✅ Artifacts 中有可下载的 HTML 报告
4. ✅ HTML 报告包含热搜分析和产品创意

---

## 🔧 常见问题排查

### 问题 1：Actions 执行失败，显示 "npm ci" 错误

**原因**：缺少 `package-lock.json` 文件

**解决方案**：
1. 在本地项目目录运行：
   ```bash
   cd C:\Users\79302\Documents\weibo-hotspot-github
   npm install
   ```
2. 将生成的 `package-lock.json` 也上传到 GitHub

---

### 问题 2：微博 API 返回 403 Forbidden

**原因**：反爬虫机制

**解决方案**：
1. 确认已配置 `WEIBO_API_HEADERS` Secret
2. 检查 User-Agent 是否为真实浏览器
3. 尝试降低 `max_hotspots` 数量

---

### 问题 3：GitHub Models API 调用失败

**原因**：GITHUB_TOKEN 权限不足或 GitHub Models 服务问题

**解决方案**：
1. 检查仓库的 Workflow permissions：
   - Settings → Actions → General → Workflow permissions
   - 选择 "Read and write permissions"
2. 确认 GitHub Models 服务是否正常：
   - 访问 https://github.com/marketplace/models
3. 尝试切换模型（如改用 `gpt-4o-mini`）

---

### 问题 4：报告中没有产品创意

**原因**：AI 分析失败或超时

**解决方案**：
1. 查看日志中的错误信息
2. 减少 `max_hotspots` 数量（如改为 3）
3. 增加 workflow 的 `timeout-minutes`
4. 尝试切换模型

---

## 🎉 部署完成后

### 自动执行

- 默认每天早上 9:00（北京时间）自动执行
- 无需任何操作，GitHub Actions 会自动运行

### 查看历史报告

- 进入 `Actions` 页面
- 点击历史运行记录
- 下载对应的 Artifact

### 调整执行时间

编辑 `.github/workflows/analyze-hotspot.yml`：

```yaml
schedule:
  # 每天早上 6:00（北京时间）
  - cron: '0 22 * * *'  # UTC 22:00 = 北京时间 06:00
  
  # 每天中午 12:00（北京时间）
  - cron: '0 4 * * *'   # UTC 04:00 = 北京时间 12:00
  
  # 每 6 小时执行一次
  - cron: '0 */6 * * *'
```

---

## 📞 需要帮助？

如果遇到问题：

1. 查看 Actions 日志中的详细错误信息
2. 参考《配置检查清单.md》逐项检查
3. 参考《免费大模型替代方案.md》了解更多细节

---

## 🎯 下一步建议

1. ✅ 等待第一次定时执行（明天早上 9:00）
2. ✅ 查看生成的报告质量
3. ✅ 根据需要调整参数（模型、数量、频率）
4. ✅ 分享报告给团队或朋友

---

**祝你部署顺利！🎉**

如果一切正常，你现在拥有了一个完全免费的微博热搜自动分析系统！
