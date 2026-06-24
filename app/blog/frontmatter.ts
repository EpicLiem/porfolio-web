type Frontmatter = Record<string, string | string[]>

function cleanValue(value: string) {
  return value.trim().replace(/^['"]|['"]$/g, "")
}

function parseValue(value: string) {
  const trimmed = value.trim()

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map(cleanValue)
      .filter(Boolean)
  }

  return cleanValue(trimmed)
}

export function parseFrontmatter(source: string) {
  if (!source.startsWith("---\n")) {
    return { content: source, data: {} as Frontmatter }
  }

  const end = source.indexOf("\n---", 4)
  if (end === -1) {
    return { content: source, data: {} as Frontmatter }
  }

  const data = Object.fromEntries(
    source
      .slice(4, end)
      .split("\n")
      .map((line) => {
        const separator = line.indexOf(":")
        if (separator === -1) return null
        return [line.slice(0, separator).trim(), parseValue(line.slice(separator + 1))]
      })
      .filter(Boolean) as [string, string | string[]][]
  )

  return { content: source.slice(end + 4).trimStart(), data }
}
