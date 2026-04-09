/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  History, 
  Users, 
  MapPin, 
  Lightbulb, 
  ScrollText, 
  Sparkles, 
  Send, 
  Loader2,
  BookOpen,
  Calendar,
  Quote,
  FileUp,
  Share2,
  Network,
  ShieldCheck,
  GitBranch,
  Terminal,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { weaveWisdom, WisdomGraph, generateAgentExports, AgentExports } from '@/services/geminiService';
import { cn } from '@/lib/utils';

export default function App() {
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [graph, setGraph] = useState<WisdomGraph | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [isCommitted, setIsCommitted] = useState(false);
  const [exports, setExports] = useState<AgentExports | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleWeave = async () => {
    if (!transcript.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    setIsCommitted(false);
    try {
      const result = await weaveWisdom(transcript);
      setGraph(result);
      setIsReviewing(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommit = () => {
    setIsReviewing(false);
    setIsCommitted(true);
  };

  const handleExport = async () => {
    if (!graph) return;
    setIsExporting(true);
    try {
      const result = await generateAgentExports(graph);
      setExports(result);
    } catch (err) {
      setError('Failed to generate agentic exports');
    } finally {
      setIsExporting(false);
    }
  };

  const filterNodes = <T extends { tags: string[], [key: string]: any }>(nodes: T[] | undefined) => {
    if (!nodes) return [];
    if (!searchQuery.trim()) return nodes;
    
    const query = searchQuery.toLowerCase();
    return nodes.filter(node => {
      const inTags = node.tags.some(tag => tag.toLowerCase().includes(query));
      const inContent = Object.values(node).some(val => 
        typeof val === 'string' && val.toLowerCase().includes(query)
      );
      return inTags || inContent;
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-semibold">Legacy-Loom</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-sans">Oral History Preservation Engine</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <span className="hover:text-primary cursor-pointer transition-colors">Archive</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Methodology</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Ethos</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="archival-border shadow-none bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Narrative Thread Input
              </CardTitle>
              <CardDescription>
                Upload audio or paste a transcript. The Initial Weaver will process it into the Legacy-Loom.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-10 text-xs uppercase tracking-widest" onClick={() => document.getElementById('file-upload')?.click()}>
                  <FileUp className="w-4 h-4 mr-2" />
                  Upload Audio
                </Button>
                <input 
                  id="file-upload" 
                  type="file" 
                  accept="audio/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setTranscript(`[Audio File Uploaded: ${file.name}]\n\n(Simulated transcription for demo purposes)`);
                    }
                  }}
                />
              </div>
              <Textarea
                placeholder="Example: 'I remember back in 1954, the winter was particularly harsh in Seoul...'"
                className="min-h-[350px] resize-none font-serif text-lg leading-relaxed bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
              <Button 
                onClick={handleWeave} 
                disabled={isProcessing || !transcript.trim()}
                className="w-full h-12 text-lg font-serif"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Weaving Wisdom...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Process Oral History
                  </>
                )}
              </Button>
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                  {error}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="p-6 archival-border rounded-xl bg-muted/20 space-y-4">
            <h3 className="font-serif text-lg font-medium flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Enterprise Compliance
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">GDPR Compliance</span>
                <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-50">Active</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Ethical AI Mapping</span>
                <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-50">Verified</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Git-Native Identity</span>
                <Badge variant="outline" className="text-[10px] text-primary border-primary/20">Configured</Badge>
              </div>
            </div>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              GitAgent ensures all learned behaviors are version-controlled and reviewed via human-in-the-loop PRs.
            </p>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!graph ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 archival-border rounded-2xl bg-white/50 border-dashed"
              >
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                  <ScrollText className="w-10 h-10 text-muted-foreground/40" />
                </div>
                <h2 className="text-2xl font-serif mb-2">Awaiting the Story</h2>
                <p className="text-muted-foreground max-w-xs">
                  Input a transcript to begin the preservation process. The Wisdom Graph will appear here.
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-serif">Wisdom Graph</h2>
                      {isReviewing && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Review Required (PR #1)
                        </Badge>
                      )}
                      {isCommitted && (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Committed to Main
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isReviewing && (
                        <Button 
                          size="sm" 
                          className="font-sans text-xs uppercase tracking-widest bg-amber-600 hover:bg-amber-700"
                          onClick={handleCommit}
                        >
                          Approve & Commit
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="font-sans text-xs uppercase tracking-widest"
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(graph, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'wisdom-graph.json';
                          a.click();
                        }}
                      >
                        Export JSON
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90" />
                    <input
                      type="text"
                      placeholder="Filter by tag or keyword..."
                      className="w-full pl-10 pr-4 py-2 bg-white archival-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 font-sans text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <Tabs defaultValue="report" className="w-full">
                  <TabsList className="w-full bg-muted/50 p-1 archival-border h-auto flex-wrap justify-start">
                    <TabsTrigger value="report" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2 px-4">
                      <ScrollText className="w-4 h-4 mr-2" />
                      Narrative Report
                    </TabsTrigger>
                    <TabsTrigger value="events" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2 px-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      Events
                    </TabsTrigger>
                    <TabsTrigger value="people" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2 px-4">
                      <Users className="w-4 h-4 mr-2" />
                      People
                    </TabsTrigger>
                    <TabsTrigger value="locations" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2 px-4">
                      <MapPin className="w-4 h-4 mr-2" />
                      Places
                    </TabsTrigger>
                    <TabsTrigger value="wisdom" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2 px-4">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Wisdom
                    </TabsTrigger>
                    <TabsTrigger value="graph" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2 px-4">
                      <Network className="w-4 h-4 mr-2" />
                      Graph
                    </TabsTrigger>
                    <TabsTrigger value="gitagent" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2 px-4">
                      <GitBranch className="w-4 h-4 mr-2" />
                      GitAgent
                    </TabsTrigger>
                    <TabsTrigger value="threads" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2 px-4">
                      <Quote className="w-4 h-4 mr-2" />
                      Threads
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-6">
                    <TabsContent value="report" className="m-0">
                      <Card className="wisdom-card prose prose-stone max-w-none">
                        <div className="markdown-body">
                          <ReactMarkdown>{graph.narrativeReport}</ReactMarkdown>
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="events" className="m-0 space-y-4">
                      {filterNodes(graph.events).map((event, i) => (
                        <Card key={i} className="wisdom-card">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-xl font-serif font-semibold text-primary">{event.title}</h3>
                              <Badge variant="secondary" className="mt-1 text-[10px] uppercase tracking-widest">{event.lifecycleStage}</Badge>
                            </div>
                            {event.date && <Badge variant="secondary" className="font-sans">{event.date}</Badge>}
                          </div>
                          <p className="text-muted-foreground leading-relaxed mb-4">{event.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {event.tags.map((tag, ti) => (
                              <Badge key={ti} variant="outline" className="text-[10px] bg-muted/20 border-none">#{tag}</Badge>
                            ))}
                          </div>

                          {(event.historicalContext || event.impactMetrics) && (
                            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                              <h4 className="text-xs uppercase tracking-widest font-sans font-semibold text-accent mb-2 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" />
                                Historical Enrichment
                              </h4>
                              {event.historicalContext && <p className="text-sm italic mb-2">{event.historicalContext}</p>}
                              {event.impactMetrics && <p className="text-xs text-muted-foreground">{event.impactMetrics}</p>}
                            </div>
                          )}
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="people" className="m-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filterNodes(graph.people).map((person, i) => (
                        <Card key={i} className="wisdom-card">
                          <h3 className="text-lg font-serif font-semibold text-primary">{person.name}</h3>
                          <p className="text-xs uppercase tracking-wider text-accent font-medium mb-2">{person.role}</p>
                          <p className="text-sm text-muted-foreground mb-4">{person.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {person.tags.map((tag, ti) => (
                              <Badge key={ti} variant="outline" className="text-[10px] bg-muted/20 border-none">#{tag}</Badge>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="locations" className="m-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filterNodes(graph.locations).map((loc, i) => (
                        <Card key={i} className="wisdom-card">
                          <h3 className="text-lg font-serif font-semibold text-primary flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-accent" />
                            {loc.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-2 mb-4">{loc.significance}</p>
                          <div className="flex flex-wrap gap-2">
                            {loc.tags.map((tag, ti) => (
                              <Badge key={ti} variant="outline" className="text-[10px] bg-muted/20 border-none">#{tag}</Badge>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="wisdom" className="m-0 space-y-4">
                      {filterNodes(graph.wisdom).map((w, i) => (
                        <Card key={i} className="wisdom-card border-l-4 border-l-primary">
                          <Quote className="w-8 h-8 text-primary/10 mb-2" />
                          <h3 className="text-xl font-serif italic mb-3">"{w.lesson}"</h3>
                          <Separator className="my-3 opacity-50" />
                          <p className="text-sm text-muted-foreground mb-4">
                            <span className="font-sans font-semibold uppercase text-[10px] tracking-widest mr-2">Context:</span>
                            {w.context}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {w.tags.map((tag, ti) => (
                              <Badge key={ti} variant="outline" className="text-[10px] bg-muted/20 border-none">#{tag}</Badge>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="graph" className="m-0 space-y-4">
                      {graph.linkedEntities.map((link, i) => (
                        <Card key={i} className="wisdom-card flex items-center gap-4">
                          <div className="flex-1 text-right font-serif font-medium">{link.source}</div>
                          <div className="flex flex-col items-center gap-1">
                            <Badge variant="outline" className="text-[10px] uppercase tracking-tighter">{link.relationship}</Badge>
                            <div className="h-px w-12 bg-border relative">
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-border rounded-full" />
                            </div>
                          </div>
                          <div className="flex-1 font-serif font-medium">{link.target}</div>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="gitagent" className="m-0 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="archival-border bg-white">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Terminal className="w-5 h-5 text-primary" />
                              Agentic Soul Export
                            </CardTitle>
                            <CardDescription>
                              Export this storyteller's persona to modern agent runtimes.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button 
                              onClick={handleExport} 
                              disabled={isExporting}
                              className="w-full"
                            >
                              {isExporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                              Generate Framework Payloads
                            </Button>
                          </CardContent>
                        </Card>

                        <Card className="archival-border bg-white">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <GitBranch className="w-5 h-5 text-primary" />
                              Versioned Memory
                            </CardTitle>
                            <CardDescription>
                              Human-readable Markdown memory for Git-Native identity.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button variant="outline" className="w-full" onClick={() => {
                              const blob = new Blob([graph.narrativeReport], { type: 'text/markdown' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'MEMORY.md';
                              a.click();
                            }}>
                              Download MEMORY.md
                            </Button>
                          </CardContent>
                        </Card>
                      </div>

                      {exports && (
                        <div className="space-y-4">
                          <h3 className="font-serif text-xl">Framework Payloads</h3>
                          <div className="grid grid-cols-1 gap-4">
                            {Object.entries(exports).map(([key, value]) => (
                              <Card key={key} className="archival-border bg-muted/10">
                                <CardHeader className="py-3">
                                  <CardTitle className="text-sm uppercase tracking-widest flex items-center justify-between">
                                    {key}
                                    <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(value)}>Copy</Button>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <pre className="text-[10px] font-mono bg-white p-3 rounded border border-border overflow-x-auto max-h-40">
                                    {value}
                                  </pre>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="threads" className="m-0 space-y-4">
                      {filterNodes(graph.goldenThreads).map((thread, i) => (
                        <Card key={i} className="wisdom-card bg-primary/5 border-primary/20">
                          <h3 className="text-xl font-serif font-semibold text-primary mb-2 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            {thread.theme}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed mb-4">
                            <span className="font-sans font-semibold uppercase text-[10px] tracking-widest block mb-1">Evidence in Narrative:</span>
                            {thread.evidence}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {thread.tags.map((tag, ti) => (
                              <Badge key={ti} variant="outline" className="text-[10px] bg-muted/20 border-none">#{tag}</Badge>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </TabsContent>
                  </div>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="border-t border-border py-8 bg-muted/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2026 Legacy-Loom. Preserving the human experience.</p>
          <div className="flex gap-6">
            <span>Privacy Protocol</span>
            <span>Ethical AI Guidelines</span>
            <span>Export Wisdom Graph</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
