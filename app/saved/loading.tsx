import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="불러오는 중"
      className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8"
    >
      <Skeleton className="h-7 w-32" />
      {[0, 1, 2].map((i) => (
        <Card key={i} size="sm">
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </main>
  );
}
