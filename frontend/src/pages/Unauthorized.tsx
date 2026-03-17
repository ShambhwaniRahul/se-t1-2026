export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
      <p className="mt-2 text-muted-foreground">
        You don't have permission to view this page. Switch your role or contact an admin.
      </p>
    </div>
  );
}
