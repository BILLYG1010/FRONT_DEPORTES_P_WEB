export default function ProgressBar({ value = 0, color = "from-blue-600 to-blue-400" }) {
  return (
    <div className="w-full bg-slate-100 overflow-hidden rounded-sm h-1">
      <div className={`h-full bg-gradient-to-tr ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}
