# 微博热搜产品创意分析（GitHub Models 免费版）

[![GitHub Actions](https://github.com/YOUR_USERNAME/weibo-hotspot-analyzer/workflows/微博热搜产品创意分析/badge.svg)](https://github.com/YOUR_USERNAME/weibo-hotspot-analyzer/actions)

## 📖 项目简介

自动抓取微博热搜榜单，使用 **GitHub Models 免费 AI** 分析每个热点的背景信息，生成产品创意分析报告。

**核心特性**：
- ✅ **完全免费** - 使用 GitHub Models（GPT-4o、DeepSeek-R1 等）
- ✅ **零配置** - 直接使用 GitHub Token，无需额外 API Key
- ✅ **自动化** - 每天定时执行，自动生成报告
- ✅ **可视化** - 生成精美的 HTML 报告

## 🚀 快速开始

### 1. Fork 本仓库

点击右上角 "Fork" 按钮

### 2. 配置 Secrets

进入仓库 `Settings` → `Secrets and variables` → `Actions`，添加以下 Secrets：

#### 必需配置

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `WEIBO_API_URL` | 微博热搜 API 地址 | `https://weibo.com/ajax/side/hotSearch` |

#### 可选配置

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `WEIBO_API_HEADERS` | API 请求头（JSON） | `{"User-Agent": "Mozilla/5.0 ...", "Referer": "https://weibo.com"}` |

**注意**：`GITHUB_TOKEN` 无需配置，GitHub Actions 会自动提供！

### 3. 启用 Actions

1. 进入仓库的 `Actions` 页面
2. 点击 "I understand my workflows, go ahead and enable them"

### 4. 手动触发测试

1. 点击 `微博热搜产品创意分析` workflow
2. 点击 `Run workflow`
3. 填写参数（可选）：
   - `max_hotspots`: 10（测试时用小数量）
   - `ai_model`: gpt-4o
4. 点击 `Run workflow` 开始执行

### 5. 查看报告

执行完成后，在 `Actions` 页面底部的 `Artifacts` 区域下载生成的 HTML 报告。

## 📊 支持的 AI 模型

| 模型 | 能力 | 适用场景 |
|------|------|---------|
| **gpt-4o** | ⭐⭐⭐⭐⭐ | 最强分析能力（推荐） |
| **gpt-4o-mini** | ⭐⭐⭐ | 速度快，成本低 |
| **deepseek-r1** | ⭐⭐⭐⭐⭐ | 国产最强，推理能力强 |
| **llama-3-70b** | ⭐⭐⭐⭐ | 开源最强 |

## 🔧 本地开发

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/weibo-hotspot-analyzer.git
cd weibo-hotspot-analyzer

# 安装依赖
npm install

# 配置环境变量
export GITHUB_TOKEN="your_github_token"
export WEIBO_API_URL="https://weibo.com/ajax/side/hotSearch"
export MAX_HOTSPOTS="10"

# 运行分析
npm run analyze
```

## 📅 定时执行

默认配置为每天早上 9:00（北京时间）自动执行。

修改 `.github/workflows/analyze-hotspot.yml` 中的 cron 表达式可调整时间：

```yaml
schedule:
  - cron: '0 1 * * *'  # 每天 UTC 01:00 = 北京时间 09:00
```

## 💰 成本说明

- **GitHub Models**: 完全免费
- **GitHub Actions**: Public 仓库免费无限分钟数
- **总成本**: $0/月

## 📝 许可证

MIT License

## 🙏 致谢

- [GitHub Models](https://github.com/marketplace/models) - 免费 AI 模型服务
- [微博开放平台](https://open.weibo.com/) - 热搜数据来源
