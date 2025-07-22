'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  FileText,
  Beaker,
  ClipboardCheck,
  Route,
  UploadCloud,
  Loader2,
  Lightbulb,
  AlertTriangle,
  DollarSign,
  ChevronRight,
  Sparkles,
  Search,
  Book,
  Scale,
  GanttChartSquare,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as actions from './actions';

const SAMPLE_TECHNICAL_DOCUMENTATION = `The BR-X10 is a novel stirred-tank bioreactor designed for mammalian cell culture. It features a 10L working volume with a borosilicate glass vessel. The system incorporates a magnetic-drive agitation system with a pitched-blade impeller, ensuring low-shear mixing. Key components include the agitation system, vessel, and headplate. Advanced process control is achieved via a dedicated PLC with a user-friendly HMI. Sensors for pH (range 6.0-8.0), dissolved oxygen (DO, 0-100% saturation), and temperature (25-45°C) are integrated. The sparging system uses a microporous sparger for efficient oxygen transfer. The system is designed for batch, fed-batch, and perfusion processes. Sterilization is performed via autoclaving. The headplate includes multiple ports for media addition, sampling, and sensor integration.`;

type AnalysisState = {
  summary: string | null;
  validation: { validationSuggestions: string; riskAnalysis: string } | null;
  trl: { trlLevel: number; justification: string } | null;
  roadmap: string | null;
  market: string | null;
  ip: string | null;
  regulatory: string | null;
};

const TRLFormSchema = z.object({
  componentDescription: z.string().min(10, {
    message: 'Component description must be at least 10 characters.',
  }),
});

const RoadmapFormSchema = z.object({
  productionScale: z.string().optional(),
  costPerUnit: z.string().optional(),
  revenuePerUnit: z.string().optional(),
});

