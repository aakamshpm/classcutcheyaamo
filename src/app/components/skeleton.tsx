// building blocks for loading screens. every placeholder is a plain shape
// with no text, borders or icons, sized like the thing it stands in for so
// the page doesn't shift when the real content arrives.

// a loading screen is one region, announced once instead of shape by shape
export function SkeletonRegion({
  label = "loading",
  className,
  children,
}: {
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className={className}>
      {children}
    </div>
  );
}

// any solid shape: pass the size and radius as classes
export function Skel({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`skel ${className}`} />;
}

// one line of text. `textClass` takes the same size classes the real text
// uses (text-sm, text-lg...), so the line is as tall as the real one and the
// bar sits centred in it
export function SkelText({
  width,
  textClass = "text-sm",
  className = "",
}: {
  width: string;
  textClass?: string;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={`flex items-center ${textClass} ${className}`}>
      <span className="skel block h-[0.75em] rounded-full" style={{ width }} />
      <span className="w-0 overflow-hidden">&nbsp;</span>
    </div>
  );
}
