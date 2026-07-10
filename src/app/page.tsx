"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Code2, Image as ImageIcon, SearchCode, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HtmlCleaner } from "@/components/modules/HtmlCleaner"
import { SeoGenerator } from "@/components/modules/SeoGenerator"
import { FeatureImage } from "@/components/modules/FeatureImage"

function DashboardContent() {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab")

  if (tab === "html-cleaner") return <HtmlCleaner />
  if (tab === "seo-generator") return <SeoGenerator />
  if (tab === "feature-image") return <FeatureImage />

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Welcome to Studio
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">Select a module below to optimize your content workflow.</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Link href="/?tab=html-cleaner" className="block h-full">
            <Card className="hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer h-full flex flex-col bg-gradient-to-br from-card to-card/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Module 1</CardTitle>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Code2 className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between pt-4">
                <div className="text-2xl font-bold mb-4">HTML Cleaner</div>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                  Convert messy pasted HTML from WordPress, Google Docs, or AI into clean SEO-friendly publishing HTML.
                </p>
                <div className="text-sm font-medium text-primary flex items-center mt-auto group">
                  Open Tool <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Link href="/?tab=seo-generator" className="block h-full">
            <Card className="hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer h-full flex flex-col bg-gradient-to-br from-card to-card/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Module 2</CardTitle>
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <SearchCode className="h-5 w-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between pt-4">
                <div className="text-2xl font-bold mb-4">SEO Generator</div>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                  Generate high CTR SEO metadata, titles, descriptions, and schema from your article content automatically.
                </p>
                <div className="text-sm font-medium text-blue-500 flex items-center mt-auto group">
                  Open Tool <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Link href="/?tab=feature-image" className="block h-full">
            <Card className="hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer h-full flex flex-col bg-gradient-to-br from-card to-card/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Module 3</CardTitle>
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between pt-4">
                <div className="text-2xl font-bold mb-4">Image Creator</div>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                  Generate professional feature images automatically from article content with your brand styling.
                </p>
                <div className="text-sm font-medium text-emerald-500 flex items-center mt-auto group">
                  Open Tool <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }} className="mt-12">
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <LayoutDashboard className="mr-2 h-5 w-5 text-muted-foreground" />
          Recent Activity
        </h3>
        <Card className="border-dashed border-2 bg-transparent shadow-none">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center space-y-4 text-center text-muted-foreground">
              <div className="p-4 rounded-full bg-muted/50">
                <Code2 className="h-8 w-8 opacity-40" />
              </div>
              <p className="text-lg font-medium">No recent activity found</p>
              <p className="text-sm max-w-sm">Start using the modules above to generate content and your history will appear here.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="flex-1 p-4 md:p-8 pt-6 h-full flex flex-col overflow-hidden">
      <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-pulse flex flex-col items-center"><div className="h-12 w-12 rounded-full bg-muted mb-4"></div><div className="h-4 w-32 bg-muted rounded"></div></div></div>}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
