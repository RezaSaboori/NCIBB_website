export type DatasetSearchMode = "smart" | "manual";

export const searchSubjects = ["همه", "عنوان", "توضیحات"] as const;
export const sortOptions = ["امتیاز", "الفبا", "سال", "حجم"] as const;
export const smartSortOptions = ["شباهت", ...sortOptions] as const;
export type DatasetSort = (typeof sortOptions)[number];
export type SmartDatasetSort = (typeof smartSortOptions)[number];

export interface ManualSearchOptions {
  subject: (typeof searchSubjects)[number];
  sort: DatasetSort;
  variables: string[];
}

export const defaultManualOptions: ManualSearchOptions = {
  subject: "همه",
  sort: "سال",
  variables: [],
};
