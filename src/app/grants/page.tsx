import { GrantProposalGenerator } from "@/components/grants/grant-proposal-generator";
import { GrantSearch } from "@/components/grants/grant-search";

export default function GrantsPage() {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="mb-8">
                <h1 className="text-4xl font-headline font-bold tracking-tight">Grant Management</h1>
                <p className="text-muted-foreground mt-2">
                    Discover funding opportunities and generate proposals with AI assistance.
                </p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <GrantSearch />
                <GrantProposalGenerator />
            </div>
        </div>
    );
}
