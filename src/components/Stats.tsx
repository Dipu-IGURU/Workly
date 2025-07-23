const stats = [
  { number: "4 million", label: "Jobs posted" },
  { number: "100+", label: "Companies" },
  { number: "3 million", label: "Successful hires" },
  { number: "300k", label: "Monthly users" }
];

const Stats = () => {
  return (
    <section className="py-12 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold mb-2">
                {stat.number}
              </div>
              <div className="text-sm lg:text-base opacity-90">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;