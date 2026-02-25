import { DatabaseInfo, DataType } from "@/types/database"

const parseCsvRow = (row: string): string[] => {
  const fields: string[] = []
  let currentField = ""
  let inQuotes = false

  for (let i = 0; i < row.length; i++) {
    const char = row[i]

    if (char === '"' && (i === 0 || row[i - 1] !== "\\")) {
      if (inQuotes && i < row.length - 1 && row[i + 1] === '"') {
        currentField += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      fields.push(currentField)
      currentField = ""
    } else {
      currentField += char
    }
  }
  fields.push(currentField)

  return fields.map((field) => field.trim())
}

const cleanString = (s: string) => s.replace(/^"|"$/g, "").trim()

const isValidDataType = (s: string): s is DataType => {
  return ["image", "text", "sequence", "omics", "table", "signal"].includes(s)
}

const parseDatasetVariables = (variables: string): string[] => {
  if (!variables) return []

  const result: string[] = []
  let lastSplit = 0
  let parenCount = 0

  for (let i = 0; i < variables.length; i++) {
    const char = variables[i]
    if (char === "(") parenCount++
    else if (char === ")") parenCount--

    if ((char === "," || char === ";") && parenCount === 0) {
      result.push(variables.substring(lastSplit, i).trim())
      lastSplit = i + 1
    }
  }

  result.push(variables.substring(lastSplit).trim())

  return result.filter(Boolean)
}

export const getDatabases = async (): Promise<DatabaseInfo[]> => {
  try {
    const response = await fetch("/data/databases_infos.csv")
    if (!response.ok) {
      throw new Error("Failed to fetch database infos")
    }
    const text = await response.text()
    const lines = text.split("\n").slice(1) // Skip header

    return lines
      .map((line) => {
        if (!line.trim()) return null

        const columns = parseCsvRow(line)
        if (columns.length < 11) return null

        const dataTypes = cleanString(columns[7])
          .split(/, ?/)
          .map((s) => s.trim().toLowerCase())
          .filter(isValidDataType)

        const topics = cleanString(columns[8])
          .split(/, ?/)
          .map((s) => s.trim())
          .filter(Boolean)

        const datasetVariables = parseDatasetVariables(cleanString(columns[6]))

        const rating = parseInt(columns[10], 10)

        return {
          name: cleanString(columns[0]),
          shortDescription: cleanString(columns[1]),
          year: parseInt(columns[2], 10) || 0,
          reference: cleanString(columns[3]),
          fileSize: cleanString(columns[4]),
          fileSizeKB: parseFloat(columns[5]) || 0,
          datasetVariables,
          dataTypes,
          topics,
          description: cleanString(columns[9]),
          rating: !isNaN(rating) ? rating : 0,
        }
      })
      .filter((item): item is DatabaseInfo => item !== null)
  } catch (error) {
    console.error("Error fetching or parsing database info:", error)
    return []
  }
}
