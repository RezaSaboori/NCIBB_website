import React from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react"
import { DatabaseInfo, DataType } from "../../types/database"
import { Icon } from "@iconify/react"
import "./InfoModal.css"

interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
  database: DatabaseInfo
}

type IconData = {
  icon: string
  width: string
  height: string
  style?: React.CSSProperties
  color?: string
}

const StarIcon = ({ filled }: { filled: boolean }) => (
  <Icon
    icon="lets-icons:star-fill"
    width="30"
    height="30"
    style={{ color: filled ? "var(--color-yellow)" : "var(--color-gray5)" }}
  />
)

const formatSize = (sizeInKb: number): string => {
  if (sizeInKb <= 0) return "0 Kb"

  const tb = 1024 * 1024 * 1024
  const gb = 1024 * 1024
  const mb = 1024

  if (sizeInKb >= tb) {
    return `${(sizeInKb / tb).toFixed(1)} Tb`
  }
  if (sizeInKb >= gb) {
    return `${(sizeInKb / gb).toFixed(1)} Gb`
  }
  if (sizeInKb >= mb) {
    return `${(sizeInKb / mb).toFixed(1)} Mb`
  }
  return `${sizeInKb.toFixed(1)} Kb`
}

const getSizeColor = (sizeInKb: number): string => {
  const minSizeKb = 1024 // 1 Kb
  const maxSizeKb = 1024 * 1024 * 1024 // 1 TB

  const startColor = { r: 0, g: 200, b: 179 } // --color-mint
  const endColor = { r: 255, g: 141, b: 40 } // --color-orange

  if (sizeInKb <= minSizeKb)
    return `rgb(${startColor.r}, ${startColor.g}, ${startColor.b})`
  if (sizeInKb >= maxSizeKb)
    return `rgb(${endColor.r}, ${endColor.g}, ${endColor.b})`

  const minLog = Math.log(minSizeKb)
  const maxLog = Math.log(maxSizeKb)
  const scale = (Math.log(sizeInKb) - minLog) / (maxLog - minLog)

  const r = startColor.r + scale * (endColor.r - startColor.r)
  const g = startColor.g + scale * (endColor.g - startColor.g)
  const b = startColor.b + scale * (endColor.b - startColor.b)

  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}

const getYearColor = (year: number): string => {
  const minYear = 2000
  const maxYear = new Date().getFullYear()

  const startColor = { r: 255, g: 141, b: 40 } // --color-orange
  const endColor = { r: 0, g: 200, b: 179 } // --color-mint

  if (year <= minYear)
    return `rgb(${startColor.r}, ${startColor.g}, ${startColor.b})`
  if (year >= maxYear) return `rgb(${endColor.r}, ${endColor.g}, ${endColor.b})`

  const scale = (year - minYear) / (maxYear - minYear)

  const r = startColor.r + scale * (endColor.r - startColor.r)
  const g = startColor.g + scale * (endColor.g - startColor.g)
  const b = startColor.b + scale * (endColor.b - startColor.b)

  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}

