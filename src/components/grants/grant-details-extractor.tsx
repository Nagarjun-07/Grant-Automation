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
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import * as actions from '@/app/actions';
import { ExtractGrantDetailsOutput } from '@/ai/flows/extract-grant-details';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';

const extractSchema = z.object({
  documentText: z.string().min(20, 'Please provide a document text of at least 20 characters.'),
});

export function GrantDetailsExtractor() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [results, setResults] = useState<ExtractGrantDetailsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof extractSchema>>({
    resolver: zodResolver(extractSchema),
    defaultValues: { documentText: '' },
  });

  const onSubmit = async (values: z.infer<typeof extractSchema>) => {
    setIsExtracting(true);
    setResults(null);
    try {
        const extractResult = await actions.extractGrantDetails({ documentText: values.documentText });
        if (extractResult) {
            setResults(extractResult);
        } else {
             toast({
                title: 'No Details Found',
                description: 'Could not extract any grant details from the provided text.',
            });
        }
    } catch(error) {
        toast({
            variant: 'destructive',
            title: 'Extraction Failed',
            description: 'Could not perform the grant detail extraction.',
        });
    }
    setIsExtracting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="text-primary" />
          Extract Grant Details
        </CardTitle>
        <CardDescription>
          Paste in the text of a grant document to extract key details.
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
                  <FormLabel>Document Text</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Paste the grant document text here..." {...field} rows={10} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isExtracting}>
              {isExtracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              <span className="">Extract Details</span>
            </Button>
          </form>
        </Form>
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Extracted Details</h3>
          {isExtracting && (
            <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
          )}
          {!isExtracting && !results && (
            <p className="text-sm text-muted-foreground">
              No details extracted yet. Paste in some text and click "Extract Details".
            </p>
          )}
          {!isExtracting && results && (
            <div className="space-y-2">
                <p><strong>Funding Source:</strong> {results.fundingSource}</p>
                <p><strong>Grant ID:</strong> {results.grantId}</p>
                <p><strong>Funding Amount:</strong> {results.fundingAmount}</p>
                <p><strong>Duration:</strong> {results.duration}</p>
                <p><strong>Associated Institutions:</strong> {results.associatedInstitutions?.join(', ')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
