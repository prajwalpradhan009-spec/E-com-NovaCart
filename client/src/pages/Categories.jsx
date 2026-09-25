import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, Package } from "lucide-react";
import { api } from "../lib/api";
import { PageHeader, PageLoader } from "../components/layout/Page";
import CategoryCard from "../components/CategoryCard";
import { EmptyState } from "../components/ui";

export default function Categories() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/categories").then((d) => {
      setCategories(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Departments"
        title="Browse by category"
        subtitle="Eight curated departments with hand-picked products — find exactly what you're looking for."
        crumbs={[{ label: "Categories" }]}
      />

      <div data-reveal className="shell py-10">
        {loading ? (
          <PageLoader />
        ) : categories.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c, i) => (
              <CategoryCard key={c.id} category={c} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState icon={<Layers size={28} />} title="No categories yet" message="Categories from the catalogue will appear here." />
        )}

        <div className="mt-12 rounded-card border border-primary/20 bg-primary-soft p-8 text-center dark:bg-blue-500/10 sm:p-10">
          <Package size={30} className="mx-auto text-primary" />
          <h3 className="mt-3 text-xl font-bold text-ink dark:text-ink-dark">Can't decide where to start?</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft dark:text-ink-darkSoft">
            Explore the whole catalogue or jump straight into today's best-selling deals.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/shop" className="btn-primary btn--md">Shop everything <ArrowRight size={16} /></Link>
            <Link to="/deals" className="btn-secondary btn--md">See deals</Link>
          </div>
        </div>
      </div>
    </>
  );
}