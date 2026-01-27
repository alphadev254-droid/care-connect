import { Star } from "lucide-react";

interface RatingDisplayProps {
  averageRating?: string | number;
  totalRatings?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export const RatingDisplay = ({ 
  averageRating, 
  totalRatings = 0, 
  size = "md", 
  showCount = true 
}: RatingDisplayProps) => {
  const rating = averageRating ? parseFloat(averageRating.toString()) : 0;
  
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };
  
  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  if (totalRatings === 0) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Star className={`${sizeClasses[size]} text-gray-300`} />
        <span className={`${textSizeClasses[size]}`}>No ratings yet</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <span className={`${textSizeClasses[size]} font-medium`}>
        {rating.toFixed(1)}
      </span>
      {showCount && (
        <span className={`${textSizeClasses[size]} text-muted-foreground`}>
          ({totalRatings} review{totalRatings !== 1 ? 's' : ''})
        </span>
      )}
    </div>
  );
};