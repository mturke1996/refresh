interface SkeletonLoaderProps {
  type?: 'card' | 'menu' | 'list';
}

export default function SkeletonLoader({ type = 'card' }: SkeletonLoaderProps) {
  if (type === 'card') {
    return (
      <div className="card overflow-hidden">
        <div className="aspect-product skeleton" />
        <div className="p-5 space-y-3">
          <div className="h-6 skeleton w-3/4" />
          <div className="h-4 skeleton w-full" />
          <div className="h-4 skeleton w-5/6" />
          <div className="flex items-center justify-between mt-4">
            <div className="h-8 skeleton w-24" />
            <div className="h-10 w-10 skeleton rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'menu') {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="h-12 skeleton w-48 mx-auto" />
          <div className="h-6 skeleton w-96 mx-auto" />
        </div>
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 skeleton w-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 skeleton rounded-xl" />
        ))}
      </div>
    );
  }

  return null;
}

