import { Container } from "@/components/ui/container";

export function CareersRouteSkeleton({ detail = false, form = false }: { detail?: boolean; form?: boolean }) {
  return (
    <div className="min-h-[60dvh] bg-[#F7F6F2] py-10" aria-busy="true" aria-label="Loading page">
      <Container size="default">
        <div className="animate-pulse motion-reduce:animate-none">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="mt-7 h-10 max-w-xl rounded bg-slate-200" />
          <div className="mt-4 h-4 max-w-2xl rounded bg-slate-200/80" />
          {detail ? (
            <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-5 rounded-xl bg-white p-6">{Array.from({ length: 8 }, (_, i) => <div key={i} className="h-4 rounded bg-slate-100" />)}</div>
              <div className="h-72 rounded-xl bg-white" />
            </div>
          ) : form ? (
            <div className="mt-10 max-w-3xl space-y-5 rounded-xl bg-white p-6">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-11 rounded-lg bg-slate-100" />)}</div>
          ) : (
            <div className="mt-10 space-y-4">{Array.from({ length: 5 }, (_, i) => <div key={i} className="h-20 rounded-xl bg-white" />)}</div>
          )}
        </div>
        <span className="sr-only" role="status">Loading</span>
      </Container>
    </div>
  );
}
