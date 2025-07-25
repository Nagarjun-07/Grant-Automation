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
import { Search, Loader2, DollarSign, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import * as actions from '@/app/actions';
import { SearchGrantsOutput } from '@/ai/flows/search-grants';
import { useToast } from '@/hooks/use-toast';

const searchSchema = z.object({
  projectSummary: z.string().min(20, 'Please provide a summary of at least 20 characters.'),
});


export function GrantSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchGrantsOutput>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { projectSummary: '' },
  });

  const onSubmit = async (values: z.infer<typeof searchSchema>) => {
    setIsSearching(true);
    setResults([]);
    try {
        const searchResult = await actions.findGrants({ projectSummary: values.projectSummary });
        if (searchResult && searchResult.length > 0) {
            setResults(searchResult);
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
          Search for Grants Manually
        </CardTitle>
        <CardDescription>
          Provide a project summary to find relevant grants.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="projectSummary"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel>Project Summary</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Paste your project summary here..." {...field} className="min-h-[120px]"/>
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSearching} className="w-full md:w-auto md:self-end">
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">Search Grants</span>
            </Button>
          </form>
        </Form>
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Results</h3>
          {isSearching && (
            <div className="space-y-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
          )}
          {!isSearching && results.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No grants found. Enter a summary and start a search.
            </p>
          )}
          {!isSearching && results.length > 0 && (
            <div className="space-y-3">
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}
