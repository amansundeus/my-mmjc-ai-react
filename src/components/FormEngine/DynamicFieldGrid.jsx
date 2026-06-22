import FormField from '../FormField/FormField';
import './FormEngine.css';

function DynamicFieldGrid({ fields, values, onChange, isFieldVisible, isFieldDisabled, aiFilledFields }) {
  if (!fields || fields.length === 0) return null;

  // Group fields by rows based on gridColumn (assuming gridColumn 1 means a new row)
  // Or we can just render them in a CSS grid wrapper, and let CSS handle the flow.
  // The schema has gridColumn 1, 2, 3, 4. We can just use a simple grid layout and map fields directly.
  
  // Filter out fields that shouldn't be visible based on conditionalOn
  const visibleFields = fields.filter(field => isFieldVisible(field));

  if (visibleFields.length === 0) return null;

  return (
    <div className="dynamic-field-grid">
      {visibleFields.map((field) => (
        <div 
          key={field.attributeId} 
          className="dynamic-field-grid__item"
          style={{ gridColumn: field.gridColumn ? `span 1` : 'span 1' }} // simplistic spanning
        >
          <FormField
            id={field.fieldId}
            label={field.label}
            type={field.type}
            required={field.required}
            placeholder={field.placeholder || field.format}
            options={field.options}
            prefix={field.prefix}
            value={values[field.attributeId] || ''}
            onChange={(e) => onChange(field.attributeId, e.target.value)}
            disabled={isFieldDisabled && isFieldDisabled(field)}
            isAiFilled={aiFilledFields?.has(field.attributeId)}
            error={field.validationMessage}
          />
        </div>
      ))}
    </div>
  );
}

export default DynamicFieldGrid;
