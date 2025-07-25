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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, DollarSign, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import * as actions from '@/app/actions';
import { SearchGrantsOutput } from '@/ai/flows/search-grants';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';

const searchSchema = z.object({
  documentText: z.string().min(20, 'Please provide a summary of at least 20 characters.'),
});


import { TRLBreakdownOutput } from '@/ai/flows/assess-trl-level';
import { ExtractGrantDetailsOutput } from '@/ai/flows/extract-grant-details';

export function GrantRecommender() {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchGrantsOutput>([]);
  const [trlBreakdown, setTrlBreakdown] = useState<TRLBreakdownOutput | null>(null);
  const [grantDetails, setGrantDetails] = useState<ExtractGrantDetailsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { documentText: '' },
  });

  const onSubmit = async (values: z.infer<typeof searchSchema>) => {
    setIsSearching(true);
    setResults([]);
    setTrlBreakdown(null);
    setGrantDetails(null);
    try {
        const [grantDetailsResult, trlBreakdownResult, searchResult] = await Promise.all([
            actions.extractGrantDetails({ documentText: values.documentText }),
            actions.trlBreakdown({ technicalDocumentation: values.documentText }),
            actions.findGrants({ documentText: values.documentText })
        ]);

        if (grantDetailsResult) {
            setGrantDetails(grantDetailsResult);
        }

        if (trlBreakdownResult) {
            setTrlBreakdown(trlBreakdownResult);
        }

        if (searchResult && searchResult.length > 0) {
            setResults(searchResult);
        } else {
             toast({
                title: 'No Results',
                description: 'Your search did not return any grants. Try a different document summary.',
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
          Grant Recommendations
        </CardTitle>
        <CardDescription>
          Provide a project summary to find relevant grants, assess TRL, and extract grant details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="documentText"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel>Project Summary</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your project to find matching grants..." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="">Get Recommendations</span>
            </Button>
          </form>
        </Form>
        <div className="mt-6 space-y-4">
            {isSearching && (
                <div className="space-y-2">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            )}
            {!isSearching && grantDetails && (
                <div>
                    <h3 className="text-lg font-semibold">Extracted Grant Details</h3>
                    <div className="space-y-2 mt-2">
                        <p><strong>Funding Source:</strong> {grantDetails.fundingSource}</p>
                        <p><strong>Grant ID:</strong> {grantDetails.grantId}</p>
                        <p><strong>Funding Amount:</strong> {grantDetails.fundingAmount}</p>
                        <p><strong>Duration:</strong> {grantDetails.duration}</p>
                        <p><strong>Associated Institutions:</strong> {grantDetails.associatedInstitutions?.join(', ')}</p>
                    </div>
                </div>
            )}
            {!isSearching && trlBreakdown && (
                <div>
                    <h3 className="text-lg font-semibold">TRL Breakdown</h3>
                    <div className="space-y-2 mt-2">
                        {Object.entries(trlBreakdown).map(([component, assessment]) => (
                            <div key={component}>
                                <p><strong>{component}:</strong> TRL {assessment.trl}</p>
                                <p className="text-sm text-muted-foreground">{assessment.justification}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {!isSearching && results.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold">Grant Recommendations</h3>
                    <div className="space-y-3 mt-2">
                        {results.map((grant, index) => (
                            <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <a href={grant.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-semibold text-primary hover:underline">
                                {grant.title}
                                <ExternalLink className="w-4 h-4" />
                            </a>
                            <div className="flex items-center gap-1 text-sm font-medium mt-2"><DollarSign className="w-3.5 h-3.5" />{grant.funding}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {!isSearching && results.length === 0 && !trlBreakdown && !grantDetails && (
                <p className="text-sm text-muted-foreground">
                No recommendations yet. Enter a summary and start a search.
                </p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
