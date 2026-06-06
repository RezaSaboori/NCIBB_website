import { getDatabases } from "../../pages/dataset/utils/csv"
import { DatabaseInfo } from "../../types/database"

export const searchInCsv = async (
  query: string,
  searchSubject: string = "همه"
): Promise<DatabaseInfo[]> => {
  const data = await getDatabases()
  const searchTerms = query.toLowerCase().split(" ")

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
