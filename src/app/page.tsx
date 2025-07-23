'use client';

import { useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  Loader2,
  Lightbulb,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Search,
  Book,
  Scale,
  GanttChartSquare,
  ClipboardCheck,
  DollarSign,
  ExternalLink,
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as actions from './actions';
import { ValidationAndRisksOutput } from '@/ai/flows/generate-experimental-validation';
import { TRLBreakdownOutput } from '@/ai/flows/assess-trl-level';
import { RandDPipelineOutput } from '@/ai/flows/generate-r-and-d-roadmap';
import { SimulateUnitEconomicsOutput } from '@/ai/flows/simulate-unit-economics';
import { SearchGrantsOutput } from '@/ai/flows/search-grants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const SAMPLE_TECHNICAL_DOCUMENTATION = `The BR-X10 is a novel stirred-tank bioreactor designed for mammalian cell culture. It features a 10L working volume with a borosilicate glass vessel. The system incorporates a magnetic-drive agitation system with a pitched-blade impeller, ensuring low-shear mixing. Key components include the agitation system, vessel, and headplate. Advanced process control is achieved via a dedicated PLC with a user-friendly HMI. Sensors for pH (range 6.0-8.0), dissolved oxygen (DO, 0-100% saturation), and temperature (25-45°C) are integrated. The sparging system uses a microporous sparger for efficient oxygen transfer. The system is designed for batch, fed-batch, and perfusion processes. Sterilization is performed via autoclaving. The headplate includes multiple ports for media addition, sampling, and sensor integration. A peristaltic pump is used for media transfer.`;

type AnalysisState = {
  summary: string | null;
  validationAndRisks: ValidationAndRisksOutput | null;
  trlBreakdown: TRLBreakdownOutput | null;
  randDPipeline: RandDPipelineOutput | null;
  unitEconomics: SimulateUnitEconomicsOutput | null;
  grantRecommendations: SearchGrantsOutput | null;
};

const economicsSchema = z.object({
  production_scale: z.coerce.number().min(1, "Production scale must be at least 1."),
  cost_per_unit: z.coerce.number().min(0, "Cost per unit cannot be negative."),
  revenue_per_unit: z.coerce.number().min(0, "Revenue per unit cannot be negative."),
});


export default function DashboardPage() {
  const [docText, setDocText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');
  const [analysis, setAnalysis] = useState<AnalysisState>({
    summary: null,
    validationAndRisks: null,
    trlBreakdown: null,
    randDPipeline: null,
    unitEconomics: null,
    grantRecommendations: null,
  });

  const [loadingStates, setLoadingStates] = useState({
    insights: false,
    trl: false,
    roadmap: false,
    validation: false,
    economics: false,
    grants: false,
  });

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof economicsSchema>>({
    resolver: zodResolver(economicsSchema),
    defaultValues: {
      production_scale: 1000,
      cost_per_unit: 50,
      revenue_per_unit: 75,
    },
  });

  const handleProcessDocument = async (text: string) => {
    setDocText(text);
    setAnalysis({ summary: null, validationAndRisks: null, trlBreakdown: null, randDPipeline: null, unitEconomics: null, grantRecommendations: null });
    setActiveTab('insights');
  };

  const runAnalysis = async <K extends keyof AnalysisState>(tab: string, analysisFn: () => Promise<Partial<AnalysisState> | null>, stateKey: K) => {
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
    if (!docText && !['economics'].includes(tab)) return;

    switch(tab) {
        case 'insights':
            if (!analysis.summary) {
                runAnalysis('insights', async () => {
                    const summaryRes = await actions.summarize({ documentText: docText });
                    return { summary: summaryRes?.summary };
                }, 'summary');
            }
            break;
        case 'validation':
            if (!analysis.validationAndRisks) {
                runAnalysis('validation', async () => ({ validationAndRisks: await actions.validationAndRisks({ technicalDocumentation: docText }) }), 'validationAndRisks');
            }
            break;
        case 'trl':
            if (!analysis.trlBreakdown) {
                 runAnalysis('trl', async () => ({ trlBreakdown: await actions.trlBreakdown({ technicalDocumentation: docText }) }), 'trlBreakdown');
            }
            break;
        case 'roadmap':
            if(!analysis.randDPipeline) {
                 runAnalysis('roadmap', async () => ({ randDPipeline: await actions.randDPipeline({ technicalDocumentation: docText }) }), 'randDPipeline');
            }
            break;
        case 'economics':
             // Handled by form submission
            break;
        case 'grants':
            if (!analysis.grantRecommendations) {
                runAnalysis('grants', async () => ({ grantRecommendations: await actions.findGrants({ documentText: docText }) }), 'grantRecommendations');
            }
            break;
    }
  };

  const onEconomicsSubmit = async (values: z.infer<typeof economicsSchema>) => {
    setLoadingStates(prev => ({...prev, economics: true}));
    setAnalysis(prev => ({...prev, unitEconomics: null}));
    try {
        const result = await actions.runUnitEconomics(values);
        if(result) {
            setAnalysis(prev => ({...prev, unitEconomics: result}));
        } else {
            throw new Error('Unit economics simulation failed.');
        }
    } catch(error) {
         toast({
            variant: 'destructive',
            title: `Unit Economics Failed`,
            description: `Could not run simulation.`,
        });
    } finally {
        setLoadingStates(prev => ({...prev, economics: false}));
    }
  }
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsExtracting(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUri = e.target?.result as string;
        try {
            const result = await actions.extractText({ documentDataUri: dataUri });
            if (result?.extractedText) {
                await handleProcessDocument(result.extractedText);
                handleTabChange('insights');
            } else {
                throw new Error('Text extraction returned no content.');
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'File Processing Error',
                description: 'Could not extract text from the uploaded file. Please ensure it is a valid document.',
            });
        } finally {
            setIsExtracting(false);
        }
      };
      reader.readAsDataURL(file);
    }
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
              Provide Your Document
            </CardTitle>
            <CardDescription>
              Upload a file (PDF, PNG, JPG), paste technical documentation, or load a sample document to begin.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload File</TabsTrigger>
                <TabsTrigger value="paste">Paste Text</TabsTrigger>
              </TabsList>
               <TabsContent value="upload" className="pt-4">
                 <div className="flex flex-col items-center justify-center h-[200px] border-2 border-dashed border-muted rounded-md p-4 text-center">
                    {isExtracting ? (
                        <>
                            <Loader2 className="w-12 h-12 text-muted-foreground mb-4 animate-spin" />
                            <h3 className="text-lg font-medium text-foreground">Extracting Text...</h3>
                            <p className="text-sm text-muted-foreground">Please wait while the AI processes your document.</p>
                        </>
                    ) : (
                        <>
                            <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-foreground">Click to upload a file</h3>
                            <p className="text-sm text-muted-foreground">PDF, PNG, JPG files</p>
                            <Button variant="outline" className="mt-4" onClick={() => fileInputRef.current?.click()}>
                                Browse Files
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.png,.jpg,.jpeg"
                            />
                        </>
                    )}
                </div>
              </TabsContent>
              <TabsContent value="paste" className="pt-4">
                 <Textarea 
                  id="doc-text-area"
                  placeholder="Paste your technical documentation here..."
                  className="min-h-[200px] text-base"
                />
                 <Button
                  className="w-full mt-4"
                  onClick={() => {
                    const text = (document.getElementById('doc-text-area') as HTMLTextAreaElement).value;
                    if(text.trim().length > 0) {
                        handleProcessDocument(text).then(() => handleTabChange('insights'));
                    } else {
                        toast({
                            variant: 'destructive',
                            title: 'Empty Document',
                            description: 'Please paste some content.',
                        });
                    }
                  }}
                >
                    <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Pasted Text
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
             <Button
                variant="link"
                onClick={() => {
                    handleProcessDocument(SAMPLE_TECHNICAL_DOCUMENTATION).then(() => handleTabChange('insights'));
                }}
              >Or load sample text data to see it in action</Button>
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
                      Extracted Document Text
                    </CardTitle>
                    <CardDescription>
                      The source text used for the analysis, extracted by AI from your document.
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
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto">
              <TabsTrigger value="insights"><Lightbulb className="mr-2"/>LLM Insight Analysis</TabsTrigger>
              <TabsTrigger value="validation"><AlertTriangle className="mr-2"/>Validation and Risks</TabsTrigger>
              <TabsTrigger value="trl"><ClipboardCheck className="mr-2"/>TRL Breakdown</TabsTrigger>
              <TabsTrigger value="roadmap"><GanttChartSquare className="mr-2"/>R&D Pipeline</TabsTrigger>
              <TabsTrigger value="economics"><DollarSign className="mr-2"/>Unit Economics</TabsTrigger>
              <TabsTrigger value="grants"><Search className="mr-2"/>Grant Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="insights">
                <Card>
                    <CardHeader><CardTitle>LLM Insight Analysis</CardTitle></CardHeader>
                    <CardContent>
                      {renderContent(analysis.summary, loadingStates.insights, 'summary')}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="validation">
                <Card>
                    <CardHeader><CardTitle>Validation and Risks</CardTitle></CardHeader>
                    <CardContent>
                      {loadingStates.validation ? <Skeleton className="h-48 w-full" /> : 
                        !analysis.validationAndRisks ? <p className="text-sm text-muted-foreground mt-4">No validation and risks generated yet.</p> :
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-accent" />Experimental Suggestions</h3>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                    {analysis.validationAndRisks.experimental_suggestions.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-destructive" />Risk List</h3>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                    {analysis.validationAndRisks.risk_list.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                      }
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="trl">
                <Card>
                    <CardHeader><CardTitle>TRL Breakdown</CardTitle><CardDescription>Technology Readiness Level assessed for each component.</CardDescription></CardHeader>
                    <CardContent>
                        {loadingStates.trl ? <Skeleton className="h-48 w-full" /> : 
                            !analysis.trlBreakdown || Object.keys(analysis.trlBreakdown).length === 0 ? <p className="text-sm text-muted-foreground mt-4">No TRL breakdown generated yet.</p> :
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Component</TableHead>
                                        <TableHead>TRL</TableHead>
                                        <TableHead>Justification</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(analysis.trlBreakdown).map(([component, data]) => (
                                        <TableRow key={component}>
                                            <TableCell className="font-medium">{component}</TableCell>
                                            <TableCell><span className="font-mono text-primary font-bold text-base">{data.trl} / 9</span></TableCell>
                                            <TableCell>{data.justification}</TableCell>
                                            <TableCell>{data.timestamp}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        }
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="roadmap">
                 <Card>
                    <CardHeader><CardTitle>R&amp;D Pipeline</CardTitle><CardDescription>Generated R&amp;D pipeline based on your document.</CardDescription></CardHeader>
                    <CardContent>
                        {loadingStates.roadmap ? <Skeleton className="h-48 w-full" /> :
                            !analysis.randDPipeline ? <p className="text-sm text-muted-foreground mt-4">No R&amp;D pipeline generated yet.</p> :
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Phase</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead>Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analysis.randDPipeline.phases.map((phase, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{phase.phase}</TableCell>
                                            <TableCell>{phase.start_date}</TableCell>
                                            <TableCell>{phase.end_date}</TableCell>
                                            <TableCell>{phase.description}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        }
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="economics">
                <Card>
                    <CardHeader>
                        <CardTitle>Unit Economics Simulation</CardTitle>
                        <CardDescription>Enter scale parameters to simulate economic performance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onEconomicsSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <FormField
                                    control={form.control}
                                    name="production_scale"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Production Scale</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 1000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="cost_per_unit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cost Per Unit ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 50" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="revenue_per_unit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Revenue Per Unit ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 75" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={loadingStates.economics} className="w-full md:w-auto">
                                    {loadingStates.economics ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                                    Simulate
                                </Button>
                            </form>
                        </Form>

                        {loadingStates.economics && <Skeleton className="h-24 w-full mt-6" />}
                        {analysis.unitEconomics && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader><CardTitle>Unit Cost</CardTitle></CardHeader>
                                    <CardContent className="text-2xl font-bold">${analysis.unitEconomics.unit_cost}</CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader><CardTitle>ROI</CardTitle></CardHeader>
                                    <CardContent className="text-2xl font-bold text-green-600">{analysis.unitEconomics.roi}</CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader><CardTitle>Payback Period</CardTitle></CardHeader>
                                    <CardContent className="text-2xl font-bold">{analysis.unitEconomics.payback_period}</CardContent>
                                </Card>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="grants">
                <Card>
                    <CardHeader>
                        <CardTitle>Grant Recommendations</CardTitle>
                        <CardDescription>AI-powered grant recommendations based on your technical document.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingStates.grants && (
                             <div className="space-y-2">
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        )}
                        {!loadingStates.grants && (!analysis.grantRecommendations || analysis.grantRecommendations.length === 0) && (
                            <p className="text-sm text-muted-foreground">
                                No recommendations generated yet. The analysis runs automatically based on your document.
                            </p>
                        )}
                         {!loadingStates.grants && analysis.grantRecommendations && analysis.grantRecommendations.length > 0 && (
                            <div className="space-y-3">
                            {analysis.grantRecommendations.map((grant, index) => (
                                <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <a href={grant.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-semibold text-primary hover:underline">
                                    {grant.title}
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                                <div className="flex items-center gap-1 text-sm font-medium mt-2"><DollarSign className="w-3.5 h-3.5" />{grant.funding}</div>
                                </div>
                            ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
