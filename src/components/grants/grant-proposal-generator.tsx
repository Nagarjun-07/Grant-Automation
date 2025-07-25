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
  FormDescription,
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
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import htmlToDocx from 'html-to-docx';

const proposalSchema = z.object({
  grantDetails: z.string().min(10, 'Grant details are required'),
  pastProposals: z.string().min(10, 'At least one past proposal example is required'),
  projectSummary: z.string().min(20, 'Project summary must be at least 20 characters'),
});

export function GrantProposalGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [proposal, setProposal] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof proposalSchema>>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      grantDetails: '',
      pastProposals: '',
      projectSummary: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof proposalSchema>) => {
    setIsLoading(true);
    setProposal(null);
    try {
        const result = await actions.createGrantProposal(values);
        if(result) {
            setProposal(result.proposal);
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
              AI Proposal Generator
            </CardTitle>
            <CardDescription>
              Generate a tailored grant proposal based on key information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="grantDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grant Details</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Title, funding amount, key requirements..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pastProposals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Past Successful Proposals</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Paste examples of successful proposals for style reference..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectSummary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Project Summary</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Summarize your project's goals and impact..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {isLoading && <Skeleton className="h-40 w-full" />}
             {proposal && (
                <div id="proposal-content">
                    <h4 className="font-semibold text-lg mb-2">Generated Proposal</h4>
                    <div className="p-4 bg-muted/50 rounded-md max-w-none">
                        <pre className="whitespace-pre-wrap font-body bg-transparent p-0" style={{color: 'black'}}>{proposal.replace(/\*/g, '')}</pre>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                const input = document.getElementById('proposal-content');
                                if (input) {
                                    html2canvas(input, { scrollY: -window.scrollY, windowWidth: input.scrollWidth, windowHeight: input.scrollHeight }).then(canvas => {
                                        const imgData = canvas.toDataURL('image/png');
                                        const pdf = new jsPDF('p', 'mm', 'a4');
                                        const pdfWidth = pdf.internal.pageSize.getWidth();
                                        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                                        pdf.save('proposal.pdf');
                                    });
                                }
                            }}
                        >
                            <FileDown className="mr-2 h-4 w-4" />
                            Download as PDF
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                                const htmlString = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Proposal</title></head><body>${proposal?.replace(/\*/g, '')}</body></html>`;
                                const fileBuffer = await htmlToDocx(htmlString);
                                saveAs(fileBuffer, 'proposal.docx');
                            }}
                        >
                            <FileDown className="mr-2 h-4 w-4" />
                            Download as DOCX
                        </Button>
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
