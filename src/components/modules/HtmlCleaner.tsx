"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Copy, Download, Trash2, Search, Replace, Sparkles, FileText, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import "react-quill-new/dist/quill.snow.css"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cleanHtml, CleanerOptions } from "@/lib/htmlCleaner"

// Dynamically import react-quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false, loading: () => <div className="h-[400px] w-full flex items-center justify-center bg-muted/20">Loading Editor...</div> })

export function HtmlCleaner() {
  const [inputHtml, setInputHtml] = useState("")
  const [outputHtml, setOutputHtml] = useState("")
  const [activeTab, setActiveTab] = useState("clean")
  
  // Find & Replace
  const [findText, setFindText] = useState("")
  const [replaceText, setReplaceText] = useState("")
  
  // Lorem Ipsum
  const [loremParagraphs, setLoremParagraphs] = useState("5")

  // Content Summary
  const [summary, setSummary] = useState("")
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summaryCopied, setSummaryCopied] = useState(false)

  // Cleaning Options State
  const [options, setOptions] = useState<CleanerOptions>({
    removeTagAttributes: false,
    removeInlineStyles: true,
    removeClassesAndIds: true,
    removeAllTags: false,
    removeSuccessiveNbsps: true,
    removeEmptyTags: false,
    removeTagsWithOneNbsp: true,
    removeSpanTags: true,
    removeImages: false,
    removeLinks: false,
    removeTables: false,
    replaceTableTagsWithDivs: false,
    removeComments: true,
    setNewLinesAndTextIndents: false,
  })

  const toggleOption = (key: keyof CleanerOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Pretty-print HTML with proper indentation
  const formatHtml = (html: string): string => {
    let formatted = '';
    let indent = 0;
    const tab = '  ';
    // Split on tags while keeping them
    const tokens = html.replace(/>/g, '>\n').replace(/</g, '\n<').split('\n').filter(t => t.trim() !== '');
    
    tokens.forEach(token => {
      const trimmed = token.trim();
      if (!trimmed) return;
      
      // Closing tag
      if (trimmed.match(/^<\/[^>]+>$/)) {
        indent = Math.max(0, indent - 1);
        formatted += tab.repeat(indent) + trimmed + '\n';
      }
      // Self-closing tag
      else if (trimmed.match(/^<[^>]+\/>$/) || trimmed.match(/^<(br|hr|img|input|meta|link)\b[^>]*>$/i)) {
        formatted += tab.repeat(indent) + trimmed + '\n';
      }
      // Opening tag
      else if (trimmed.match(/^<[^\/][^>]*>$/)) {
        formatted += tab.repeat(indent) + trimmed + '\n';
        indent++;
      }
      // Text content
      else {
        formatted += tab.repeat(indent) + trimmed + '\n';
      }
    });
    
    return formatted.trim();
  }

  const handleClean = () => {
    const cleaned = cleanHtml(inputHtml, options)
    setOutputHtml(cleaned)
  }

  const handleFindReplace = () => {
    if (!findText) return;
    const regex = new RegExp(findText, 'g');
    setOutputHtml(prev => prev.replace(regex, replaceText));
  }

  const handleGenerateLorem = () => {
    const count = parseInt(loremParagraphs) || 5;
    const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    const paras = Array(count).fill(`<p>${lorem}</p>`).join('\n');
    setInputHtml(prev => prev + '\n' + paras);
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summary)
    setSummaryCopied(true)
    setTimeout(() => setSummaryCopied(false), 2000)
  }

  const handleSummarize = async () => {
    const plainText = getPlainText()
    if (!plainText || plainText.trim().length < 20) return

    setIsSummarizing(true)
    setSummary("")
    try {
      const res = await fetch('/api/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: plainText.slice(0, 3000),
          type: 'summary'
        })
      })
      const data = await res.json()
      if (data.summary) {
        setSummary(data.summary)
      } else {
        // Fallback: extractive summary from first 3 sentences
        const sentences = plainText.match(/[^.!?]+[.!?]+/g) || [plainText]
        setSummary(sentences.slice(0, 3).join(' ').trim())
      }
    } catch {
      // Fallback: extractive summary
      const sentences = plainText.match(/[^.!?]+[.!?]+/g) || [plainText]
      setSummary(sentences.slice(0, 3).join(' ').trim())
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const getPlainText = () => {
    if (typeof window === "undefined") return ""
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = outputHtml
    return tempDiv.textContent || tempDiv.innerText || ""
  }

  const getMarkdown = () => {
    let md = outputHtml
    md = md.replace(/<h1>(.*?)<\/h1>/gi, "# $1\n\n")
    md = md.replace(/<h2>(.*?)<\/h2>/gi, "## $1\n\n")
    md = md.replace(/<h3>(.*?)<\/h3>/gi, "### $1\n\n")
    md = md.replace(/<p>(.*?)<\/p>/gi, "$1\n\n")
    md = md.replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    md = md.replace(/<em>(.*?)<\/em>/gi, "*$1*")
    md = md.replace(/<[^>]*>?/gm, '')
    return md.trim()
  }

  const getActiveContent = () => {
    if (activeTab === "clean") return outputHtml;
    if (activeTab === "text") return getPlainText();
    if (activeTab === "md") return getMarkdown();
    return outputHtml;
  }

  // ReactQuill modules
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            HTML Cleaner & Editor
          </h2>
          <p className="text-muted-foreground mt-1">Advanced visual editor with deep HTML cleaning tools.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="group" onClick={() => { setInputHtml(""); setOutputHtml(""); }}>
            <Trash2 className="mr-2 h-4 w-4 group-hover:text-destructive transition-colors" />
            Clear All
          </Button>
          <Button 
            className="shadow-md shadow-primary/20 transition-all hover:scale-[1.02]" 
            onClick={handleClean} 
            disabled={!inputHtml}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Clean HTML
          </Button>
        </div>
      </div>

      {/* TOP: Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ height: '500px' }}>
        
        {/* INPUT WYSIWYG */}
        <Card className="flex flex-col border-muted/60 shadow-sm overflow-hidden bg-background" style={{ height: '500px' }}>
          <CardHeader className="py-2 px-4 border-b bg-muted/20 shrink-0">
            <CardTitle className="text-sm font-medium flex items-center">
              Visual Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden quill-container">
             <ReactQuill 
                theme="snow" 
                value={inputHtml} 
                onChange={setInputHtml} 
                modules={modules}
                style={{ height: 'calc(100% - 42px)' }}
              />
          </CardContent>
        </Card>

        {/* OUTPUT */}
        <Card className="flex flex-col border-muted/60 shadow-sm overflow-hidden bg-gradient-to-b from-card to-card/50" style={{ height: '500px' }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <CardHeader className="py-2 px-4 border-b bg-muted/20 flex flex-row items-center justify-between space-y-0 shrink-0">
              <TabsList className="h-8 bg-background/50 border border-border/50">
                <TabsTrigger value="clean" className="text-xs px-3">Clean HTML</TabsTrigger>
                <TabsTrigger value="text" className="text-xs px-3">Text</TabsTrigger>
                <TabsTrigger value="md" className="text-xs px-3">Markdown</TabsTrigger>
              </TabsList>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="h-8 hover:text-primary transition-colors" onClick={() => handleCopy(getActiveContent())}>
                  <Copy className="h-4 w-4 mr-2" /> Copy
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary transition-colors" onClick={() => handleDownload(getActiveContent(), "cleaned.html")} title="Download">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full w-full">
                <TabsContent value="clean" className="m-0">
                  <pre className="w-full whitespace-pre-wrap break-words p-4 font-mono text-sm text-foreground/90 leading-relaxed">{formatHtml(outputHtml) || <span className="text-muted-foreground italic">Cleaned output will appear here</span>}</pre>
                </TabsContent>
                <TabsContent value="text" className="m-0">
                  <pre className="w-full whitespace-pre-wrap break-words p-4 font-mono text-sm text-foreground/90 leading-relaxed">{getPlainText() || <span className="text-muted-foreground italic">Text output will appear here</span>}</pre>
                </TabsContent>
                <TabsContent value="md" className="m-0">
                  <pre className="w-full whitespace-pre-wrap break-words p-4 font-mono text-sm text-foreground/90 leading-relaxed">{getMarkdown() || <span className="text-muted-foreground italic">Markdown output will appear here</span>}</pre>
                </TabsContent>
              </ScrollArea>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* BOTTOM: Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cleaning Options */}
        <Card className="lg:col-span-1 border-muted/60 shadow-sm">
          <CardHeader className="py-3 border-b bg-muted/20">
            <CardTitle className="text-sm font-medium">Cleaning options</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-3">
              {[
                { key: 'removeTagAttributes', label: 'Remove tag attributes' },
                { key: 'removeInlineStyles', label: 'Remove inline styles' },
                { key: 'removeClassesAndIds', label: 'Remove classes and IDs' },
                { key: 'removeAllTags', label: 'Remove all tags (strip HTML)' },
                { key: 'removeSuccessiveNbsps', label: 'Remove successive &nbsp;s' },
                { key: 'removeEmptyTags', label: 'Remove empty tags' },
                { key: 'removeTagsWithOneNbsp', label: 'Remove tags with one &nbsp;' },
                { key: 'removeSpanTags', label: 'Remove span tags' },
                { key: 'removeImages', label: 'Remove images' },
                { key: 'removeLinks', label: 'Remove links' },
                { key: 'removeTables', label: 'Remove tables' },
                { key: 'replaceTableTagsWithDivs', label: 'Replace table tags with <div>s' },
                { key: 'removeComments', label: 'Remove comments' },
                { key: 'setNewLinesAndTextIndents', label: 'Set new lines and text indents' },
              ].map((opt) => (
                <div key={opt.key} className="flex items-center space-x-2">
                  <Checkbox 
                    id={opt.key} 
                    checked={options[opt.key as keyof CleanerOptions]}
                    onCheckedChange={() => toggleOption(opt.key as keyof CleanerOptions)}
                  />
                  <Label htmlFor={opt.key} className="text-sm font-normal cursor-pointer leading-none">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Find/Replace & Lorem Ipsum */}
        <div className="lg:col-span-2 space-y-6">
          {/* Find and Replace */}
          <Card className="border-muted/60 shadow-sm">
            <CardHeader className="py-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-medium">Find and replace in HTML source</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <Label className="text-right">Find:</Label>
                <Input 
                  value={findText} 
                  onChange={(e) => setFindText(e.target.value)} 
                  placeholder="Text to find..."
                  className="bg-background/50"
                />
              </div>
              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <Label className="text-right">Replace with:</Label>
                <Input 
                  value={replaceText} 
                  onChange={(e) => setReplaceText(e.target.value)} 
                  placeholder="Replacement text..."
                  className="bg-background/50"
                />
              </div>
              <div className="flex justify-end">
                <Button variant="secondary" onClick={handleFindReplace} disabled={!findText || !outputHtml}>
                  <Replace className="w-4 h-4 mr-2" />
                  Replace All in Output
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lorem Ipsum */}
          <Card className="border-muted/60 shadow-sm">
            <CardHeader className="py-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-medium">Lorem-ipsum generator</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Label className="whitespace-nowrap">Number of paragraphs:</Label>
                <Select value={loremParagraphs} onValueChange={(val) => setLoremParagraphs(val || '5')}>
                  <SelectTrigger className="w-[100px] bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 5, 10].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleGenerateLorem} variant="outline">
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Summary for SEO */}
        <Card className="lg:col-span-3 border-muted/60 shadow-sm bg-gradient-to-r from-card to-card/80">
          <CardHeader className="py-3 border-b bg-muted/20">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-primary" />
                Content Summary for SEO Generator
              </span>
              <div className="flex items-center gap-2">
                {summary && (
                  <Button variant="ghost" size="sm" className="h-8" onClick={handleCopySummary}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    {summaryCopied ? 'Copied!' : 'Copy Summary'}
                  </Button>
                )}
                <Button 
                  variant="default" 
                  size="sm" 
                  className="h-8 shadow-sm" 
                  onClick={handleSummarize} 
                  disabled={!outputHtml || isSummarizing}
                >
                  {isSummarizing ? (
                    <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Summarizing...</>
                  ) : (
                    <><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Generate Summary</>
                  )}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {summary ? (
              <p className="text-sm leading-relaxed text-foreground/90">{summary}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Click "Generate Summary" after cleaning your HTML to create a brief content summary you can paste into the SEO Generator.</p>
            )}
          </CardContent>
        </Card>

      </div>
    </motion.div>
  )
}
