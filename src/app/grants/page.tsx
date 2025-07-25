import { GrantProposalGenerator } from "@/components/grants/grant-proposal-generator";
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import { GrantRecommender } from "@/components/grants/grant-recommender";
=======
import { StrategicGrantSearch } from "@/components/grants/strategic-grant-search";
<<<<<<< HEAD
>>>>>>> de71361 (now remove grant recommendation section from dashboard and make sure in)
=======
=======
import { GrantSearch } from "@/components/grants/grant-search";
>>>>>>> c3b7ded (still not generating please do something make it generate something in t)
=======
>>>>>>> 073a56c (remove that grant search in that page just keep ai purpose generater)

>>>>>>> 27a66dc (Grant Management)
export default function GrantsPage() {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-headline font-bold tracking-tight">Everything About Grants</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Provide a project summary to generate a complete, professional, and tailored grant proposal with AI assistance.
                </p>
            </header>
<<<<<<< HEAD
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
<<<<<<< HEAD
                    <StrategicGrantSearch />
>>>>>>> 27a66dc (Grant Management)
=======
                    <GrantSearch />
>>>>>>> c3b7ded (still not generating please do something make it generate something in t)
                </div>
                <div className="space-y-8">
=======
            <div className="flex justify-center">
<<<<<<< HEAD
                <div className="w-full max-w-3xl">
>>>>>>> 073a56c (remove that grant search in that page just keep ai purpose generater)
=======
                <div className="w-full max-w-4xl">
>>>>>>> 2c4745f (now change the ai propose generator to everything about grants and also)
                    <GrantProposalGenerator />
                </div>
            </div>
        </div>
    );
}
