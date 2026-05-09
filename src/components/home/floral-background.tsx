import Image from "next/image";

export function FloralBackground() {
  return (
    <>
      <Image
        src="/floral-left.svg"
        alt="Floral decoration"
        width={260}
        height={260}
        className="pointer-events-none absolute -left-10 top-24 opacity-70"
      />
      <Image
        src="/floral-right.svg"
        alt="Floral decoration"
        width={260}
        height={260}
        className="pointer-events-none absolute -right-14 top-10 opacity-70"
      />
    </>
  );
}
