import { Link } from "react-router-dom";
import { SearchX, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="shell flex flex-col items-center py-28 text-center">
      <p className="text-[120px] font-extrabold leading-none tracking-tight text-primary/15">404</p>
      <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft dark:text-ink-darkSoft">
        The page you're looking for doesn't exist or has moved. Let's get you back to something useful.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary btn--lg"><Home size={18} /> Back home</Link>
        <Link to="/shop" className="btn-secondary btn--lg"><SearchX size={18} /> Browse products</Link>
      </div>
    </div>
  );
}