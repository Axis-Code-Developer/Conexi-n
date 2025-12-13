export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="p-8 bg-[#1A1A1A] min-h-screen">
            {children}
        </div>
    );
}
