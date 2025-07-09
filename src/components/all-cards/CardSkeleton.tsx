
import { Card, CardContent } from "@/components/ui/card";

interface CardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export const CardSkeleton = ({ viewMode = 'list' }: CardSkeletonProps) => {
  if (viewMode === 'grid') {
    return (
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Card Image */}
            <div className="w-full h-32 bg-muted rounded-lg animate-pulse"></div>
            
            {/* Card Info */}
            <div className="space-y-3">
              <div>
                <div className="h-5 bg-muted rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-12 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
              </div>
              
              <div className="h-8 bg-muted rounded animate-pulse"></div>
              
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-4/5 animate-pulse"></div>
              </div>
              
              <div className="h-10 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* Card Info */}
          <div className="flex items-start space-x-4 flex-1">
            {/* Card Image */}
            <div className="w-20 h-12 bg-muted rounded-lg animate-pulse flex-shrink-0"></div>

            {/* Card Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="h-5 bg-muted rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-2 animate-pulse"></div>
                  <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-8 bg-muted rounded animate-pulse"></div>
                </div>
              </div>

              <div className="flex items-center space-x-3 mb-3">
                <div className="h-4 w-12 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
              </div>

              <div className="flex items-center space-x-6 text-sm mb-3">
                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
              </div>

              <div className="space-y-1">
                <div className="h-3 bg-muted rounded animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-4/5 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-end space-y-3 flex-shrink-0 ml-6">
            <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
