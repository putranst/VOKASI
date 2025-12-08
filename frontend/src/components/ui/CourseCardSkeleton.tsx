export function CourseCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            {/* Image skeleton */}
            <div className="h-48 bg-gray-200 animate-pulse"></div>

            <div className="p-6 space-y-4">
                {/* Category skeleton */}
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>

                {/* Title skeleton */}
                <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>

                {/* Description skeleton */}
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                </div>

                {/* Stats skeleton */}
                <div className="flex items-center gap-6 pt-4">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>

                {/* Button skeleton */}
                <div className="h-10 bg-gray-200 rounded-full w-full animate-pulse"></div>
            </div>
        </div>
    );
}
