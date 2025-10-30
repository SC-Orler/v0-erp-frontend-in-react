"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

/**
 * Componente Pagination
 */
export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  // Mostrar solo 5 páginas a la vez
  const visiblePages = pages.slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {visiblePages[0] > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="px-3 py-1 rounded-lg hover:bg-gray-100">
            1
          </button>
          {visiblePages[0] > 2 && <span className="px-2">...</span>}
        </>
      )}

      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-lg ${page === currentPage ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}
        >
          {page}
        </button>
      ))}

      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && <span className="px-2">...</span>}
          <button onClick={() => onPageChange(totalPages)} className="px-3 py-1 rounded-lg hover:bg-gray-100">
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
