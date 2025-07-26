'use client';
import { useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  Loader2,
  Sparkles,
  FileDown
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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as actions from '../actions';
import { TRLBreakdownOutput } from '@/ai/flows/assess-trl-level';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SAMPLE_TECHNICAL_DOCUMENTATION = `The BR-X10 is a novel stirred-tank bioreactor designed for mammalian cell culture. It features a 10L working volume with a borosilicate glass vessel. The system incorporates a magnetic-drive agitation system with a pitched-blade impeller, ensuring low-shear mixing. Key components include the agitation system, vessel, and headplate. Advanced process control is achieved via a dedicated PLC with a user-friendly HMI. Sensors for pH (range 6.0-8.0), dissolved oxygen (DO, 0-100% saturation), and temperature (25-45°C) are integrated. The sparging system uses a microporous sparger for efficient oxygen transfer. The system is designed for batch, fed-batch, and perfusion processes. Sterilization is performed via autoclaving. The headplate includes multiple ports for media addition, sampling, and sensor integration. A peristaltic pump is used for media transfer. The technology addresses the need for scalable, low-cost bioreactors for vaccine and monoclonal antibody production, targeting a 30% reduction in production costs and enabling decentralized manufacturing. The innovation lies in the single-use, disposable vessel design, which eliminates cleaning and sterilization cycles, reducing turnaround time and contamination risk.`;


export default function TRLBreakdownPage() {
  const [docText, setDocText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [trlBreakdown, setTrlBreakdown] = useState<TRLBreakdownOutput | null>(null);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessDocument = async (text: string) => {
    setDocText(text);
    setTrlBreakdown(null);
    setIsLoading(true);
    try {
        const result = await actions.trlBreakdown({ technicalDocumentation: text });
        if(result) {
            setTrlBreakdown(result);
        } else {
            throw new Error('TRL Breakdown analysis returned null');
        }
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'TRL Analysis Failed',
        description: `Could not generate TRL breakdown. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
  
  const handleDownloadPdf = () => {
    if (!trlBreakdown) return;
    const doc = new jsPDF();
    
    doc.text("Technology Readiness Level (TRL) Breakdown", 14, 16);
    
    const tableData = Object.entries(trlBreakdown).map(([component, data]) => [
        component,
        data.trl,
        data.justification,
        data.timestamp
    ]);

    (doc as any).autoTable({
        head: [['Component', 'TRL', 'Justification', 'Timestamp']],
        body: tableData,
        startY: 25,
        headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save('trl-breakdown.pdf');
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold tracking-tight">TRL Breakdown</h1>
        <p className="text-muted-foreground mt-2">
          Upload a document to analyze the Technology Readiness Level of its components.
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
                        handleProcessDocument(text)
                    } else {
                        toast({
                            variant: 'destructive',
                            title: 'Empty Document',
                            description: 'Please paste some content.',
                        });
                    }
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Analyze Pasted Text
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
             <Button
                variant="link"
                onClick={() => {
                    handleProcessDocument(SAMPLE_TECHNICAL_DOCUMENTATION);
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
                          Analyzed Document
                        </CardTitle>
                        <CardDescription>
                          This is the source text used for the analysis.
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

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>TRL Breakdown</CardTitle>
                            <CardDescription>Technology Readiness Level assessed for each component.</CardDescription>
                        </div>
                        {trlBreakdown && (
                            <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                                <FileDown className="mr-2 h-4 w-4"/>
                                Download PDF
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-48 w-full" /> : 
                        !trlBreakdown || Object.keys(trlBreakdown).length === 0 ? <p className="text-sm text-muted-foreground mt-4">No TRL breakdown generated yet.</p> :
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
                                {Object.entries(trlBreakdown).map(([component, data]) => (
                                    <TableRow key={component}>
                                        <TableCell className="font-medium capitalize">{component}</TableCell>
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
        </div>
      )}
    </div>
  );
}
