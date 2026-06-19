export default function Loading() {
  return (
    <main className="flex items-center w-full justify-center h-[calc(100vh-8rem)]">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </main>
  )
}