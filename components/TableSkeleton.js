export default function TableSkeleton() {
    // For demonstration, let's render 3 skeleton rows
    return Array.from({ length: 3 }).map((_, idx) => (
      <tr key={idx} className="animate-pulse bg-gray-100">
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-13"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-10"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-10"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-28"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-7"></div>
        </td>
      </tr>
    ));
  }  