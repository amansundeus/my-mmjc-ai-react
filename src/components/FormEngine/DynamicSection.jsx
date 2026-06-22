import SectionCard from '../SectionCard/SectionCard';
import DynamicFieldGrid from './DynamicFieldGrid';
import DynamicTable from './DynamicTable';
import DynamicGroup from './DynamicGroup';
import DynamicSubsection from './DynamicSubsection';
import './FormEngine.css';

function DynamicSection({ section, values, onChange, isFieldVisible, isFieldDisabled, aiFilledFields }) {
  if (!section) return null;

  const formatTitle = (title) => {
    if (!title) return '';
    return title.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <SectionCard
      title={formatTitle(section.sectionTitle)}
      variant={section.theme || 'neutral'}
      className="animate-fadeIn dynamic-section"
      collapsible={true}
      defaultCollapsed={true}
    >
      {/* Primary fields for this section */}
      {section.fields && (
        <DynamicFieldGrid
          fields={section.fields}
          values={values}
          onChange={onChange}
          isFieldVisible={isFieldVisible}
          isFieldDisabled={isFieldDisabled}
          aiFilledFields={aiFilledFields}
        />
      )}

      {/* Tables directly under this section */}
      {section.tables && section.tables.map(table => (
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

      {/* Subsections */}
      {section.subsections && section.subsections.map(sub => (
        <DynamicSubsection
          key={sub.subsectionId}
          subsection={sub}
          values={values}
          onChange={onChange}
          isFieldVisible={isFieldVisible}
          isFieldDisabled={isFieldDisabled}
          aiFilledFields={aiFilledFields}
        />
      ))}

      {/* Dynamic Groups directly under section */}
      {section.dynamicGroups && section.dynamicGroups.map(grp => (
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

      {/* Additional fields directly under section */}
      {section.additionalFields && (
        <div className="dynamic-section__additional-fields">
          {section.additionalFieldsTitle && (
            <div className="dynamic-section__additional-title" style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>
              {formatTitle(section.additionalFieldsTitle)}
            </div>
          )}
          <DynamicFieldGrid
            fields={section.additionalFields}
            values={values}
            onChange={onChange}
            isFieldVisible={isFieldVisible}
            isFieldDisabled={isFieldDisabled}
            aiFilledFields={aiFilledFields}
          />
        </div>
      )}
    </SectionCard>
  );
}

export default DynamicSection;
