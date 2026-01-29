import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 生成 HTML 报告
 * @param {Array} analyzedHotspots - 分析后的热搜数据
 * @param {string} outputPath - 输出文件路径
 */
export async function generateHTMLReport(analyzedHotspots, outputPath) {
  const timestamp = new Date().toLocaleString('zh-CN', { 
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  // 按评分分类
  const excellentIdeas = analyzedHotspots.filter(h => h.compositeScore >= 80);
  const goodIdeas = analyzedHotspots.filter(h => h.compositeScore >= 60 && h.compositeScore < 80);
  const normalIdeas = analyzedHotspots.filter(h => h.compositeScore < 60);

  // 按评分排序
  const sortedHotspots = [...analyzedHotspots].sort((a, b) => b.compositeScore - a.compositeScore);

  // 生成热点卡片 HTML
  const hotspotsHTML = sortedHotspots.map(hotspot => generateHotspotCard(hotspot)).join('\n');

  // 计算总创意数
  const totalIdeas = analyzedHotspots.reduce((sum, h) => 
    sum + (h.analysis?.productIdeas?.length || 0), 0
  );

  // 读取 HTML 模板
  const templatePath = path.join(__dirname, 'templates', 'report-template.html');
  let template;
  
  try {
    template = await fs.readFile(templatePath, 'utf-8');
  } catch (error) {
    // 如果模板文件不存在，使用内嵌模板
    template = getDefaultTemplate();
  }

  // 替换模板变量
  const html = template
    .replace(/{GENERATION_TIME}/g, timestamp)
    .replace(/{TOTAL_HOTSPOTS}/g, analyzedHotspots.length)
    .replace(/{TOTAL_IDEAS}/g, totalIdeas)
    .replace(/{EXCELLENT_COUNT}/g, excellentIdeas.length)
    .replace(/{GOOD_COUNT}/g, goodIdeas.length)
    .replace(/{HOTSPOT_CARDS}/g, hotspotsHTML);

  // 写入文件
  await fs.writeFile(outputPath, html, 'utf-8');
  console.log(`✅ HTML 报告已生成: ${outputPath}`);
}

/**
 * 生成单个热点卡片 HTML
 */
function generateHotspotCard(hotspot) {
  const ratingClass = hotspot.compositeScore >= 80 ? 'excellent' : 
                      hotspot.compositeScore >= 60 ? 'good' : 'normal';
  
  // 生成事件时间线
  const timelineHTML = (hotspot.analysis?.eventTimeline || [])
    .map(item => `
      <div class="timeline-item">
        <div class="timeline-time">${escapeHtml(item.time)}</div>
        <div class="timeline-content">${escapeHtml(item.event)}</div>
      </div>
    `).join('');

  // 生成产品创意
  const ideasHTML = (hotspot.analysis?.productIdeas || [])
    .map(idea => {
      const ideaScore = (idea.interestScore || 0) + (idea.usefulnessScore || 0);
      const ideaClass = ideaScore >= 80 ? 'excellent' : ideaScore >= 60 ? 'good' : 'normal';
      
      return `
      <div class="product-idea">
        <div class="idea-header">
          <div class="idea-title">${escapeHtml(idea.name)}</div>
          <div class="idea-rating ${ideaClass}">${ideaScore}分</div>
        </div>
        <div class="idea-section">
          <h4>核心功能</h4>
          <ul>${idea.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
        </div>
        <div class="idea-section">
          <h4>目标用户</h4>
          <p>${escapeHtml(idea.targetUsers)}</p>
        </div>
        <div class="idea-section">
          <h4>市场机会</h4>
          <p>${escapeHtml(idea.marketOpportunity)}</p>
        </div>
        <div class="criteria-breakdown">
          创意评分明细：有趣度 ${idea.interestScore}/80 + 有用度 ${idea.usefulnessScore}/20
        </div>
      </div>
    `}).join('');

  return `
    <div class="hotspot-card ${ratingClass}" data-score="${hotspot.compositeScore}" data-rank="${hotspot.rank}">
      <div class="card-header">
        <div>
          <span class="card-rank">热搜 #${hotspot.rank}</span>
          <h2>${escapeHtml(hotspot.title)}</h2>
        </div>
        <div class="card-score">${hotspot.compositeScore}分</div>
      </div>
      <div class="hotspot-meta">
        <div class="meta-item">
          <span class="label">热度值:</span> ${hotspot.heatValue.toLocaleString()}
        </div>
        <div class="meta-item">
          <span class="label">热搜标签:</span> ${escapeHtml(hotspot.label || '无')}
        </div>
        <div class="meta-item">
          <span class="label">分类:</span> ${escapeHtml(hotspot.category)}
        </div>
      </div>
      
      ${timelineHTML ? `
      <div class="event-timeline">
        <h3>📅 事件脉络</h3>
        ${timelineHTML}
      </div>
      ` : ''}
      
      <div class="product-ideas-section">
        <h3>💡 产品创意 (${hotspot.analysis?.productIdeas?.length || 0}个)</h3>
        ${ideasHTML || '<p style="color: #999;">暂无创意</p>'}
      </div>
    </div>
  `;
}

/**
 * HTML 转义
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 默认 HTML 模板（简化版）
 */
function getDefaultTemplate() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>微博热搜产品创意分析报告</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px;
            text-align: center;
            color: white;
        }
        .header h1 { font-size: 36px; margin-bottom: 10px; }
        .header .subtitle { font-size: 18px; opacity: 0.9; }
        .summary {
            padding: 30px;
            background: #f8f9fa;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            border-bottom: 1px solid #e0e0e0;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        .summary-card .number {
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
            display: block;
        }
        .summary-card .label { font-size: 14px; color: #666; margin-top: 5px; }
        .hotspots { padding: 30px; }
        .hotspot-card {
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            transition: all 0.3s ease;
        }
        .hotspot-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        .hotspot-card.excellent {
            border-color: #4caf50;
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
        }
        .hotspot-card.good {
            border-color: #2196f3;
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        }
        .hotspot-card.normal {
            border-color: #9e9e9e;
            background: #f5f5f5;
        }
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .card-header h2 { font-size: 24px; flex: 1; }
        .card-rank { font-size: 18px; color: #666; margin-right: 20px; }
        .card-score {
            font-size: 28px;
            font-weight: bold;
            padding: 10px 20px;
            border-radius: 50px;
            color: white;
        }
        .hotspot-card.excellent .card-score { background: #4caf50; }
        .hotspot-card.good .card-score { background: #2196f3; }
        .hotspot-card.normal .card-score { background: #9e9e9e; }
        .hotspot-meta {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #666;
        }
        .meta-item .label { font-weight: 500; }
        .event-timeline {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 5px solid #667eea;
        }
        .event-timeline h3 {
            font-size: 18px;
            margin-bottom: 15px;
            color: #667eea;
        }
        .timeline-item {
            display: flex;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }
        .timeline-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .timeline-time {
            font-weight: bold;
            color: #667eea;
            min-width: 120px;
        }
        .timeline-content { flex: 1; padding-left: 20px; }
        .product-ideas-section h3 {
            font-size: 20px;
            margin-bottom: 20px;
            color: #333;
        }
        .product-idea {
            background: white;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            border-left: 5px solid #667eea;
        }
        .idea-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 15px;
        }
        .idea-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
        }
        .idea-rating {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            color: white;
        }
        .idea-rating.excellent { background: #4caf50; }
        .idea-rating.good { background: #2196f3; }
        .idea-rating.normal { background: #9e9e9e; }
        .idea-section { margin-bottom: 15px; }
        .idea-section h4 {
            font-size: 14px;
            font-weight: 600;
            color: #555;
            margin-bottom: 8px;
            text-transform: uppercase;
        }
        .idea-section p, .idea-section ul {
            font-size: 15px;
            line-height: 1.6;
            color: #444;
        }
        .idea-section ul { padding-left: 20px; }
        .idea-section li { margin-bottom: 5px; }
        .criteria-breakdown {
            background: #f5f5f5;
            padding: 10px 15px;
            border-radius: 6px;
            font-size: 13px;
            color: #666;
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 微博热搜产品创意分析报告</h1>
            <p class="subtitle">基于微博实时热搜数据的产品创意挖掘分析（GitHub Models 驱动）</p>
            <p class="subtitle">生成时间: {GENERATION_TIME}</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <span class="number">{TOTAL_HOTSPOTS}</span>
                <div class="label">分析热点数</div>
            </div>
            <div class="summary-card">
                <span class="number">{TOTAL_IDEAS}</span>
                <div class="label">生成创意数</div>
            </div>
            <div class="summary-card">
                <span class="number">{EXCELLENT_COUNT}</span>
                <div class="label">优秀创意 (80+)</div>
            </div>
            <div class="summary-card">
                <span class="number">{GOOD_COUNT}</span>
                <div class="label">良好创意 (60-79)</div>
            </div>
        </div>

        <div class="hotspots">
            <h2 style="margin-bottom: 30px; color: #667eea;">📊 热点分析结果</h2>
            {HOTSPOT_CARDS}
        </div>
    </div>
</body>
</html>`;
}
