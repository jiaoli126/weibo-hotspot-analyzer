import OpenAI from 'openai';

/**
 * 使用 DeepSeek 免费 API 分析热搜话题
 * @param {object} hotspot - 热搜数据
 * @param {string} apiKey - API Key（DeepSeek 或 GitHub Token）
 * @param {string} model - 模型名称
 * @returns {Promise<object>} 分析结果
 */
export async function analyzeHotspot(hotspot, apiKey, model = 'gpt-4o') {
  // 获取当前日期
  const currentDate = new Date().toLocaleDateString('zh-CN', { 
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
  
  const prompt = `
当前日期：${currentDate}

⚠️ 重要提示：现在是 2026 年，请基于 2026 年的时间背景进行分析。

请分析以下微博热搜话题，生成产品创意。

**热搜标题**: ${hotspot.title}
**热度值**: ${hotspot.heatValue.toLocaleString()}
**热搜标签**: ${hotspot.label}
**话题摘要**: ${hotspot.summary}

请严格按照以下 JSON 格式输出（不要包含任何其他文字）：
{
  "eventTimeline": [
    {"time": "具体时间（必须是2026年或最近发生的）", "event": "事件描述"}
  ],
  "productIdeas": [
    {
      "name": "产品名称",
      "features": ["功能1", "功能2", "功能3"],
      "targetUsers": "目标用户详细描述",
      "marketOpportunity": "市场机会分析",
      "interestScore": 68,
      "usefulnessScore": 17
    }
  ]
}

评分标准：
- 有趣度（0-80分）：话题热度、传播潜力、用户关注度、创意新颖性
- 有用度（0-20分）：商业化可行性、市场需求、产品适配度、技术可行性

特别要求：
1. eventTimeline 必须基于 2026 年的时间背景，如果是最近发生的事件，时间应该是 2026 年 1 月
2. 如果话题涉及历史事件，请在 event 中说明"2026年1月回顾XX年事件"
3. productIdeas 至少生成 1-2 个创意
4. 评分要客观合理，不要全部给高分
5. 只输出 JSON，不要有其他解释文字
`;

  try {
    // 优先使用 DeepSeek API（如果配置了 DEEPSEEK_API_KEY）
    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    const useDeepSeek = !!deepseekKey;
    
    console.log(`  🤖 正在分析: ${hotspot.title}...`);
    console.log(`  📡 使用 API: ${useDeepSeek ? 'DeepSeek (免费)' : 'GitHub Models'}`);

    // 创建 OpenAI 客户端
    const client = new OpenAI({
      apiKey: useDeepSeek ? deepseekKey : apiKey,
      baseURL: useDeepSeek ? 'https://api.deepseek.com' : 'https://models.inference.ai.azure.com'
    });

    const response = await client.chat.completions.create({
      model: useDeepSeek ? 'deepseek-chat' : 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的产品经理和市场分析师，擅长从热点事件中挖掘产品创意。请严格按照 JSON 格式输出，不要包含任何其他文字。当前年份是 2026 年。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    // 提取 AI 返回的内容
    let content = response.choices[0].message.content.trim();
    
    // 清理可能的 markdown 代码块标记
    content = content.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    
    // 解析 JSON
    const result = JSON.parse(content);
    
    // 验证数据结构
    if (!result.eventTimeline || !result.productIdeas) {
      throw new Error('AI 返回的数据格式不正确');
    }

    // 计算综合评分
    const compositeScore = result.productIdeas.length > 0
      ? (result.productIdeas[0].interestScore || 0) + (result.productIdeas[0].usefulnessScore || 0)
      : 0;

    console.log(`  ✅ 分析完成，评分: ${compositeScore}`);

    return {
      ...hotspot,
      analysis: result,
      compositeScore: compositeScore
    };
    
  } catch (error) {
    console.error(`  ❌ 分析失败: ${hotspot.title}`);
    console.error(`     错误类型: ${error.name || 'Unknown'}`);
    console.error(`     错误信息: ${error.message || 'No message'}`);
    
    // 如果是 API 错误，打印更多信息
    if (error.response) {
      console.error(`     HTTP 状态码: ${error.response.status}`);
      console.error(`     响应数据: ${JSON.stringify(error.response.data || {})}`);
    } else if (error.request) {
      console.error(`     请求已发送但无响应`);
      console.error(`     请求详情: ${error.request ? 'Request sent' : 'No request'}`);
    } else {
      console.error(`     配置错误: ${error.config ? 'Config exists' : 'No config'}`);
    }
    
    // 检查 API Key 配置
    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekKey) {
      console.error(`     ⚠️  警告: DEEPSEEK_API_KEY 未配置！`);
    } else {
      console.error(`     ✓ DEEPSEEK_API_KEY 已配置（长度: ${deepseekKey.length}）`);
    }
    
    // 返回默认结构，避免中断整个流程
    return {
      ...hotspot,
      analysis: {
        eventTimeline: [
          { time: '未知', event: '分析失败: ' + error.message }
        ],
        productIdeas: [
          {
            name: '分析失败',
            features: ['无法生成'],
            targetUsers: '未知',
            marketOpportunity: '分析失败',
            interestScore: 0,
            usefulnessScore: 0
          }
        ]
      },
      compositeScore: 0
    };
  }
}
