import Link from "next/link";

export default function OfferNextSteps() {
  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
      <Link
        href="/sell"
        className="inline-flex w-full items-center justify-center rounded-[8px] bg-brand px-8 py-3 text-sm font-semibold text-white sm:w-auto sm:text-base"
      >
        List your vehicle
      </Link>
    </div>
  );
}
