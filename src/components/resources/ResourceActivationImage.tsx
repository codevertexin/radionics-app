interface ResourceActivationImageProps {
  imageUrl?: string;
  alt: string;
  className?: string;
}

/** Square frame for activation / graph previews — object-fit contain, no stretch. */
export function ResourceActivationImage({
  imageUrl,
  alt,
  className = '',
}: ResourceActivationImageProps) {
  return (
    <div
      className={`aspect-square w-full max-w-[200px] sm:max-w-[220px] shrink-0 rounded-xl border border-[var(--color-border)] bg-[#f4f2ec] overflow-hidden flex items-center justify-center ${className}`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-full max-h-full w-auto h-auto object-contain p-3"
        />
      ) : (
        <span className="text-[10px] text-[var(--color-text-muted)] px-4 text-center">
          Sem imagem
        </span>
      )}
    </div>
  );
}
