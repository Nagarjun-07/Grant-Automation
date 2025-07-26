
import { GrantProposalGenerator } from "@/components/grants/grant-proposal-generator";

export default function GrantsPage() {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-headline font-bold tracking-tight">Everything About Grants</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Provide a project summary to generate a complete, professional, and tailored grant proposal with AI assistance.
                </p>
            </header>
            <div className="flex justify-center">
                <div className="w-full max-w-4xl">
                    <GrantProposalGenerator />
                </div>
            </div>
        </div>
    );
}
