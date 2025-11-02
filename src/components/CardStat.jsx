export default function CardStat({
  title,
  value,
  delta,
  deltaColor = "text-green-500",
  iconBg = "from-blue-600 to-blue-400",
  icon,
}) {
  return (
    <div className="relative flex flex-col rounded-xl bg-white text-slate-700 shadow-md">
      <div className={`absolute -mt-4 grid h-16 w-16 place-items-center mx-4 rounded-xl overflow-hidden bg-gradient-to-tr ${iconBg} text-white shadow-lg`}>
        {icon}
      </div>
      <div className="p-4 text-right">
        <p className="text-sm text-slate-600">{title}</p>
        <h4 className="text-2xl font-semibold text-slate-900">{value}</h4>
      </div>
      <div className="border-t border-slate-100 p-4">
        <p className="text-base text-slate-600">
          <strong className={deltaColor}>{delta}</strong>&nbsp;than last period
        </p>
      </div>
    </div>
  );
}
