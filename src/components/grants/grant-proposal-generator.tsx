
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Loader2, FileDown } from 'lucide-react';
import * as actions from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { GenerateGrantProposalOutput } from '@/ai/flows/generate-grant-proposal';

const proposalSchema = z.object({
  projectSummary: z.string().min(20, 'Project summary must be at least 20 characters'),
});

const SectionCard = ({ title, content }: { title: string, content: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="whitespace-pre-wrap font-body text-sm">{content}</p>
    </CardContent>
  </Card>
);

export function GrantProposalGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [proposal, setProposal] = useState<GenerateGrantProposalOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof proposalSchema>>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      projectSummary: '',
    },
  });

  const getFullProposalText = (proposalData: GenerateGrantProposalOutput | null) => {
    if (!proposalData) return '';
    return [
      `Title: ${proposalData.title}`,
      `\nIntroduction:\n${proposalData.introduction}`,
      `\nObjectives:\n${proposalData.objectives}`,
      `\nMethodology:\n${proposalData.methodology}`,
      `\nBudget:\n${proposalData.budget}`,
      `\nConclusion:\n${proposalData.conclusion}`,
    ].join('\n\n');
  };

  const handleDownloadPdf = () => {
    if (!proposal) return;
    const doc = new jsPDF();
    const fullText = getFullProposalText(proposal);
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxLineWidth = pageWidth - margin * 2;
    
    const lines = doc.splitTextToSize(fullText, maxLineWidth);
    
    let cursorY = margin;
    const lineHeight = 7; 

    lines.forEach((line: string) => {
        if (cursorY + lineHeight > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            cursorY = margin;
        }
        doc.text(line, margin, cursorY);
        cursorY += lineHeight;
    });

    doc.save('grant-proposal.pdf');
  };

  const handleDownloadDocx = async () => {
    if (!proposal) return;
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
            new Paragraph({ text: proposal.title, heading: HeadingLevel.TITLE }),
            new Paragraph({ text: "Introduction", heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ children: [new TextRun(proposal.introduction)] }),
            new Paragraph({ text: "Objectives", heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ children: [new TextRun(proposal.objectives)] }),
            new Paragraph({ text: "Methodology", heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ children: [new TextRun(proposal.methodology)] }),
            new Paragraph({ text: "Budget", heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ children: [new TextRun(proposal.budget)] }),
            new Paragraph({ text: "Conclusion", heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ children: [new TextRun(proposal.conclusion)] }),
        ]
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grant-proposal.docx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };


  const onSubmit = async (values: z.infer<typeof proposalSchema>) => {
    setIsLoading(true);
    setProposal(null);
    try {
        const result = await actions.createGrantProposal(values);
        if(result) {
            setProposal(result);
            toast({
                title: 'Proposal Generated',
                description: 'Your new grant proposal is ready below.',
            });
        } else {
            throw new Error('Failed to generate proposal.');
        }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Generation Failed',
            description: 'Could not generate the grant proposal.',
        });
    }
    setIsLoading(false);
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" />
              Grant Proposal Generator
            </CardTitle>
            <CardDescription>
              Generate a tailored grant proposal based on your project summary. The entire proposal will be written in professional, formal language.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="projectSummary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Give us summary</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Summarize your project's goals, impact, and key details..." {...field} rows={6} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {isLoading && <Skeleton className="h-40 w-full" />}
             {proposal && (
                <div className="space-y-4">
                    <h3 className="text-2xl font-headline font-bold text-center mt-6">{proposal.title}</h3>
                    <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                            <FileDown className="mr-2 h-4 w-4"/>
                            Download PDF
                        </Button>
                         <Button variant="outline" size="sm" onClick={handleDownloadDocx}>
                            <FileDown className="mr-2 h-4 w-4"/>
                            Download DOCX
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-6 pt-4">
                      <SectionCard title="Introduction" content={proposal.introduction} />
                      <SectionCard title="Objectives" content={proposal.objectives} />
                      <SectionCard title="Methodology" content={proposal.methodology} />
                      <SectionCard title="Budget" content={proposal.budget} />
                      <SectionCard title="Conclusion" content={proposal.conclusion} />
                    </div>
                </div>
             )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Proposal
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
