import { getResources } from "@/app/resources/actions";
import { ResourcesView } from "@/components/domain/ResourcesView";

export default async function ResourcesPage() {
    const { resources } = await getResources();

    return (
        <div className="flex flex-col h-full">
            <ResourcesView resources={resources || []} />
        </div>
    );
}
