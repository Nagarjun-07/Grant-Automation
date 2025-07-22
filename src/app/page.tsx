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
import * as actions from './actions';

const SAMPLE_TECHNICAL_DOCUMENTATION = `The BR-X10 is a novel stirred-tank bioreactor designed for mammalian cell culture. It features a 10L working volume with a borosilicate glass vessel. The system incorporates a magnetic-drive agitation system with a pitched-blade impeller, ensuring low-shear mixing. Key components include the agitation system, vessel, and headplate. Advanced process control is achieved via a dedicated PLC with a user-friendly HMI. Sensors for pH (range 6.0-8.0), dissolved oxygen (DO, 0-100% saturation), and temperature (25-45°C) are integrated. The sparging system uses a microporous sparger for efficient oxygen transfer. The system is designed for batch, fed-batch, and perfusion processes. Sterilization is performed via autoclaving. The headplate includes multiple ports for media addition, sampling, and sensor integration.`;

type AnalysisState = {
  summary: string | null;
  validation: { validationSuggestions: string; riskAnalysis: string } | null;
  trl: { trlLevel: number; justification: string } | null;
  roadmap: string | null;
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
  const [isTrlLoading, setIsTrlLoading] = useState(false);
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);

  const [analysis, setAnalysis] = useState<AnalysisState>({
    summary: null,
    validation: null,
    trl: null,
    roadmap: null,
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
    setIsLoading(true);
    setAnalysis({ summary: null, validation: null, trl: null, roadmap: null });
    trlForm.reset();
    
    try {
      const [summaryRes, validationRes] = await Promise.all([
        actions.summarize({ documentText: text }),
        actions.validate({ technicalDocumentation: text }),
      ]);

      if (summaryRes) setAnalysis(prev => ({ ...prev, summary: summaryRes.summary }));
      if (validationRes) setAnalysis(prev => ({ ...prev, validation: validationRes }));
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'An error occurred while processing the document.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssessTrl = async (values: z.infer<typeof TRLFormSchema>) => {
    setIsTrlLoading(true);
    setAnalysis(prev => ({ ...prev, trl: null }));
    try {
      const res = await actions.assessTrl({
        componentDescription: values.componentDescription,
        technicalData: docText,
      });
      if (res) {
         setAnalysis(prev => ({ ...prev, trl: {trlLevel: res.trlLevel, justification: res.justification} }));
      }
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'TRL Assessment Failed',
        description: 'Could not assess TRL for the component.',
      });
    } finally {
      setIsTrlLoading(false);
    }
  };

  const handleGenerateRoadmap = async (values: z.infer<typeof RoadmapFormSchema>) => {
    setIsRoadmapLoading(true);
    setAnalysis(prev => ({ ...prev, roadmap: null }));
     try {
      const res = await actions.generateRoadmap({
        technicalDocumentation: docText,
        ...values
      });
      if (res) {
         setAnalysis(prev => ({ ...prev, roadmap: res.roadmap }));
      }
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Roadmap Generation Failed',
        description: 'Could not generate the R&D roadmap.',
      });
    } finally {
      setIsRoadmapLoading(false);
    }
  }

  const renderContent = (content: string | null, isLoading: boolean, title: string) => {
    if (isLoading) return <Skeleton className="h-24 w-full" />;
    if (!content) return <p className="text-sm text-muted-foreground">No {title.toLowerCase()} generated yet.</p>;
    return (
      <div className="text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />
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
        <Card className="shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="text-primary" />
              Process Your Document
            </CardTitle>
            <CardDescription>
              Upload your bioreactor technical documentation to begin the analysis. For this demo, you can load a sample document.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              id="doc-text-area"
              placeholder="Paste your technical documentation here..."
              className="min-h-[200px]"
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
                    handleProcessDocument(text);
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Empty Document',
                        description: 'Please paste some content or load sample data.',
                    });
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
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
                      Original Document
                    </CardTitle>
                    <CardDescription>
                      The source text used for the analysis below.
                    </CardDescription>
                  </div>
                   <Button variant="secondary" size="sm" onClick={() => setDocText('')}>Start Over</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-sm bg-muted/50 p-4 rounded-md max-h-48 overflow-y-auto">
                    {docText}
                </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="text-primary" />
                    AI Summary
                  </CardTitle>
                  <CardDescription>A concise briefing of the technical documentation.</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderContent(analysis.summary, isLoading, 'summary')}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Beaker className="text-primary" />
                    Validation & Risks
                  </CardTitle>
                  <CardDescription>Experimental validation suggestions and identified potential risks.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? <Skeleton className="h-32 w-full" /> : 
                    !analysis.validation ? <p className="text-sm text-muted-foreground">No validation data generated yet.</p> :
                    <>
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-destructive" />Risk Analysis</h4>
                        <div className="text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: analysis.validation.riskAnalysis.replace(/\n/g, '<br />')}} />
                      </div>
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-accent" />Validation Suggestions</h4>
                        <div className="text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: analysis.validation.validationSuggestions.replace(/\n/g, '<br />')}} />
                      </div>
                    </>
                  }
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="text-primary" />
                    TRL Assessment
                  </CardTitle>
                  <CardDescription>Assess the Technology Readiness Level of a specific component.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...trlForm}>
                    <form onSubmit={trlForm.handleSubmit(handleAssessTrl)} className="space-y-4">
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
                      <Button type="submit" disabled={isTrlLoading}>
                        {isTrlLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Assess TRL
                      </Button>
                    </form>
                  </Form>
                  <div className="mt-4">
                  {isTrlLoading ? <Skeleton className="h-24 w-full" /> : 
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="text-primary" />
                    R&D Roadmap
                  </CardTitle>
                  <CardDescription>Generate an R&D roadmap with economic simulation.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...roadmapForm}>
                    <form onSubmit={roadmapForm.handleSubmit(handleGenerateRoadmap)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField
                                control={roadmapForm.control}
                                name="productionScale"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Production Scale</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g., Pilot Scale" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                             <FormField
                                control={roadmapForm.control}
                                name="costPerUnit"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Cost/Unit ($)</FormLabel>
                                    <FormControl>
                                      <Input type="number" placeholder="e.g., 150" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                             <FormField
                                control={roadmapForm.control}
                                name="revenuePerUnit"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Revenue/Unit ($)</FormLabel>
                                    <FormControl>
                                      <Input type="number" placeholder="e.g., 500" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                        </div>
                       <Button type="submit" disabled={isRoadmapLoading}>
                        {isRoadmapLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Roadmap
                      </Button>
                    </form>
                  </Form>
                   <div className="mt-4">
                      {renderContent(analysis.roadmap, isRoadmapLoading, 'roadmap')}
                   </div>
                </CardContent>
              </Card>

          </div>
        </div>
      )}
    </div>
  );
}