const dataTypeIcons: Record<DataType, IconData> = {
  image: {
    icon: "mynaui:image-solid",
    width: "14",
    height: "14",
    color: "--color-mint",
  },
  text: {
    icon: "mingcute:document-3-fill",
    width: "14",
    height: "14",
    color: "--color-purple",
  },
  sequence: {
    icon: "icon-park-solid:video",
    width: "14",
    height: "14",
    color: "--color-orange",
  },
  omics: {
    icon: "streamline:dna-solid",
    width: "14",
    height: "14",
    color: "--color-blue",
  },
  table: {
    icon: "heroicons:table-cells-20-solid",
    width: "14",
    height: "14",
    color: "--color-indigo",
  },
  signal: {
    icon: "streamline:wave-signal-square-solid",
    width: "14",
    height: "12",
    style: { marginTop: "1px" },
    color: "--color-yellow",
  },
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  database,
}) => {
  const yearColor = getYearColor(database.year)
  const sizeColor = getSizeColor(database.fileSizeKB)
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      placement="center"
      backdrop="blur"
      classNames={{
        backdrop: "bg-gray6/70 backdrop-opacity-95",
        base: "overflow-visible p-10 rounded-[var(--border-radius-container-lg)] glass-modal-effect w-full max-w-5xl modal-offset-down",
        closeButton:
          "absolute top-[-2.5rem] right-[-2.5rem] z-1 text-[30px] flex items-center justify-center w-12 h-12 text-white bg-[var(--color-red)]/80 hover:bg-[var(--color-red)] cursor-pointer active:bg-[var(--color-red)]",
        header: "p-0 pb-8",
        body: "p-0 custom-scrollbar",
        footer: "p-0 pt-8 boxshadow",
      }}
    >
      <ModalContent className="bg-transparent">
        <ModalHeader className="w-full bg-[var(--color-gray1)]/80 align-middle rounded-[var(--border-radius-container-xs)] font-medium p-8 mb-6 force-ltr">
          {database.name}
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 flex flex-col">
              <div className="flex flex-col gap-2 bg-[var(--color-gray1)]/50 p-4 rounded-[var(--border-radius-container-xs)] mb-4">
                <h3 className="text-md font-semibold">امتیاز</h3>
                <div className="flex flex-col">
                  <p className="flex justify-between force-ltr w-full">
                    <StarIcon filled={database.rating >= 1} />
                    <StarIcon filled={database.rating >= 2} />
                    <StarIcon filled={database.rating >= 3} />
                    <StarIcon filled={database.rating >= 4} />
                    <StarIcon filled={database.rating >= 5} />
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-2 mb-4">
                <div
                  className="flex flex-row w-full bg-[var(--color-gray1)]/50  p-2.5 rounded-[var(--border-radius-container-xs)] justify-between"
                  style={{ backgroundColor: yearColor }}
                >
                  <p className="text-sm font-medium text-[var(--color-gray12)] force-ltr pr-2">
                    {database.year}
                  </p>
                  <Icon icon="lets-icons:date-fill" width={16} height={16} />
                </div>
                <div
                  className="flex flex-row w-full bg-[var(--color-gray1)]/50 p-2.5 rounded-[var(--border-radius-container-xs)] justify-between"
                  style={{ backgroundColor: sizeColor }}
                >
                  <p className="text-sm font-medium text-[var(--color-gray12)] force-ltr pr-2">
                    {formatSize(database.fileSizeKB)}
                  </p>
                  <Icon
                    icon="material-symbols:folder-open-rounded"
                    width={16}
                    height={16}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 bg-[var(--color-gray1)]/50 p-4 rounded-[var(--border-radius-container-xs)]">
                <h3 className="text-md font-semibold">انواع داده</h3>
                <div className="flex flex-wrap gap-4 force-ltr">
                  {database.dataTypes.map((type) => {
                    const iconData = dataTypeIcons[type]
                    return (
                      <span
                        key={type}
                        className="flex items-center gap-4 rounded-full px-3 pt-1.75 pb-[5px] text-xs text-[var(--color-gray12)] force-ltr"
                        style={{
                          backgroundColor: `var(${iconData.color})`,
                        }}
                      >
                        <Icon
                          icon={iconData.icon}
                          width={iconData.width}
                          height={iconData.height}
                          style={{
                            color: "var(--color-gray12)",
                            marginBottom: "2px",
                          }}
                        />
                        {type}
                      </span>
                    )
                  })}
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2 bg-[var(--color-gray1)]/50 p-4 rounded-[var(--border-radius-container-xs)]">
                <h3 className="text-md font-semibold">متغیرها</h3>
                <div className="flex flex-wrap gap-1 force-ltr">
                  {database.datasetVariables.map((variable) => (
                    <span
                      key={variable}
                      className="px-2 pb-0.5 pt-1 rounded-[15px] bg-[var(--color-indigo)]/10 text-[var(--color-indigo)] force-ltr border border-[var(--color-indigo)]"
                      style={{ fontSize: "var(--font-size-xs)" }}
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
              {database.topics && database.topics.length > 0 && (
                <div className="mt-4 flex flex-col gap-2 bg-[var(--color-gray1)]/50 p-4 rounded-[var(--border-radius-container-xs)]">
                  <h3 className="text-md font-semibold">موضوعات</h3>
                  <div className="flex flex-wrap gap-1 force-ltr">
                    {database.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-2 pb-0.5 pt-1 rounded-[15px] bg-[var(--color-blue)]/10 text-[var(--color-blue)] force-ltr border border-[var(--color-blue)]"
                        style={{ fontSize: "var(--font-size-xs)" }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="col-span-9 bg-[var(--color-gray1)]/50 p-6 rounded-[var(--border-radius-container-xs)]">
              <p className="force-ltr">{database.description}</p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-center gap-6">
          <Button
            color="primary"
            onPress={onClose}
            radius="full"
            size="lg"
            className="cursor-pointer w-full"
          >
            درخواست داده
          </Button>
          <Button
            variant="bordered"
            color="danger"
            onPress={onClose}
            radius="full"
            size="lg"
            className="cursor-pointer hover:bg-[var(--color-red)]/20 w-full"
          >
            بستن
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
