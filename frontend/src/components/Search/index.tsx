import { DatabaseInfo } from "../../types/database"

export const searchInCsv = (
  data: readonly DatabaseInfo[],
  query: string,
  searchSubject: string = "همه",
): DatabaseInfo[] => {
  const searchTerms = query.trim().toLowerCase().split(/\s+/u)

  return data.filter((row) => {
    let searchableString = ""
    if (searchSubject === "همه") {
      searchableString = Object.values(row).join(" ").toLowerCase()
    } else if (searchSubject === "عنوان") {
      searchableString = row.name.toLowerCase()
    } else if (searchSubject === "توضیحات") {
      searchableString = (
        row.description +
        " " +
        row.shortDescription
      ).toLowerCase()
    }

    return searchTerms.every((term) => searchableString.includes(term))
  })
}
