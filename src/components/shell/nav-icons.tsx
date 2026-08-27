type IconProps = React.SVGProps<SVGSVGElement>;

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function DossierIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...props}>
      <path d="M6 2.8h7.5L18 7.3V21H6z" />
      <path d="M13.2 3v4.6H18M9 12h6M9 15.6h6M9 19.2h3.5" />
    </svg>
  );
}

export function TacticsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" {...props}>
      <path d="M12 1.8l2.9 6.2 6.8.6-5.1 4.5 1.5 6.6L12 16.3l-6.1 3.4 1.5-6.6L2.3 8.6l6.8-.6z" />
    </svg>
  );
}

export function FootlockerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...props}>
      <path d="M2.8 8.2h18.4v12.4H2.8z" />
      <path d="M2.8 8.2 5 3.4h14L21.2 8.2" />
      <path d="M9.6 12.4h4.8v2.6H9.6z" />
    </svg>
  );
}

export function RecordIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...props}>
      <path d="M5 3.4h14v17.2H5z" />
      <path d="M8.4 8h7.2M8.4 12h7.2M8.4 16h4.4" />
    </svg>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...props}>
      <path d="M12 2.8v9.4" />
      <path d="M18.4 5.8a8.6 8.6 0 11-12.8 0" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...props}>
      <path d="M6 9.5l6 6 6-6" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" {...props}>
      <path d="M12 1.8l8.4 3.1v6.4c0 5.4-3.6 9.6-8.4 11-4.8-1.4-8.4-5.6-8.4-11V4.9z" />
    </svg>
  );
}
