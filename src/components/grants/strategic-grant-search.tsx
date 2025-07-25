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
import { Search, Loader2, DollarSign, ExternalLink, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import * as actions from '@/app/actions';
import { StrategicGrantAnalysisOutput } from '@/ai/flows/strategic-grant-analysis';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const searchSchema = z.object({
  technicalDocumentation: z.string().min(50, 'Please provide a summary of at least 50 characters.'),
});


export function StrategicGrantSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<StrategicGrantAnalysisOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { technicalDocumentation: '' },
  });

  const onSubmit = async (values: z.infer<typeof searchSchema>) => {
    setIsSearching(true);
    setResults(null);
    try {
        const searchResult = await actions.findRecommendedGrants(values);
        if (searchResult && searchResult.length > 0) {
            setResults(searchResult);
             toast({
                title: 'Recommendations Found',
                description: 'AI-powered grant recommendations are ready below.',
            });
        } else {
             toast({
                title: 'No Results',
                description: 'Your search did not return any grants. Try a different summary.',
            });
        }
    } catch(error) {
        toast({
            variant: 'destructive',
            title: 'Search Failed',
            description: 'Could not perform the grant search.',
        });
    }
    setIsSearching(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="text-primary" />
          Strategic Grant Search
        </CardTitle>
        <CardDescription>
          Provide a detailed project summary to find and analyze relevant grant opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="technicalDocumentation"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel>Project Summary / Technical Documentation</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Paste your project summary, abstract, or technical documentation here..." {...field} className="min-h-[150px]"/>
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSearching} className="w-full md:w-auto md:self-end">
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span className="ml-2">Analyze and Find Grants</span>
            </Button>
          </form>
        </Form>
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Recommendations</h3>
          {isSearching && (
            <div className="space-y-4">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
          )}
          {!isSearching && (!results || results.length === 0) && (
            <p className="text-sm text-muted-foreground">
              No recommendations generated yet. Paste your project summary above and start the analysis.
            </p>
          )}
           {!isSearching && results && results.length > 0 && (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {results.map((grant, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border rounded-lg bg-background/50">
                  <AccordionTrigger className="p-4 hover:no-underline">
                    <div className="text-left w-full">
                       <a href={grant.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-semibold text-primary hover:underline">
                        {grant.title}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <div className="flex items-center gap-1 text-sm font-medium mt-2"><DollarSign className="w-3.5 h-3.5" />{grant.funding}</div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-0">
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-1">Funding Purpose</h4>
                            <p className="text-sm text-muted-foreground">{grant.purpose}</p>
                        </div>
                         <div>
                            <h4 className="font-semibold mb-1">Eligibility</h4>
                            <p className="text-sm text-muted-foreground">{grant.eligibility}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-1">Why it's a Fit</h4>
                            <p className="text-sm text-muted-foreground">{grant.fitReason}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-1">How to Align Your Proposal</h4>
                            <p className="text-sm text-muted-foreground">{grant.alignmentTips}</p>
                        </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
        )}
        </div>
      </CardContent>
    </Card>
  );
}
