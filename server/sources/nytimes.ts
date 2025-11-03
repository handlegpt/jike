import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

const nytimes = defineSource(async () => {
  const baseURL = "https://cn.nytimes.com"
  const html: any = await myFetch(baseURL)
  const $ = cheerio.load(html)
  const news: NewsItem[] = []

  // 获取首页最新文章 - 改进选择器
  $(".headlineOnlyList li, .story, article").each((_, el) => {
    const $el = $(el)
    const linkEl = $el.find("a").first()
    const titleEl = $el.find(".headline, h1, h2, h3")

    const title = titleEl.text().trim() || linkEl.text().trim()
    const url = linkEl.attr("href")
    const timeEl = $el.find("time, .timestamp, .date")
    const timeText = timeEl.text().trim()

    if (title && url) {
      let fullUrl = url
      if (url.startsWith("/")) {
        fullUrl = baseURL + url
      }

      // 从URL中提取日期
      let pubDate = Date.now()
      const dateMatch = url.match(/(\d{4})(\d{2})(\d{2})/)
      if (dateMatch) {
        const [, year, month, day] = dateMatch
        pubDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day)).getTime()
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
