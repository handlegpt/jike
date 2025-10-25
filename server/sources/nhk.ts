import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

const nhk = defineSource(async () => {
  const baseURL = "https://www3.nhk.or.jp"
  const html: any = await myFetch(`${baseURL}/nhkworld/zh/news/`)
  const $ = cheerio.load(html)
  const news: NewsItem[] = []
  
  // 使用更通用的选择器
  $("a").each((_, el) => {
    const $el = $(el)
    const title = $el.text().trim()
    const url = $el.attr("href")
    
    // 过滤条件：标题长度、包含新闻关键词、不是导航链接
    if (title && url && 
        title.length > 10 && 
        title.length < 200 &&
        !title.includes("NHK WORLD") &&
        !title.includes("新闻") &&
        !title.includes("首页") &&
        !title.includes("节目") &&
        !title.includes("直播") &&
        !title.includes("关于") &&
        !title.includes("联系我们") &&
        (url.includes("/news/") || url.includes("news"))) {
      
      let fullUrl = url
      if (url.startsWith("/")) {
        fullUrl = baseURL + url
      } else if (!url.startsWith("http")) {
        fullUrl = `${baseURL}/nhkworld/zh/news/${url}`
      }
      
      // 避免重复
      if (!news.find(item => item.title === title)) {
        news.push({
          id: url,
          title,
          url: fullUrl,
          pubDate: Date.now(),
          extra: {
            info: "NHK World 中文",
          },
        })
      }
    }
  })
  
  return news.slice(0, 30) // 限制返回30条
})

export default defineSource({
  "nhk-zh": nhk,
})
