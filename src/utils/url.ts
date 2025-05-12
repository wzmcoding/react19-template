export function combineURLs(baseURL: string, relativeURL: string) {
  return relativeURL
    ? `${baseURL.replace(/\/?\/$/, '')}/${relativeURL.replace(/^\/+/, '')}`
    : baseURL
}

export function isAbsoluteURL(url: string) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(url)
}

export function buildURL(url: string, params: any) {
  if (!params) {
    return url
  }
  const urlObj = new URL(url)
  const paramsObj = new URLSearchParams(params)

  // 如果URL已经有查询参数，则添加到现有参数后面
  if (urlObj.search) {
    urlObj.search += `&${paramsObj.toString()}`
  }
  else {
    urlObj.search = paramsObj.toString()
  }

  return urlObj.href
}
