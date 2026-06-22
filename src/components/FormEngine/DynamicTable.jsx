import FormField from '../FormField/FormField';
import './FormEngine.css';

function DynamicTable({ table, values, onChange, isFieldVisible, isFieldDisabled, aiFilledFields }) {
  if (!table) return null;

  const { type, columns, rows, tableTitle } = table;

  const renderCellInput = (cell, colType = 'number', rowFieldTitle = '') => {
    const inputType = colType === 'text' ? 'text' : 'number';
    return (
      <FormField
        type={inputType}
        value={values[cell.attributeId] || ''}
        onChange={(e) => onChange(cell.attributeId, e.target.value)}
        isAiFilled={aiFilledFields?.has(cell.attributeId)}
        disabled={isFieldDisabled && isFieldDisabled(cell)}
        className="dynamic-table__input"
        placeholder={inputType === 'text' ? rowFieldTitle : '0'}
        error={cell.validationMessage}
      />
    );
  };

  const renderHeader = () => {
    // Check if we have sub-columns (e.g. Secured Long Term / Short Term)
    const hasSubColumns = columns.some(col => col.subColumns && col.subColumns.length > 0);

    if (!hasSubColumns) {
      return (
        <tr>
          {columns.map(col => (
            <th key={col.columnId}>{col.header}</th>
          ))}
        </tr>
      );
    }

    // Two-level header
    return (
      <>
        <tr>
          {columns.map(col => (
            <th 
              key={col.columnId} 
              rowSpan={col.subColumns ? 1 : 2}
              colSpan={col.subColumns ? col.subColumns.length : 1}
              className={col.subColumns ? "dynamic-table__th-group" : ""}
            >
              {col.header}
            </th>
          ))}
        </tr>
        <tr>
          {columns.map(col => {
            if (!col.subColumns) return null;
            return col.subColumns.map(subCol => (
              <th key={subCol.columnId} className="dynamic-table__th-sub">
                {subCol.header}
              </th>
            ));
          })}
        </tr>
      </>
    );
  };

  const renderRows = () => {
    return rows.map((row) => {
      // Check if row is visible (if we support conditionalOn at row level later)
      // if (!isFieldVisible(row)) return null;

      return (
        <tr key={row.fieldId}>
          {columns.map(col => {
            if (col.subColumns) {
              return col.subColumns.map(subCol => {
                const cell = row.cells.find(c => c.columnKey === subCol.columnId);
                return (
                  <td key={subCol.columnId}>
                    {cell ? renderCellInput(cell, subCol.type, row.fieldTitle) : '-'}
                  </td>
                );
              });
            } else {
              const cell = row.cells.find(c => c.columnKey === col.columnId);
              if (col.type === 'label') {
                 // For static tables or row labels, the first column might just be text
                 return (
                   <td key={col.columnId} className="dynamic-table__cell-label">
                     {cell?.value || row.fieldTitle}
                     {row.required && <span className="form-field__required">*</span>}
                   </td>
                 );
              }
              return (
                <td key={col.columnId}>
                  {cell ? renderCellInput(cell, col.type, row.fieldTitle) : '-'}
                </td>
              );
            }
          })}
        </tr>
      );
    });
  };

  const formatTitle = (title) => {
    if (!title) return '';
    return title.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="dynamic-table-container animate-fadeIn">
      {table.tableTitle && (
        <div className="dynamic-table__header">
          <h4 className="dynamic-table__title">{formatTitle(table.tableTitle)}</h4>
        </div>
      )}
      <div className="dynamic-table-scroll">
        <table className={`dynamic-table-engine dynamic-table-engine--${type}`}>
          <thead>
            {renderHeader()}
          </thead>
          <tbody>
            {renderRows()}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DynamicTable;
