/* eslint-disable @next/next/no-img-element */

type ReachlystBetaLogoProps = {
  src?: string;
  alt?: string;
  imageClassName?: string;
  className?: string;
  badgeClassName?: string;
};

export function ReachlystBetaLogo({
  src = "/reachlyst-logo-light.svg",
  alt = "Reachlyst",
  imageClassName = "h-9 w-auto",
  className = "",
  badgeClassName = ""
}: ReachlystBetaLogoProps) {
  return (
    <span className={`relative inline-flex w-fit items-start ${className}`}>
      <img className={imageClassName} alt={alt} src={src} />
      <span className={`pointer-events-none absolute -right-2 -top-[7px] rounded-[4px] bg-red-600 px-1.5 py-0.5 text-[8px] font-semibold leading-none text-white shadow-[0_6px_14px_rgba(220,38,38,.22)] ${badgeClassName}`}>
        BETA
      </span>
    </span>
  );
}
