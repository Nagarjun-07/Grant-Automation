import { GrantProposalGenerator } from "@/components/grants/grant-proposal-generator";
<<<<<<< HEAD
import { GrantRecommender } from "@/components/grants/grant-recommender";
=======
import { StrategicGrantSearch } from "@/components/grants/strategic-grant-search";
<<<<<<< HEAD
>>>>>>> de71361 (now remove grant recommendation section from dashboard and make sure in)
=======

>>>>>>> 27a66dc (Grant Management)
export default function GrantsPage() {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="mb-8">
                <h1 className="text-4xl font-headline font-bold tracking-tight">Grant Management</h1>
                <p className="text-muted-foreground mt-2">
                    Discover funding opportunities and generate proposals with AI assistance.
                </p>
            </header>
<<<<<<< HEAD
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="lg:col-span-2">
<<<<<<< HEAD
                  <GrantRecommender />
=======
                  <StrategicGrantSearch />
>>>>>>> de71361 (now remove grant recommendation section from dashboard and make sure in)
=======
            <div className="grid grid-cols-1 gap-8 items-start lg:grid-cols-2">
                <div className="space-y-8">
                    <StrategicGrantSearch />
>>>>>>> 27a66dc (Grant Management)
                </div>
                <div className="space-y-8">
                    <GrantProposalGenerator />
                </div>
            </div>
        </div>
    );
}
