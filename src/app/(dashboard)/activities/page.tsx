import { getActivities, getUsersSimple } from "@/app/activities/actions";
import { getCurrentUser } from "@/app/calendar/actions";
import { ActivitiesView } from "@/components/domain/ActivitiesView";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
    const [activitiesRes, users, currentUser] = await Promise.all([
        getActivities(),
        getUsersSimple(),
        getCurrentUser()
    ]);

    return (
        <ActivitiesView
            activities={activitiesRes.activities || []}
            users={users}
            currentUser={currentUser}
        />
    );
}