export default function DashboardPage() {
  const [docText, setDocText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');
  const [analysis, setAnalysis] = useState<AnalysisState>({
    summary: null,
    validation: null,
    trl: null,
    roadmap: null,
    market: null,
    ip: null,
    regulatory: null,
  });

  const [loadingStates, setLoadingStates] = useState({
    insights: false,
    trl: false,
    roadmap: false,
    market: false,
    ip: false,
    regulatory: false,
  });

  const { toast } = useToast();

  const trlForm = useForm<z.infer<typeof TRLFormSchema>>({
    resolver: zodResolver(TRLFormSchema),
    defaultValues: { componentDescription: '' },
  });

  const roadmapForm = useForm<z.infer<typeof RoadmapFormSchema>>({
    resolver: zodResolver(RoadmapFormSchema),
    defaultValues: {
      productionScale: 'Pilot Scale',
      costPerUnit: '150',
      revenuePerUnit: '500',
    },
  });

  const handleProcessDocument = async (text: string) => {
    setDocText(text);
    setAnalysis({ summary: null, validation: null, trl: null, roadmap: null, market: null, ip: null, regulatory: null });
    trlForm.reset();
    setActiveTab('insights');
  };

  const runAnalysis = async (tab: string, analysisFn: () => Promise<any>, stateKey: keyof AnalysisState) => {
    setLoadingStates(prev => ({...prev, [tab]: true}));
    setAnalysis(prev => ({...prev, [stateKey]: null}));
    try {
      const result = await analysisFn();
      if(result) {
        setAnalysis(prev => ({...prev, ...result}));
      } else {
        throw new Error('Analysis function returned null');
      }
    } catch (error) {
       toast({
        variant: 'destructive',
        title: `${tab.charAt(0).toUpperCase() + tab.slice(1)} Analysis Failed`,
        description: `Could not generate ${tab} analysis.`,
      });
    } finally {
      setLoadingStates(prev => ({...prev, [tab]: false}));
    }
  }

  const handleTabChange = async (tab: string) => {
    setActiveTab(tab);
    if (!docText) return;

    switch(tab) {
        case 'insights':
            if (!analysis.summary) {
                runAnalysis('insights', async () => {
                    const [summaryRes, validationRes] = await Promise.all([
                        actions.summarize({ documentText: docText }),
                        actions.validate({ technicalDocumentation: docText }),
                    ]);
                    return { summary: summaryRes?.summary, validation: validationRes };
                }, 'summary'); // This is a bit of a hack, we're setting two state keys
            }
            break;
        case 'trl':
            // TRL needs form input, so we don't auto-run
            break;
        case 'roadmap':
            if(!analysis.roadmap) {
                roadmapForm.handleSubmit(onGenerateRoadmap)();
            }
            break;
        case 'market':
             if (!analysis.market) {
                runAnalysis('market', async () => ({ market: (await actions.analyzeMarket({ technicalDocumentation: docText }))?.analysis }), 'market');
            }
            break;
        case 'ip':
             if (!analysis.ip) {
                runAnalysis('ip', async () => ({ ip: (await actions.analyzeIp({ technicalDocumentation: docText }))?.analysis }), 'ip');
            }
            break;
        case 'regulatory':
            if (!analysis.regulatory) {
                runAnalysis('regulatory', async () => ({ regulatory: (await actions.analyzeRegulatory({ technicalDocumentation: docText }))?.analysis }), 'regulatory');
            }
            break;
    }
  };
  
  const onAssessTrl = async (values: z.infer<typeof TRLFormSchema>) => {
    runAnalysis('trl', async () => {
        const res = await actions.assessTrl({ componentDescription: values.componentDescription, technicalData: docText });
        return { trl: res ? { trlLevel: res.trlLevel, justification: res.justification } : null };
    }, 'trl');
  };

  const onGenerateRoadmap = async (values: z.infer<typeof RoadmapFormSchema>) => {
    runAnalysis('roadmap', async () => {
        const res = await actions.generateRoadmap({ technicalDocumentation: docText, ...values });
        return { roadmap: res?.roadmap };
    }, 'roadmap');
  };

  const renderContent = (content: string | null | undefined, isLoading: boolean, title: string) => {
    if (isLoading) return <Skeleton className="h-48 w-full" />;
    if (!content) return <p className="text-sm text-muted-foreground mt-4">No {title.toLowerCase()} generated yet. Trigger the analysis to see results.</p>;
    return (
      <div className="text-sm prose prose-sm max-w-none mt-4" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />
    );
  };
  
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold tracking-tight">BioMetallica Agent Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Your AI-powered assistant for bioreactor R&D acceleration.
        </p>
      </header>
      
      {!docText ? (
        <Card className="shadow-lg animate-fade-in max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="text-primary" />
              Upload Your Document
            </CardTitle>
            <CardDescription>
              Paste your bioreactor's technical documentation below to begin the analysis. You can also load a sample document to see how it works.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              id="doc-text-area"
              placeholder="Paste your technical documentation here..."
              className="min-h-[250px] text-base"
            />
          </CardContent>
          <CardFooter className="flex justify-between items-center">
             <Button
                variant="outline"
                onClick={() => (document.getElementById('doc-text-area') as HTMLTextAreaElement).value = SAMPLE_TECHNICAL_DOCUMENTATION}
              >Load Sample Data</Button>
            <Button
              onClick={() => {
                const text = (document.getElementById('doc-text-area') as HTMLTextAreaElement).value;
                if(text.trim().length > 0) {
                    handleProcessDocument(text).then(() => handleTabChange('insights'));
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Empty Document',
                        description: 'Please paste some content or load sample data.',
                    });
                }
              }}
            >
                <Sparkles className="mr-2 h-4 w-4" />
              Analyze Document
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
               <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="text-primary" />
                      Uploaded Document
                    </CardTitle>
                    <CardDescription>
                      The source text used for the analysis.
                    </CardDescription>
                  </div>
                   <Button variant="secondary" size="sm" onClick={() => setDocText('')}>Start Over</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-sm bg-muted/50 p-4 rounded-md max-h-32 overflow-y-auto">
                    {docText}
                </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto">
              <TabsTrigger value="insights"><Lightbulb className="mr-2"/>LLM Insight Analysis</TabsTrigger>
              <TabsTrigger value="trl"><ClipboardCheck className="mr-2"/>TRL Breakdown</TabsTrigger>
              <TabsTrigger value="roadmap"><GanttChartSquare className="mr-2"/>R&D Roadmap</TabsTrigger>
              <TabsTrigger value="market"><Search className="mr-2"/>Market Analysis</TabsTrigger>
              <TabsTrigger value="ip"><Book className="mr-2"/>IP Analysis</TabsTrigger>
              <TabsTrigger value="regulatory"><Scale className="mr-2"/>Regulatory Pathway</TabsTrigger>
            </TabsList>
            
            <TabsContent value="insights">
                <Card>
                    <CardHeader><CardTitle>LLM Insight Analysis</CardTitle></CardHeader>
                    <CardContent>
                      {loadingStates.insights ? <Skeleton className="h-48 w-full" /> : 
                        !analysis.summary && !analysis.validation ? <p className="text-sm text-muted-foreground mt-4">No insights generated yet.</p> :
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><Lightbulb className="text-primary" />AI Summary</h3>
                                {renderContent(analysis.summary, false, 'summary')}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Validation & Risks</h3>
                                {analysis.validation ? (
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-destructive" />Risk Analysis</h4>
                                            <div className="text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: analysis.validation.riskAnalysis.replace(/\n/g, '<br />')}} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-accent" />Validation Suggestions</h4>
                                            <div className="text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: analysis.validation.validationSuggestions.replace(/\n/g, '<br />')}} />
                                        </div>
                                    </div>
                                ) : <p className="text-sm text-muted-foreground">No validation data.</p>}
                            </div>
                        </div>
                      }
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="trl">
                <Card>
                    <CardHeader><CardTitle>TRL Breakdown</CardTitle><CardDescription>Assess the Technology Readiness Level of a specific component.</CardDescription></CardHeader>
                    <CardContent>
                        <Form {...trlForm}>
                            <form onSubmit={trlForm.handleSubmit(onAssessTrl)} className="space-y-4">
                            <FormField
                                control={trlForm.control}
                                name="componentDescription"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Component to Assess</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., Magnetic-drive agitation system" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={loadingStates.trl}>
                                {loadingStates.trl && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Assess TRL
                            </Button>
                            </form>
                        </Form>
                        <div className="mt-4">
                            {loadingStates.trl ? <Skeleton className="h-24 w-full" /> : 
                                analysis.trl && (
                                <div className="space-y-2 text-sm bg-muted/50 p-4 rounded-md">
                                    <p><strong className="font-semibold">TRL Level:</strong> <span className="font-mono text-primary font-bold text-base">{analysis.trl.trlLevel} / 9</span></p>
                                    <p><strong className="font-semibold">Justification:</strong> {analysis.trl.justification}</p>
                                </div>
                                )
                            }
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="roadmap">
                 <Card>
                    <CardHeader><CardTitle>R&D Roadmap</CardTitle><CardDescription>Generate an R&D roadmap with economic simulation.</CardDescription></CardHeader>
                    <CardContent>
                        <Form {...roadmapForm}>
                            <form onSubmit={roadmapForm.handleSubmit(onGenerateRoadmap)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField control={roadmapForm.control} name="productionScale" render={({ field }) => ( <FormItem> <FormLabel>Production Scale</FormLabel> <FormControl> <Input placeholder="e.g., Pilot Scale" {...field} /> </FormControl> </FormItem> )}/>
                                    <FormField control={roadmapForm.control} name="costPerUnit" render={({ field }) => ( <FormItem> <FormLabel>Cost/Unit ($)</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 150" {...field} /> </FormControl> </FormItem> )}/>
                                    <FormField control={roadmapForm.control} name="revenuePerUnit" render={({ field }) => ( <FormItem> <FormLabel>Revenue/Unit ($)</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 500" {...field} /> </FormControl> </FormItem> )}/>
                                </div>
                                <Button type="submit" disabled={loadingStates.roadmap}>
                                    {loadingStates.roadmap && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Generate Roadmap
                                </Button>
                            </form>
                        </Form>
                        {renderContent(analysis.roadmap, loadingStates.roadmap, 'roadmap')}
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="market">
                <Card>
                    <CardHeader><CardTitle>Market Analysis</CardTitle><CardDescription>AI-generated market analysis based on the technical documentation.</CardDescription></CardHeader>
                    <CardContent>
                       {renderContent(analysis.market, loadingStates.market, 'market analysis')}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="ip">
                 <Card>
                    <CardHeader><CardTitle>IP Analysis</CardTitle><CardDescription>AI-generated analysis of potential intellectual property and patentable ideas.</CardDescription></CardHeader>
                    <CardContent>
                       {renderContent(analysis.ip, loadingStates.ip, 'IP analysis')}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="regulatory">
                 <Card>
                    <CardHeader><CardTitle>Regulatory Pathway</CardTitle><CardDescription>AI-generated outline of the potential regulatory pathway for the technology.</CardDescription></CardHeader>
                    <CardContent>
                       {renderContent(analysis.regulatory, loadingStates.regulatory, 'regulatory pathway analysis')}
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
