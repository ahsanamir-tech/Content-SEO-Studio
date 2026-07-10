"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Code2, Image as ImageIcon, LayoutDashboard, SearchCode } from "lucide-react"
import { Suspense } from "react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/",
    tab: null,
    icon: LayoutDashboard,
  },
  {
    title: "HTML Cleaner",
    href: "/?tab=html-cleaner",
    tab: "html-cleaner",
    icon: Code2,
  },
  {
    title: "SEO Generator",
    href: "/?tab=seo-generator",
    tab: "seo-generator",
    icon: SearchCode,
  },
  {
    title: "Image Creator",
    href: "/?tab=feature-image",
    tab: "feature-image",
    icon: ImageIcon,
  },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

function SidebarContent({ className, ...props }: SidebarProps) {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab")

  return (
    <div className={cn("pb-12 border-r h-[calc(100vh-3.5rem)] bg-background/50 backdrop-blur-sm", className)} {...props}>
      <div className="space-y-4 py-6">
        <div className="px-4 py-2">
          <div className="space-y-2">
            {sidebarNavItems.map((item) => {
              const isActive = activeTab === item.tab
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
                    "w-full justify-start h-10 px-3 transition-all relative overflow-hidden group",
                    isActive 
                      ? "bg-primary/10 text-primary hover:bg-primary/15 font-semibold" 
                      : "hover:bg-muted font-medium text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                  )}
                  <item.icon className={cn("mr-3 h-4 w-4", isActive ? "text-primary" : "opacity-70 group-hover:opacity-100 transition-opacity")} />
                  {item.title}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Sidebar(props: SidebarProps) {
  return (
    <Suspense fallback={<div className="w-full h-full border-r bg-background/50" />}>
      <SidebarContent {...props} />
    </Suspense>
  )
}
