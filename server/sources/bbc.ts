export default defineSource(async () => {
  const xml = await fetch("http://feeds.bbci.co.uk/news/rss.xml").then(r => r.text())
  const itemsRaw = xml.split("<item>").slice(1)

  function extract(tag: string, str: string): string {
    const re = new RegExp(
      `<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:]]>)?</${tag}>`,
      "i",
    )
    const m = str.match(re)
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
