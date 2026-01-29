import OpenAI from 'openai';

/**
 * 使用 GitHub Models 分析热搜话题
 * @param {object} hotspot - 热搜数据
 * @param {string} apiKey - GitHub Token
 * @param {string} model - 模型名称
 * @returns {Promise<object>} 分析结果
 */
export async function analyzeHotspot(hotspot, apiKey, model = 'gpt-4o') {
  const prompt = `
请分析以下微博热搜话题，生成产品创意。

**热搜标题**: ${hotspot.title}
**热度值**: ${hotspot.heatValue.toLocaleString()}
**热搜标签**: ${hotspot.label}
**话题摘要**: ${hotspot.summary}

请严格按照以下 JSON 格式输出（不要包含任何其他文字）：
{
  "eventTimeline": [
    {"time": "具体时间", "event": "事件描述"}
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

要求：
1. eventTimeline 至少包含 2-3 个关键时间节点
2. productIdeas 至少生成 1-2 个创意
3. 评分要客观合理，不要全部给高分
4. 只输出 JSON，不要有其他解释文字
`;

  try {
    // 创建 OpenAI 客户端（兼容 OpenAI API）
    // 优先使用 DeepSeek 免费 API（更稳定）
    const useDeepSeek = model.includes('deepseek') || model === 'gpt-4o';
    
    const client = new OpenAI({
      apiKey: useDeepSeek ? (process.env.DEEPSEEK_API_KEY || apiKey) : apiKey,
      baseURL: useDeepSeek ? 'https://api.deepseek.com' : 'https://models.inference.ai.azure.com',
      defaultHeaders: useDeepSeek ? {} : {
        'api-key': apiKey
      }
    });

    console.log(`  🤖 正在分析: ${hotspot.title}...`);
    
    // 根据不同 API 使用不同的模型名称
    const actualModel = useDeepSeek ? 'deepseek-chat' : model;

    const response = await client.chat.completions.create({
      model: actualModel,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的产品经理和市场分析师，擅长从热点事件中挖掘产品创意。请严格按照 JSON 格式输出，不要包含任何其他文字。'
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
    console.error(`     错误: ${error.message}`);
    
    // 返回默认结构，避免中断整个流程
    return {
      ...hotspot,
      analysis: {
        eventTimeline: [
          { time: '未知', event: '分析失败' }
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
