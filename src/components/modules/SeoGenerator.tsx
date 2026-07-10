"use client"

import { useState } from "react"
import { Copy, Loader2, Sparkles, CheckCircle2, XCircle, SearchCode } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export function SeoGenerator() {
  const [content, setContent] = useState("")
  const [keyword, setKeyword] = useState("")
  const [country, setCountry] = useState("us")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const res = await fetch("/api/generate-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, keyword, country }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate SEO')
      }
      setResults(data)
    } catch (err: any) {
      console.error("Failed to generate SEO", err)
      setError(err.message || "An error occurred while generating SEO")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
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
          SEO Generator
        </h2>
        <p className="text-muted-foreground mt-1">Generate high CTR SEO metadata from your content.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* INPUT SECTION */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-20 self-start">
          <Card className="border-muted/60 shadow-sm bg-gradient-to-b from-card to-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Input Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="content">Clean Article Content</Label>
                <Textarea 
                  id="content" 
                  placeholder="Paste your cleaned HTML or plain text here..." 
                  className="min-h-[200px] resize-y bg-background/50 focus-visible:bg-background transition-colors"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="keyword">Target Keyword (Optional)</Label>
                <Input 
                  id="keyword" 
                  placeholder="e.g. SEO best practices" 
                  className="bg-background/50 focus-visible:bg-background transition-colors"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Target Country</Label>
                <Select value={country} onValueChange={(val) => setCountry(val || 'Global')}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States (US)</SelectItem>
                    <SelectItem value="uk">United Kingdom (UK)</SelectItem>
                    <SelectItem value="ca">Canada (CA)</SelectItem>
                    <SelectItem value="au">Australia (AU)</SelectItem>
                    <SelectItem value="global">Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full h-11 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]" 
                onClick={handleGenerate} 
                disabled={loading || !content}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate SEO Metadata
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

          {results && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="border-muted/60 shadow-sm bg-gradient-to-b from-card to-card/50">
                <CardHeader>
                  <CardTitle className="text-lg">Content Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 p-3 rounded-lg bg-background/50 border border-border/50">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Word Count</p>
                        <p className="text-2xl font-bold">{results.insights.wordCount}</p>
                      </div>
                      <div className="space-y-1 p-3 rounded-lg bg-background/50 border border-border/50">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reading Time</p>
                        <p className="text-2xl font-bold">{results.insights.readingTime}m</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Entities Found</p>
                      <div className="flex flex-wrap gap-2">
                        {results.insights.entities.map((entity: string) => (
                          <Badge key={entity} variant="secondary" className="bg-primary/10 hover:bg-primary/20 text-primary border-0">
                            {entity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* OUTPUT SECTION */}
        <div className="lg:col-span-2">
          {!results ? (
            <Card className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed border-muted/60 bg-transparent shadow-none">
              <div className="text-center text-muted-foreground p-8">
                <SearchCode className="mx-auto h-12 w-12 opacity-20 mb-4" />
                <h3 className="text-lg font-semibold">No data generated yet</h3>
                <p className="text-sm max-w-sm mx-auto mt-2">
                  Paste your article content and hit generate to see AI-optimized titles, descriptions, and metadata.
                </p>
              </div>
            </Card>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Tabs defaultValue="meta" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
                  <TabsTrigger value="meta">Meta & URL</TabsTrigger>
                  <TabsTrigger value="social">Social Cards</TabsTrigger>
                  <TabsTrigger value="keywords">Keywords</TabsTrigger>
                  <TabsTrigger value="schema">Schema</TabsTrigger>
                </TabsList>
                
                <TabsContent value="meta" className="space-y-4 mt-4">
                  <Card className="border-muted/60 shadow-sm">
                    <CardHeader className="pb-3 bg-muted/10">
                      <CardTitle className="text-lg">Title Options</CardTitle>
                      <CardDescription>Target 50-60 characters for best display</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      {results.titles.map((title: any, idx: number) => (
                        <div key={idx} className="flex items-start justify-between p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/50 hover:border-accent transition-all group">
                          <div className="space-y-1">
                            <p className="font-medium text-sm">{title.text}</p>
                            <div className="flex items-center space-x-4 text-xs">
                              <span className="text-muted-foreground">Length: <span className={title.length > 60 ? "text-destructive font-semibold" : "text-emerald-500 font-semibold"}>{title.length}</span></span>
                              <span className="text-muted-foreground">Score: <span className="font-semibold text-primary">{title.score}/100</span></span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCopy(title.text)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-muted/60 shadow-sm">
                    <CardHeader className="pb-3 bg-muted/10">
                      <CardTitle className="text-lg">Meta Descriptions</CardTitle>
                      <CardDescription>Target 140-160 characters</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      {results.descriptions.map((desc: any, idx: number) => (
                        <div key={idx} className="flex items-start justify-between p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/50 hover:border-accent transition-all group">
                          <div className="space-y-1 pr-4">
                            <p className="text-sm">{desc.text}</p>
                            <div className="flex items-center space-x-4 text-xs pt-1">
                              <span className="text-muted-foreground">Length: <span className={desc.length > 160 ? "text-destructive font-semibold" : "text-emerald-500 font-semibold"}>{desc.length}</span></span>
                              <span className="text-muted-foreground">Score: <span className="font-semibold text-primary">{desc.score}/100</span></span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCopy(desc.text)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <Card className="border-muted/60 shadow-sm">
                    <CardHeader className="pb-3 bg-muted/10">
                      <CardTitle className="text-lg">URL Slug</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-2">
                        <Input readOnly value={results.slug} className="font-mono text-sm bg-background/50" />
                        <Button variant="outline" size="icon" onClick={() => handleCopy(results.slug)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="social" className="space-y-4 mt-4">
                  <Card className="border-muted/60 shadow-sm">
                    <CardHeader className="bg-muted/10">
                      <CardTitle className="text-lg">OpenGraph (Facebook/LinkedIn)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>OG Title</Label>
                        <div className="flex items-center space-x-2">
                          <Input readOnly value={results.ogMetadata.title} className="bg-background/50" />
                          <Button variant="outline" size="icon" onClick={() => handleCopy(results.ogMetadata.title)}><Copy className="h-4 w-4" /></Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>OG Description</Label>
                        <div className="flex items-center space-x-2">
                          <Textarea readOnly value={results.ogMetadata.description} className="resize-none bg-background/50" />
                          <Button variant="outline" size="icon" className="h-[80px]" onClick={() => handleCopy(results.ogMetadata.description)}><Copy className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="keywords" className="space-y-4 mt-4">
                  <Card className="border-muted/60 shadow-sm">
                    <CardHeader className="bg-muted/10">
                      <CardTitle className="text-lg">Keyword Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                      <div>
                        <h4 className="font-semibold mb-3 text-xs text-muted-foreground uppercase tracking-wider">Primary Keyword</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className="text-sm py-1 px-3 shadow-sm" variant="default">{results.primaryKeyword}</Badge>
                          <Badge variant="outline" className="text-xs">Intent: {results.intent}</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3 text-xs text-muted-foreground uppercase tracking-wider">Secondary Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {results.secondaryKeywords.map((kw: string) => (
                            <Badge key={kw} variant="secondary" className="cursor-pointer hover:bg-secondary/80 text-xs font-normal">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-muted/60 shadow-sm">
                    <CardHeader className="bg-muted/10">
                      <CardTitle className="text-lg">SEO Checklist</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ul className="space-y-3">
                        {results.checklist.map((item: any, idx: number) => (
                          <li key={idx} className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent/30 transition-colors">
                            {item.passed ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            <span className={item.passed ? "text-foreground font-medium text-sm" : "text-muted-foreground text-sm"}>{item.task}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="schema" className="space-y-4 mt-4">
                  <Card className="border-muted/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/10">
                      <CardTitle className="text-lg pt-2">Article Schema (JSON-LD)</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => handleCopy(JSON.stringify(results.schema, null, 2))}>
                        <Copy className="mr-2 h-4 w-4" /> Copy Code
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <pre className="bg-black/90 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono shadow-inner border border-border/50">
                        {JSON.stringify(results.schema, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
