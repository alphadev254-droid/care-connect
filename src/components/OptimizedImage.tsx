import { ImgHTMLAttributes } from "react";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false,
  className,
  ...props 
}: OptimizedImageProps) => {
  // Check if it's a Cloudinary URL
  const isCloudinary = src.includes('cloudinary.com');
  
  // Optimize Cloudinary images
  const optimizedSrc = isCloudinary 
    ? src.replace('/upload/', '/upload/w_auto,f_auto,q_auto/')
    : src;

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
      {...props}
    />
  );
};

export default OptimizedImage;
