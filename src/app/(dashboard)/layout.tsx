export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="px-8 pb-8 pt-32 bg-[#1A1A1A] min-h-screen">
            {children}
        </div>
    );
}
