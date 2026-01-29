import { fetchWeiboHotspots } from './weibo-api.js';
import { analyzeHotspot } from './github-models-analyzer.js';
import { generateHTMLReport } from './html-generator.js';

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始微博热搜分析任务（GitHub Models 免费版）...\n');
  console.log('=' .repeat(60));

  // 1. 获取环境变量
  const {
    GITHUB_TOKEN,
    WEIBO_API_URL,
    WEIBO_API_HEADERS,
    MAX_HOTSPOTS = '30',
    AI_MODEL = 'gpt-4o'
  } = process.env;

  // 验证必需的环境变量
  if (!GITHUB_TOKEN) {
    throw new Error('❌ 缺少环境变量: GITHUB_TOKEN');
  }
  if (!WEIBO_API_URL) {
    throw new Error('❌ 缺少环境变量: WEIBO_API_URL');
  }

  console.log(`📌 配置信息:`);
  console.log(`   - AI 模型: ${AI_MODEL}`);
  console.log(`   - 分析数量: ${MAX_HOTSPOTS} 条`);
  console.log(`   - 微博 API: ${WEIBO_API_URL}`);
  console.log('=' .repeat(60) + '\n');

  try {
    // 2. 抓取微博热搜
    const headers = WEIBO_API_HEADERS ? JSON.parse(WEIBO_API_HEADERS) : {};
    const hotspots = await fetchWeiboHotspots(
      WEIBO_API_URL, 
      headers, 
      parseInt(MAX_HOTSPOTS)
    );

    if (hotspots.length === 0) {
      throw new Error('未抓取到任何热搜数据');
    }

    console.log(`\n📋 热搜列表预览（前 5 条）:`);
    hotspots.slice(0, 5).forEach(h => {
      console.log(`   ${h.rank}. ${h.title} (热度: ${h.heatValue.toLocaleString()})`);
    });
    console.log('');

    // 3. AI 分析每个热搜（串行处理，避免 API 限流）
    console.log('🤖 开始 AI 分析...');
    console.log('=' .repeat(60));
    
    const analyzedHotspots = [];
    
    for (let i = 0; i < hotspots.length; i++) {
      const hotspot = hotspots[i];
      console.log(`\n[${i + 1}/${hotspots.length}] 分析中...`);
      
      try {
        const result = await analyzeHotspot(hotspot, GITHUB_TOKEN, AI_MODEL);
        analyzedHotspots.push(result);
        
        // 添加延迟，避免 API 限流（GitHub Models 免费层有速率限制）
        if (i < hotspots.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒延迟
        }
      } catch (error) {
        console.error(`   ⚠️  跳过此热搜，继续下一个...`);
        // 即使失败也添加到结果中，避免数据丢失
        analyzedHotspots.push({
          ...hotspot,
          analysis: null,
          compositeScore: 0
        });
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ AI 分析完成！成功: ${analyzedHotspots.filter(h => h.compositeScore > 0).length}/${hotspots.length}`);

    // 4. 生成 HTML 报告
    console.log('\n📄 生成 HTML 报告...');
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const outputPath = `./weibo_hotspot_analysis_${timestamp}.html`;
    await generateHTMLReport(analyzedHotspots, outputPath);

    // 5. 输出统计信息
    console.log('\n' + '='.repeat(60));
    console.log('📊 分析统计:');
    const excellent = analyzedHotspots.filter(h => h.compositeScore >= 80).length;
    const good = analyzedHotspots.filter(h => h.compositeScore >= 60 && h.compositeScore < 80).length;
    const normal = analyzedHotspots.filter(h => h.compositeScore < 60).length;
    console.log(`   - 优秀创意 (80+): ${excellent} 个`);
    console.log(`   - 良好创意 (60-79): ${good} 个`);
    console.log(`   - 普通创意 (<60): ${normal} 个`);

    const totalIdeas = analyzedHotspots.reduce((sum, h) => 
      sum + (h.analysis?.productIdeas?.length || 0), 0
    );
    console.log(`   - 总创意数: ${totalIdeas} 个`);

    console.log('\n' + '='.repeat(60));
    console.log('✨ 任务完成！');
    console.log(`📁 报告路径: ${outputPath}`);
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ 任务执行失败:');
    console.error(`   错误: ${error.message}`);
    console.error('=' .repeat(60));
    
    // 打印堆栈信息（调试用）
    if (process.env.DEBUG) {
      console.error('\n堆栈信息:');
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

// 执行主函数
main().catch(error => {
  console.error('未捕获的错误:', error);
  process.exit(1);
});
