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

const searchSchema = z.object({
  query: z.string().min(1, 'Query is required'),
});


export function GrantSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchGrantsOutput>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: '' },
  });

  const onSubmit = async (values: z.infer<typeof searchSchema>) => {
    setIsSearching(true);
    setResults([]);
    try {
        const keywords = values.query.split(',').map(k => k.trim()).filter(k => k);
        const searchResult = await actions.findGrants({ keywords });
        if (searchResult && searchResult.length > 0) {
            setResults(searchResult);
        } else {
             toast({
                title: 'No Results',
                description: 'Your search did not return any grants. Try different keywords.',
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
          Search for Grants
        </CardTitle>
        <CardDescription>
          Search public grant databases using comma-separated keywords.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., bioreactor, research" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="sr-only">Search</span>
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
              No grants found. Enter a query and start a search.
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
