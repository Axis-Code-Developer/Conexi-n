import { FollowUpView } from "@/components/domain/FollowUpView";
import { getFollowUps } from "./actions";

// This is a Server Component by default in App Router
export default async function FollowUpPage() {
    // Fetch data on the server
    const followUps = await getFollowUps();

    return (
        <FollowUpView initialFollowUps={followUps} />
    );
}
