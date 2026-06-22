import DynamicFieldGrid from './DynamicFieldGrid';
import DynamicTable from './DynamicTable';
import DynamicGroup from './DynamicGroup';
import './FormEngine.css';

function DynamicSubsection({ subsection, values, onChange, isFieldVisible, isFieldDisabled, aiFilledFields }) {
  if (!subsection) return null;

  const formatTitle = (title) => {
    if (!title) return '';
    return title.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="dynamic-subsection animate-slideIn">
      {subsection.subsectionTitle && (
        <div className="dynamic-subsection__header">
          {formatTitle(subsection.subsectionTitle)}
        </div>
      )}

      {/* Primary fields */}
      {subsection.fields && (
        <DynamicFieldGrid
          fields={subsection.fields}
          values={values}
          onChange={onChange}
          isFieldVisible={isFieldVisible}
          isFieldDisabled={isFieldDisabled}
          aiFilledFields={aiFilledFields}
        />
      )}

      {/* Tables */}
      {subsection.tables && subsection.tables.map(table => (
        <DynamicTable
          key={table.tableId}
          table={table}
          values={values}
          onChange={onChange}
          isFieldVisible={isFieldVisible}
          isFieldDisabled={isFieldDisabled}
          aiFilledFields={aiFilledFields}
        />
      ))}

      {/* Dynamic Groups */}
      {subsection.dynamicGroups && subsection.dynamicGroups.map(grp => (
        <DynamicGroup
          key={grp.groupId}
          group={grp}
          groupValues={values}
          onGroupChange={onChange}
          isFieldVisible={isFieldVisible}
          isFieldDisabled={isFieldDisabled}
          aiFilledFields={aiFilledFields}
        />
      ))}

      {/* Additional fields (after tables and groups) */}
      {subsection.additionalFields && (
        <div className="dynamic-subsection__additional-fields">
          {subsection.additionalFieldsTitle && (
            <div className="dynamic-subsection__additional-title" style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>
              {formatTitle(subsection.additionalFieldsTitle)}
            </div>
          )}
          <DynamicFieldGrid
            fields={subsection.additionalFields}
            values={values}
            onChange={onChange}
            isFieldVisible={isFieldVisible}
            isFieldDisabled={isFieldDisabled}
            aiFilledFields={aiFilledFields}
          />
        </div>
      )}
    </div>
  );
}

export default DynamicSubsection;
