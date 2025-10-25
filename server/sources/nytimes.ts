import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

const nytimes = defineSource(async () => {
  const baseURL = "https://cn.nytimes.com"
  const html: any = await myFetch(baseURL)
  const $ = cheerio.load(html)
  const news: NewsItem[] = []
  
  // 获取首页最新文章
  $("article, .story").each((_, el) => {
    const $el = $(el)
    const titleEl = $el.find("h1, h2, h3, .headline, .title")
    const linkEl = $el.find("a").first()
    
    const title = titleEl.text().trim()
    const url = linkEl.attr("href")
    const timeEl = $el.find("time, .timestamp, .date")
    const timeText = timeEl.text().trim()
    
    if (title && url) {
      let fullUrl = url
      if (url.startsWith("/")) {
        fullUrl = baseURL + url
      }
      
      // 解析时间
      let pubDate = Date.now()
      if (timeText) {
        const timeMatch = timeText.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
        if (timeMatch) {
          const [, year, month, day] = timeMatch
          pubDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime()
        }
      }
      
      news.push({
        id: url,
        title,
        url: fullUrl,
        pubDate,
        extra: {
          info: timeText || "纽约时报中文网",
        },
      })
    }
  })
  
  return news.slice(0, 30) // 限制返回30条
})

export default defineSource({
  "nytimes-cn": nytimes,
})
