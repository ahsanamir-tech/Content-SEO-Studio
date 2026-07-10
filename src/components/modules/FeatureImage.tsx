"use client"

import { useState } from "react"
import { Copy, Download, Image as ImageIcon, Loader2, RefreshCw, Star, Settings } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function FeatureImage() {
  const [topic, setTopic] = useState("")
  const [style, setStyle] = useState("Professional Blog")
  const [size, setSize] = useState("1200x630")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, style, size }),
      })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate images')
      }
      
      setResults(data)
    } catch (err: any) {
      console.error("Failed to generate image", err)
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = filename || "feature-image.jpg"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error("Download failed, opening in new tab", err)
      window.open(url, "_blank")
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          Feature Image Creator
        </h2>
        <p className="text-muted-foreground mt-1">Generate professional images automatically from your content using Gemini AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
        {/* INPUT SECTION */}
        <div className="space-y-6">
          <Card className="border-muted/60 shadow-sm bg-gradient-to-b from-card to-card/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Settings className="mr-2 h-4 w-4 text-primary" />
                Generation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic / Keywords</Label>
                <Textarea 
                  id="topic" 
                  placeholder="e.g. Artificial Intelligence in modern healthcare" 
                  className="min-h-[100px] resize-y bg-background/50 focus-visible:bg-background"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Style Preset</Label>
                <Select value={style} onValueChange={(val) => setStyle(val || '')}>
                  <SelectTrigger className="bg-background/50 focus:bg-background">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professional Blog">Professional Blog</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                    <SelectItem value="SaaS">SaaS</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Minimal">Minimal</SelectItem>
                    <SelectItem value="3D">3D Render</SelectItem>
                    <SelectItem value="Illustration">Vector Illustration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Image Dimensions</Label>
                <Select value={size} onValueChange={(val) => setSize(val || '')}>
                  <SelectTrigger className="bg-background/50 focus:bg-background">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1200x630">16:9 (Facebook/OG)</SelectItem>
                    <SelectItem value="1024x1024">1:1 (Instagram/Square)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full mt-4 h-11 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]" 
                onClick={handleGenerate} 
                disabled={loading || !topic}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Images...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Generate 4 Variations
                  </>
                )}
              </Button>

              {error && (
                <div className="p-3 text-sm rounded-md bg-destructive/10 text-destructive border border-destructive/20 mt-4">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* OUTPUT SECTION */}
        <div className="space-y-6 flex flex-col">
          {!results ? (
            <Card className="flex-1 flex items-center justify-center min-h-[500px] border-2 border-dashed border-muted/60 bg-transparent shadow-none">
              <div className="text-center text-muted-foreground p-8">
                <ImageIcon className="mx-auto h-16 w-16 opacity-20 mb-4" />
                <h3 className="text-xl font-semibold">Ready to create visuals</h3>
                <p className="text-sm max-w-sm mx-auto mt-2">
                  Enter a topic and select your styling. We will generate 4 unique feature image variations optimized for your blog and social media.
                </p>
              </div>
            </Card>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.images.map((img: any, idx: number) => (
                  <motion.div 
                    key={img.id} 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="overflow-hidden group relative border-2 border-muted/60 hover:border-primary transition-all shadow-md">
                      <div className="aspect-[1200/630] relative bg-muted overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={img.url} 
                          alt="Generated preview" 
                          className="object-cover w-full h-full group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-in-out" 
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                          <div className="flex gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="shadow-lg hover:scale-105 transition-transform"
                              onClick={() => handleDownload(img.url, `${results.metadata.filename.replace('.jpg', '')}-${idx + 1}.jpg`)}
                            >
                              <Download className="mr-2 h-4 w-4" /> Download
                            </Button>
                            <Button variant="secondary" size="icon" title="Favorite" className="shadow-lg hover:scale-105 transition-transform hover:text-yellow-500">
                              <Star className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card className="border-muted/60 shadow-sm bg-gradient-to-b from-card to-card/50">
                <CardHeader className="bg-muted/10 pb-4">
                  <CardTitle className="text-lg">SEO Image Assets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground uppercase text-xs tracking-wider">Optimized Filename</Label>
                      <div className="flex items-center space-x-2">
                        <Input readOnly value={results.metadata.filename} className="font-mono text-sm bg-background/50 border-border/50" />
                        <Button variant="outline" size="icon" onClick={() => handleCopy(results.metadata.filename)}><Copy className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground uppercase text-xs tracking-wider">Alt Text</Label>
                      <div className="flex items-center space-x-2">
                        <Input readOnly value={results.metadata.altText} className="bg-background/50 border-border/50" />
                        <Button variant="outline" size="icon" onClick={() => handleCopy(results.metadata.altText)}><Copy className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
