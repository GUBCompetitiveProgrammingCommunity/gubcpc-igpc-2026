import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="flex min-h-[85vh] items-center px-6 pt-24 pb-24">
      <section className="mx-auto w-full max-w-2xl text-center">
        <div
          className="rounded-[32px] border border-green-500/15 p-10 sm:p-14"
          style={{ background: "linear-gradient(180deg, rgba(0,18,7,0.88), rgba(1,10,4,0.96))" }}
        >
          <p className="text-xs font-black uppercase tracking-[0.24em] text-green-400">Error 404</p>
          <h1 className="mt-4 text-5xl font-black text-white sm:text-7xl">Page Not Found</h1>
          <p className="mt-4 text-sm leading-7 text-green-100/65 sm:text-base">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>
          <Link
            to="/"
            className="mt-8 inline-block rounded-full px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-black transition-all hover:scale-[1.01]"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
          >
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
