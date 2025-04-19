export default defineSource(async () => {
  const FEED_URL = "https://cn.nytimes.com/rss/news.xml"

  const res = await fetch(FEED_URL, {
    headers: {
      "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            + "AppleWebKit/537.36 (KHTML, like Gecko) "
            + "Chrome/113.0.0.0 Safari/537.36",
      "Accept": "application/rss+xml, application/xml, text/xml",
    },
  })

  if (!res.ok) {
    throw new Error(`NYTimes CN RSS fetch failed: ${res.status} ${res.statusText}`)
  }

  const xml = await res.text()
  const itemsRaw = xml.split("<item>").slice(1)

  function extract(tag: string, block: string): string {
    const re = new RegExp(
      `<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`,
      "i",
    )
    const m = block.match(re)
    return m ? m[1].trim() : ""
  }

  return itemsRaw.map((block) => {
    const title = extract("title", block)
    const link = extract("link", block)
    const guid = extract("guid", block) || link
    const pubText = extract("pubDate", block)
    const pubDate = pubText ? new Date(pubText).getTime() : Date.now()
    const desc = extract("description", block)

    return {
      id: guid,
      title,
      url: link,
      pubDate,
      extra: {
        date: pubText,
        hover: desc,
      },
    }
  })
})
