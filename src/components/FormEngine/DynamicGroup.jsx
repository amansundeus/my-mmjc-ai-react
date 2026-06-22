import React from 'react';
import DynamicFieldGrid from './DynamicFieldGrid';
import './FormEngine.css';

function DynamicGroup({ group, groupValues, onGroupChange, isFieldVisible, isFieldDisabled, aiFilledFields }) {
  if (!group) return null;

  const entities = groupValues?.[group.groupId] || [{}];

  const addEntity = () => {
    const updated = [...entities, {}];
    onGroupChange(group.groupId, updated);
  };

  const removeEntity = (idx) => {
    const updated = entities.filter((_, i) => i !== idx);
    onGroupChange(group.groupId, updated.length ? updated : [{}]);
  };

  const handleFieldChange = (entityIdx, attributeId, val) => {
    const updated = entities.map((e, i) => i === entityIdx ? { ...e, [attributeId]: val } : e);
    onGroupChange(group.groupId, updated);
  };

  const formatTitle = (title) => {
    if (!title) return '';
    return title.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="dynamic-group animate-slideIn">
      {group.groupTitle && (
        <div className="dynamic-group__header">
          {formatTitle(group.groupTitle)}
        </div>
      )}
      
      <div className="dynamic-group__entities">
        {entities.map((entity, idx) => (
          <div key={idx} className="dynamic-group__entity-card">
            <div className="dynamic-group__entity-header">
              <span className="dynamic-group__entity-title">
                {group.entityLabelPrefix || 'Entity'} {idx + 1}
              </span>
              {entities.length > 1 && (
                <button 
                  className="dynamic-group__remove-btn" 
                  onClick={() => removeEntity(idx)}
                  title="Remove"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
            </div>
            
            <DynamicFieldGrid
              fields={group.fields}
              values={entity}
              onChange={(attributeId, val) => handleFieldChange(idx, attributeId, val)}
              isFieldVisible={isFieldVisible}
              isFieldDisabled={isFieldDisabled}
              aiFilledFields={aiFilledFields}
            />
          </div>
        ))}
      </div>

      <div className="dynamic-group__actions">
        <button className="dynamic-group__add-btn" onClick={addEntity}>
          {group.addButtonLabel || '+ Add Entity'}
        </button>
      </div>
    </div>
  );
}

export default DynamicGroup;
