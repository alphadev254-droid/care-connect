const stats = [
  { value: "0", label: "Families Served" },
  { value: "0", label: "Verified Caregivers" },
  { value: "0", label: "Care Sessions" },
  { value: "0/5", label: "Average Rating" },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Impact
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Building trust through quality care and reliable service across Malawi.
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition-shadow"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
