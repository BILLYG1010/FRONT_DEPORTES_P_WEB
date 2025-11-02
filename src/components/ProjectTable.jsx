import ProgressBar from "./ProgressBar";

export default function ProjectTable({ rows = [] }) {
  return (
    <div className="p-6 overflow-x-auto pt-0 pb-2">
      <table className="w-full min-w-[640px] table-auto">
        <thead>
          <tr>
            <th className="border-b border-slate-100 py-3 px-6 text-left">
              <p className="text-[11px] font-medium uppercase text-slate-400">companies</p>
            </th>
            <th className="border-b border-slate-100 py-3 px-6 text-left">
              <p className="text-[11px] font-medium uppercase text-slate-400">budget</p>
            </th>
            <th className="border-b border-slate-100 py-3 px-6 text-left">
              <p className="text-[11px] font-medium uppercase text-slate-400">completion</p>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>
              <td className="py-3 px-5 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <p className="text-sm font-bold text-slate-900">{r.company}</p>
                </div>
              </td>
              <td className="py-3 px-5 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-600">{r.budget}</p>
              </td>
              <td className="py-3 px-5 border-b border-slate-100">
                <div className="w-10/12">
                  <p className="mb-1 text-xs font-medium text-slate-600">{r.completion}%</p>
                  <ProgressBar value={r.completion} color={r.completionColor} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
