import axios from 'axios';

/**
 * 抓取微博热搜数据
 * @param {string} apiUrl - 微博热搜 API 地址
 * @param {object} headers - 请求头
 * @param {number} maxCount - 最大抓取数量
 * @returns {Promise<Array>} 热搜列表
 */
export async function fetchWeiboHotspots(apiUrl, headers = {}, maxCount = 30) {
  try {
    console.log(`📡 正在抓取微博热搜数据...`);
    
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': headers['User-Agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...headers
      },
      timeout: 30000
    });

    // 解析微博 API 返回的数据
    const hotspots = response.data?.data?.realtime || [];
    
    if (hotspots.length === 0) {
      throw new Error('微博 API 返回空数据');
    }

    const result = hotspots.slice(0, maxCount).map((item, index) => ({
      rank: index + 1,
      title: item.note || item.word || '未知标题',
      heatValue: item.num || 0,
      label: item.label_name || '',
      summary: item.word || item.note || '',
      category: item.category || 'unknown'
    }));

    console.log(`✅ 成功抓取 ${result.length} 条热搜`);
    return result;
    
  } catch (error) {
    console.error('❌ 微博 API 调用失败:', error.message);
    
    // 如果是网络错误，提供更详细的信息
    if (error.code === 'ECONNREFUSED') {
      console.error('   提示：无法连接到微博 API，请检查网络或 API 地址');
    } else if (error.response?.status === 403) {
      console.error('   提示：被微博反爬虫拦截，请配置正确的 User-Agent');
    }
    
    throw error;
  }
}
