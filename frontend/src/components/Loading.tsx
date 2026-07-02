interface LoadingProps {
  message?: string;
}

export function Loading({ message = 'Chargement...' }: LoadingProps) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-surface-500 border-t-primary-500"></div>
        <p className="mt-4 text-sm text-zinc-500">{message}</p>
      </div>
    </div>
  );
}
