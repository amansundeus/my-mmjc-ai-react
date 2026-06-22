import { useState } from 'react'
import './DataTable.css'

function DataTable({ columns, data, selectable = true, pagination = true, itemsPerPage = 10 }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState(new Set())

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const pageData = data.slice(startIdx, startIdx + itemsPerPage)

  const allSelected = pageData.length > 0 && pageData.every((_, i) => selectedRows.has(startIdx + i))

  const toggleAll = () => {
    const newSelected = new Set(selectedRows)
    if (allSelected) {
      pageData.forEach((_, i) => newSelected.delete(startIdx + i))
    } else {
      pageData.forEach((_, i) => newSelected.add(startIdx + i))
    }
    setSelectedRows(newSelected)
  }

  const toggleRow = (idx) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(idx)) {
      newSelected.delete(idx)
    } else {
      newSelected.add(idx)
    }
    setSelectedRows(newSelected)
  }

  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1, 2, 3, 4)
      if (currentPage > 4 && currentPage < totalPages - 2) {
        pages.push('...', currentPage)
      }
      pages.push('...', totalPages)
    }
    return [...new Set(pages)]
  }

  return (
    <div className="data-table-wrapper">
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {selectable && (
                <th className="data-table__checkbox-col">
                  <input
                    type="checkbox"
                    className="data-table__checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    id="select-all-checkbox"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="data-table__empty">
                  No data available
                </td>
              </tr>
            ) : (
              pageData.map((row, i) => {
                const globalIdx = startIdx + i
                return (
                  <tr
                    key={globalIdx}
                    className={selectedRows.has(globalIdx) ? 'data-table__row--selected' : ''}
                  >
                    {selectable && (
                      <td className="data-table__checkbox-col">
                        <input
                          type="checkbox"
                          className="data-table__checkbox"
                          checked={selectedRows.has(globalIdx)}
                          onChange={() => toggleRow(globalIdx)}
                          id={`row-checkbox-${globalIdx}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="data-table__pagination">
          <button
            className="data-table__page-btn data-table__page-btn--nav"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            id="pagination-prev"
          >
            ‹
          </button>
          {getPageNumbers().map((page, i) =>
            page === '...' ? (
              <span key={`ellipsis-${i}`} className="data-table__page-ellipsis">
                …
              </span>
            ) : (
              <button
                key={page}
                className={`data-table__page-btn ${
                  currentPage === page ? 'data-table__page-btn--active' : ''
                }`}
                onClick={() => setCurrentPage(page)}
                id={`pagination-page-${page}`}
              >
                {page}
              </button>
            )
          )}
          <button
            className="data-table__page-btn data-table__page-btn--nav"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            id="pagination-next"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}

export default DataTable
