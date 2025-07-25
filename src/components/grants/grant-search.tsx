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
  CardFooter,
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
import { Search, Loader2, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import * as actions from '@/app/actions';
import { SearchGrantsOutput } from '@/ai/flows/search-grants';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';

const searchSchema = z.object({
  projectSummary: z.string().min(20, 'Please provide a summary of at least 20 characters.'),
});

export function GrantSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchGrantsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { projectSummary: '' },
  });

  const onSubmit = async (values: z.infer<typeof searchSchema>) => {
    setIsSearching(true);
    setResults(null);
    try {
        const searchResult = await actions.findGrants(values);
        if (searchResult && searchResult.length > 0) {
            setResults(searchResult);
             toast({
                title: 'Grants Found',
                description: 'Your grant search results are ready below.',
            });
        } else {
             setResults([]); // Set to empty array to show "No results" message
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="text-primary" />
              Manual Grant Search
            </CardTitle>
            <CardDescription>
              Provide a project summary to find relevant grants.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="projectSummary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Summary</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Paste your project summary, abstract, or other details here..." {...field} className="min-h-[150px]"/>
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col items-stretch">
            <Button type="submit" disabled={isSearching} className="w-full">
              {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Search for Grants
            </Button>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Results</h3>
              {isSearching && <Skeleton className="h-40 w-full" />}
              {!isSearching && results === null && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Enter a project summary above to find grants.
                </p>
              )}
               {!isSearching && results && results.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                    No matching grants were found. Please try again with a different summary.
                </p>
              )}
               {!isSearching && results && results.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Funding</TableHead>
                            <TableHead>Link</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.map((grant, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{grant.title}</TableCell>
                                <TableCell>{grant.funding}</TableCell>
                                <TableCell>
                                    <a href={grant.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        <ExternalLink className="inline-block w-4 h-4" />
                                    </a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
