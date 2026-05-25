interface TrustedBrandsProps {
  brands: string[];
}

export default function TrustedBrands({ brands }: TrustedBrandsProps) {
  return (
    <section className="py-12 px-5 border-y border-gray-100 bg-gray-50/60">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
          Trusted by logistics companies across Africa
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {brands.map((brand) => (
            <div
              key={brand}
              className="px-5 py-2.5 bg-white rounded-lg border border-gray-200 shadow-sm text-sm font-semibold text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors whitespace-nowrap"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
