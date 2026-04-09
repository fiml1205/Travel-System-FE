import { Button } from "./ui/button";

export default function PaginationProjects({ totalPages, currentPage, onChange, loading }: any) {
    if (totalPages <= 1) return null;
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(currentPage + 2, totalPages);
    let pageList = [];
    for (let i = start; i <= end; i++) pageList.push(i);

    return (
        <div className="flex gap-2 justify-center mt-5">
            <Button
                variant="outline"
                disabled={currentPage === 1 || loading}
                onClick={() => onChange(currentPage - 1)}
            >
                &lt;
            </Button>
            {pageList.map((i) => (
                <Button
                    key={i}
                    variant={currentPage === i ? "default" : "outline"}
                    onClick={() => onChange(i)}
                    disabled={loading}
                >
                    {i}
                </Button>
            ))}
            <Button
                variant="outline"
                disabled={currentPage === totalPages || loading}
                onClick={() => onChange(currentPage + 1)}
            >
                &gt;
            </Button>
        </div>
    );
}