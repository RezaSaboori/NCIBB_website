import React, { useState, useRef, useEffect } from "react"
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Chip,
  Button,
  Tooltip,
} from "@heroui/react"
import { Icon } from "@iconify/react"
import { DatabaseInfo, DataType } from "../../types/database"
import { InfoModal } from "../InfoModal"
import "./DataCard.css"

interface DataCardProps {
  database: DatabaseInfo
  isVisible?: boolean
  animationDelay?: number
}

const StarIcon = ({ filled }: { filled: boolean }) => (
  <Icon
    icon="lets-icons:star-fill"
    width="25"
    height="25"
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

type IconData = {
  icon: string
  width: string
  height: string
  style?: React.CSSProperties
  color?: string
}

const dataTypeIcons: Record<DataType, IconData> = {
  image: {
    icon: "mynaui:image-solid",
    width: "20",
    height: "20",
    color: "--color-mint",
  },
  text: {
    icon: "mingcute:document-3-fill",
    width: "20",
    height: "20",
    color: "--color-purple",
  },
  sequence: {
    icon: "icon-park-solid:video",
    width: "20",
    height: "20",
    color: "--color-orange",
  },
  omics: {
    icon: "streamline:dna-solid",
    width: "20",
    height: "20",
    color: "--color-blue",
  },
  table: {
    icon: "heroicons:table-cells-20-solid",
    width: "20",
    height: "20",
    color: "--color-indigo",
  },
  signal: {
    icon: "streamline:wave-signal-square-solid",
    width: "20",
    height: "16",
    style: { marginTop: "2px" },
    color: "--color-yellow",
  },
}

const dataTypeTooltipBg: { [key: string]: string } = {
  image: "bg-[var(--color-mint)]",
  text: "bg-[var(--color-purple)]",
  sequence: "bg-[var(--color-orange)]",
  omics: "bg-[var(--color-blue)]",
  table: "bg-[var(--color-indigo)]",
  signal: "bg-[var(--color-yellow)]",
}

export const DataCard: React.FC<DataCardProps> = ({
  database,
  isVisible,
  animationDelay,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [openTooltips, setOpenTooltips] = useState<Record<string, boolean>>({})
  const tooltipTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({})

  useEffect(() => {
    return () => {
      Object.values(tooltipTimeoutRef.current).forEach(clearTimeout)
    }
  }, [])

  const handleTooltipOpen = (key: string) => {
    if (tooltipTimeoutRef.current[key]) {
      clearTimeout(tooltipTimeoutRef.current[key])
    }
    setOpenTooltips((prev) => ({ ...prev, [key]: true }))
    tooltipTimeoutRef.current[key] = setTimeout(() => {
      setOpenTooltips((prev) => ({ ...prev, [key]: false }))
    }, 2000)
  }

  const handleTooltipClose = (key: string) => {
    if (tooltipTimeoutRef.current[key]) {
      clearTimeout(tooltipTimeoutRef.current[key])
    }
    setOpenTooltips((prev) => ({ ...prev, [key]: false }))
  }

  const {
    fileSizeKB: size,
    year,
    rating,
    name: title,
    shortDescription: description,
    datasetVariables: tags,
    dataTypes,
    reference,
  } = database

  const sizeColor = getSizeColor(size)
  const yearColor = getYearColor(year)

  const cardStyle = isVisible
    ? { animationDelay: `${animationDelay}ms` }
    : { opacity: 0 }

  const cardClassName = `data-card glass w-full rounded-[var(--border-radius-container-lg)] p-6 ${
    isVisible ? "reveal" : ""
  }`

  return (
    <>
      <Card className={cardClassName} style={cardStyle}>
        <CardHeader className="flex justify-between ">
          <div className="flex" style={{ direction: "ltr" }}>
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} filled={i < rating} />
            ))}
          </div>
          <div className="flex gap-2">
            <Chip
              className="font-IRANSansX p-4"
              classNames={{
                content: "relative top-px",
              }}
              style={{
                backgroundColor: yearColor,
                color: "var(--color-gray12)",
                gap: "0.3rem",
                cursor: "default",
                fontSize: "var(--font-size-xs)",
                padding: "0.75rem 0.75rem 0.75rem 0.75rem",
              }}
              variant="flat"
              endContent={
                <Icon
                  icon="lets-icons:date-fill"
                  width={12}
                  height={12}
                  style={{ marginTop: "-1px" }}
                />
              }
            >
              {year}
            </Chip>
            <Chip
              className="font-IRANSansX"
              classNames={{
                content: "relative top-px",
              }}
              style={{
                backgroundColor: sizeColor,
                color: "var(--color-gray12)",
                direction: "ltr",
                gap: "0.3rem",
                textAlign: "center",
                padding: "0.75rem 0.5rem 0.75rem 0.75rem",
                cursor: "default",
                fontSize: "var(--font-size-xs)",
              }}
              variant="flat"
              startContent={
                <Icon
                  icon="material-symbols:folder-open-rounded"
                  width={12}
                  height={12}
                />
              }
            >
              {formatSize(size)}
            </Chip>
          </div>
        </CardHeader>
        <CardBody className="mt-8">
          <h2
            className="text-lg font-medium mb-0 force-ltr"
            style={{ textAlign: "left" }}
          >
            {title}
          </h2>
          <div className="flex justify-end gap-2 mt-4 mb-6 ">
            {(Object.keys(dataTypeIcons) as DataType[]).map((key) => {
              const iconData = dataTypeIcons[key]
              const isAvailable = dataTypes.includes(key)
              const color = isAvailable
                ? `var(${iconData.color})`
                : "var(--color-gray5)"

              const tooltipBgClass = isAvailable
                ? dataTypeTooltipBg[key]
                : "bg-[var(--color-gray5)]"

              return (
                <Tooltip
                  key={key}
                  isOpen={openTooltips[key] || false}
                  content={key.charAt(0).toUpperCase() + key.slice(1)}
                  classNames={{
                    content: `text-white ${tooltipBgClass} text-xs pt-1.5 pb-0.5`,
                  }}
                >
                  <div
                    onMouseEnter={() => handleTooltipOpen(key)}
                    onMouseLeave={() => handleTooltipClose(key)}
                  >
                    <Icon
                      icon={iconData.icon}
                      width={iconData.width}
                      height={iconData.height}
                      style={{ ...iconData.style, color }}
                    />
                  </div>
                </Tooltip>
              )
            })}
          </div>
          <p
            className="text-default-500 force-ltr"
            style={{ textAlign: "justify", fontSize: "var(--font-size-sm)" }}
          >
            {description}
          </p>
          <div className="flex gap-2 mt-6 flex-wrap justify-end">
            {tags.map((tag) => (
              <Chip
                key={tag}
                variant="flat"
                className="pt-0.5 cursor-default force-ltr"
                style={{
                  backgroundColor: "var(--color-gray9)",
                  color: "var(--color-gray2)",
                  fontSize: "var(--font-size-xs)",
                }}
              >
                {tag}
              </Chip>
            ))}
          </div>
        </CardBody>
        <CardFooter className="gap-3 mt-8 flex justify-center">
          <Button
            as="a"
            href={reference}
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            variant="solid"
            className="w-fit px-8 py-4 rounded-full cursor-pointer"
            style={{ fontSize: "var(--font-size-sm)" }}
          >
            درخواست داده
          </Button>
          <Button
            color="default"
            variant="solid"
            className="w-fit px-8 py-4 rounded-full cursor-pointer"
            style={{ fontSize: "var(--font-size-sm)" }}
            onPress={() => setIsModalOpen(true)}
          >
            اطلاعات بیشتر
          </Button>
        </CardFooter>
      </Card>
      <InfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        database={database}
      />
    </>
  )
}
