import React, { useState, useEffect } from "react"
import { getPageData } from "../dataset_services/api"
import { Hero } from "../components/marketing/Hero"
import { FeatureGrid } from "../components/marketing/FeatureGrid"
import { CallToAction } from "../components/marketing/CallToAction"

type ComponentMap = Record<string, React.ComponentType<any>>

const componentMap: ComponentMap = {
  Hero: Hero,
  FeatureGrid: FeatureGrid,
  CallToAction: CallToAction,
}

interface PageProps {
  pageName: string
}

interface PageContentSection {
  component: string
  props?: Record<string, unknown>
}

interface PageContent {
  sections: PageContentSection[]
}

const Page: React.FC<PageProps> = ({ pageName }) => {
  const [pageData, setPageData] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true)
        const response = await getPageData(pageName)
        const page = response.data as { content: unknown }

        let contentData: unknown = (page as any).content
        if (typeof contentData === "string") {
          try {
            contentData = JSON.parse(contentData)
          } catch (e) {
            console.error("Failed to parse page content:", e)
            setError(`Failed to parse content for ${pageName} page.`)
            return
          }
        }

        // Basic shape validation
        if (
          contentData &&
          typeof contentData === "object" &&
          Array.isArray((contentData as any).sections)
        ) {
          setPageData(contentData as PageContent)
        } else {
          setError(`Invalid content structure for ${pageName} page.`)
          return
        }
      } catch (err) {
        setError(`Failed to load ${pageName} page data.`)
        console.error(`Error fetching ${pageName} page data:`, err)
      } finally {
        setLoading(false)
      }
    }

    fetchPageData()
  }, [pageName])

  if (loading)
    return <div className="page-content text-center">در حال بارگذاری...</div>
  if (error)
    return <div className="page-content text-center" style={{ color: "var(--color-red)" }}>{error}</div>
  if (!pageData || !pageData.sections)
    return <div className="page-content text-center">محتوای صفحه یافت نشد.</div>

  return (
    <div>
      {pageData.sections.map((section, index: number) => {
        const Component = componentMap[String(section.component)]
        return Component ? (
          <Component key={index} {...(section.props as any)} />
        ) : null
      })}
    </div>
  )
}

export default Page
