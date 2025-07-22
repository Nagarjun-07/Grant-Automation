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
import { Search, Loader2, Building, DollarSign, Calendar } from 'lucide-react';

const searchSchema = z.object({
  query: z.string().min(1, 'Query is required'),
});

const mockGrants = [
  {
    id: 'GRT001',
    title: 'Advanced Bioreactor Design for Cellular Agriculture',
    agency: 'National Science Foundation',
    amount: 500000,
    deadline: '2024-12-15',
  },
  {
    id: 'GRT002',
    title: 'Sustainable Bioprocessing Innovations',
    agency: 'Department of Energy',
    amount: 750000,
    deadline: '2025-01-31',
  },
  {
    id: 'GRT003',
    title: 'Early-Stage Research in Synthetic Biology',
    agency: 'National Institutes of Health',
    amount: 250000,
    deadline: '2024-11-30',
  },
];

type Grant = typeof mockGrants[0];

export function GrantSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Grant[]>([]);

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: '' },
  });

  const onSubmit = async (values: z.infer<typeof searchSchema>) => {
    setIsSearching(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setResults(mockGrants.filter(g => g.title.toLowerCase().includes(values.query.toLowerCase())));
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
          Search public grant databases using keywords.
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
            </Button>
          </form>
        </Form>
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Results</h3>
          {isSearching && (
            <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
          )}
          {!isSearching && results.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No grants found. Enter a query and start a search.
            </p>
          )}
          {!isSearching && results.length > 0 && (
            <div className="space-y-3">
              {results.map((grant) => (
                <div key={grant.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <h4 className="font-semibold text-primary">{grant.title}</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1"><Building className="w-3.5 h-3.5" />{grant.agency}</div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <div className="flex items-center gap-1 font-medium"><DollarSign className="w-3.5 h-3.5" />{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(grant.amount)}</div>
                    <div className="flex items-center gap-1 text-muted-foreground"><Calendar className="w-3.5 h-3.5" />{grant.deadline}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
