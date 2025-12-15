const stats = [
  { value: "10,000+", label: "Families Served" },
  { value: "500+", label: "Verified Caregivers" },
  { value: "50,000+", label: "Care Sessions" },
  { value: "4.9/5", label: "Average Rating" },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-gradient-primary text-primary-foreground">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <p className="font-display text-4xl md:text-5xl font-bold mb-2">
                {stat.value}
              </p>
              <p className="text-primary-foreground/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
