import Image from 'next/image'

type LandingImageProps = {
  src: string;
  alt: string;
  maxWidth?: string; // e.g., "max-w-2xl", "max-w-4xl"
  height?: number;
}

export default function LandingImage({ src, alt, maxWidth = "max-w-2xl" }: LandingImageProps) {
  return (
    <div className={`relative w-full ${maxWidth} mx-auto rounded-2xl overflow-hidden shadow-lg`}>
      <Image
        src={src}
        alt={alt}
        width={800}
        height={600}
        priority
        className="object-cover w-full h-auto"
      />
    </div>
  )
}