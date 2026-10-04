export default function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1.5 h-4 bg-[#D1D5DB] rounded-full"></div>
      <h2 className="text-lg font-bold tracking-widest text-[#1F2937]">{title}</h2>
    </div>
  );
}
