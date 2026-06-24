const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9995';
const MASTERS_API_URL = import.meta.env.VITE_MASTERS_API_URL || 'http://3.108.92.117:9992';

let cachedToken = null;

async function getToken() {
  if (cachedToken) return cachedToken;

  // Allow user to manually set token via browser console if dev endpoint fails
  const manualToken = localStorage.getItem('mmjc_token');
  if (manualToken) return manualToken;

  try {
    const response = await fetch(`${API_BASE_URL}/dev/token?username=testuser&userId=1`);
    if (response.ok) {
      const data = await response.json();
      cachedToken = data.token || data.accessToken || Object.values(data)[0];
      return cachedToken;
    } else {
      console.warn(`Dev token endpoint returned ${response.status}. Please check backend security config or manually set localStorage.setItem('mmjc_token', '<your_token>')`);
    }
  } catch (err) {
    console.error("Failed to fetch dev token", err);
  }
  return '';
}

export async function ssoLogin(payload) {
  const url = `${API_BASE_URL}/api/auth/sso/login`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SSO Login failed: ${errorText || response.statusText}`);
  }
  
  return response.json();
}

async function fetchWithAuth(url, options = {}) {
  const token = await getToken();
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  return fetch(url, { ...options, headers });
}

export async function getFormAttributes(formTypeId) {
  const url = `${API_BASE_URL}/mmjc-ai/attributes?formTypeId=${formTypeId}`;
  const response = await fetchWithAuth(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Error fetching attributes: ${response.statusText}`);
  return response.json();
}

export async function getFormAttributeValues(formTypeId, templateId, sourceId, formId) {
  const url = `${API_BASE_URL}/mmjc-ai/attribute-values/${formId}`;
  const response = await fetchWithAuth(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Error fetching attribute values: ${response.statusText}`);
  return response.json();
}

export async function saveFormAttributeValuesBulk(formId, payload) {
  const url = `${API_BASE_URL}/mmjc-ai/attribute-values/bulk/${formId}`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Error bulk saving attribute values: ${response.statusText}`);
  return response.json();
}

export async function updateFormAttributeValuesBulk(formId, payload) {
  const url = `${API_BASE_URL}/mmjc-ai/attribute-values/bulk/${formId}`;
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    let errData;
    try { errData = await response.json(); } catch(e) { }
    const error = new Error(`Error bulk updating attribute values: ${response.statusText}`);
    error.data = errData;
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export async function saveFormAttributesBulk(formTypeId, payload) {
  const url = `${API_BASE_URL}/mmjc-ai/attributes/form-type/${formTypeId}/bulk`;
  
  // Format payload to match BulkAttributeSchemaRequest
  // Convert 'new_...' attributeIds to 0 since backend expects integers for new fields
  const cleanPayload = payload.map(field => {
    if (typeof field.attributeId === 'string' && field.attributeId.startsWith('new_')) {
      return { ...field, attributeId: 0, id: 0 };
    }
    return field;
  });

  const requestBody = {
    formTypeId: parseInt(formTypeId, 10),
    sections: [
      {
        sectionId: "default",
        sectionTitle: "Default",
        fields: cleanPayload
      }
    ]
  };

  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) throw new Error(`Error bulk saving attributes: ${response.statusText}`);
  return response.json();
}

export async function getIrlFormsList(formTypeMasterId) {
  let url = `${API_BASE_URL}/mmjc-ai/irl/forms/list`;
  if (formTypeMasterId) {
    url += `?formTypeMasterId=${formTypeMasterId}`;
  }
  const response = await fetchWithAuth(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Error fetching IRL forms list: ${response.statusText}`);
  return response.json();
}

export async function getForms(pageNumber = 0, pageSize = 10, filter = {}) {
  const url = `${API_BASE_URL}/mmjc-ai/forms?pageNumber=${pageNumber}&pageSize=${pageSize}&sortField=updatedDate&sortDirection=desc`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filter),
  });
  if (!response.ok) throw new Error(`Error fetching forms: ${response.statusText}`);
  return response.json();
}

export async function createIrlForm(payload) {
  const url = `${API_BASE_URL}/mmjc-ai/irl/forms`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Error creating IRL form: ${response.statusText}`);
  return response.json();
}

export async function updateIrlForm(formId, payload) {
  const url = `${API_BASE_URL}/mmjc-ai/irl/forms/${formId}`;
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Error updating IRL form: ${response.statusText}`);
  return response.json();
}

export async function archiveIrlForm(formId) {
  const url = `${API_BASE_URL}/mmjc-ai/irl/forms/${formId}/archive`;
  const response = await fetchWithAuth(url, {
    method: 'PUT',
  });
  if (!response.ok) throw new Error(`Error archiving IRL form: ${response.statusText}`);
  return response.json();
}

export async function getIrlFormById(formId) {
  const url = `${API_BASE_URL}/mmjc-ai/irl/forms/${formId}`;
  const response = await fetchWithAuth(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Error fetching IRL form: ${response.statusText}`);
  return response.json();
}

export async function updateFormAttribute(attributeId, payload) {
  const url = `${API_BASE_URL}/mmjc-ai/attributes/${attributeId}`;
  const response = await fetchWithAuth(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Error updating attribute: ${response.statusText}`);
  return response.json();
}


export async function getFormAttributeById(attributeId) {
  const url = `${API_BASE_URL}/mmjc-ai/attributes/${attributeId}`;
  const response = await fetchWithAuth(url, { method: "GET" });
  if (!response.ok) throw new Error(`Error fetching attribute: ${response.statusText}`);
  return response.json();
}

export async function createAttribute(payload) {
  const url = `${API_BASE_URL}/mmjc-ai/attributes`;
  const response = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Error creating attribute: ${response.statusText}`);
  return response.json();
}

export async function deleteAttribute(attributeId) {
  const url = `${API_BASE_URL}/mmjc-ai/attributes/${attributeId}`;
  const response = await fetchWithAuth(url, { method: "DELETE" });
  if (!response.ok) throw new Error(`Error deleting attribute: ${response.statusText}`);
  return response.json();
}

export async function copyAttribute(attributeId) {
  const url = `${API_BASE_URL}/mmjc-ai/attributes/${attributeId}/copy`;
  const response = await fetchWithAuth(url, { method: "POST" });
  if (!response.ok) throw new Error(`Error copying attribute: ${response.statusText}`);
  return response.json();
}

export async function getCompaniesDropdown() {
  const url = `${MASTERS_API_URL}/mmjc/masters/companiesDropdown`;
  const response = await fetchWithAuth(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Error fetching companies: ${response.statusText}`);
  return response.json();
}

export async function getTeams() {
  const url = `${MASTERS_API_URL}/mmjc/masters/teams?pageNumber=0&pageSize=1000&teamName=`;
  const response = await fetchWithAuth(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Error fetching teams: ${response.statusText}`);
  return response.json();
}

export async function getCompanyThreshold(companyId) {
  const url = `${MASTERS_API_URL}/mmjc/masters/company/${companyId}/threshold`;
  const response = await fetchWithAuth(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Error fetching threshold: ${response.statusText}`);
  return response.json();
}

export async function getSecurityHoldersEquityShares(companyId) {
  const url = `${MASTERS_API_URL}/mmjc/masters/company/${companyId}/securityHoldersEquityShares`;
  const response = await fetchWithAuth(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Error fetching security holders: ${response.statusText}`);
  return response.json();
}

export async function getAuditorsDetails(companyId) {
  const url = `${MASTERS_API_URL}/mmjc/masters/company/${companyId}/auditors`;
  const response = await fetchWithAuth(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Error fetching auditors: ${response.statusText}`);
  return response.json();
}

export async function getCompanyAddresses(companyId) {
  const url = `${MASTERS_API_URL}/mmjc/masters/company/${companyId}/companyAddress`;
  const response = await fetchWithAuth(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Error fetching company address: ${response.statusText}`);
  return response.json();
}

export async function getFormTypeMasters() {
  const url = `${API_BASE_URL}/mmjc-ai/formTypeMasters`;
  const response = await fetchWithAuth(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Error fetching form type masters: ${response.statusText}`);
  return response.json();
}



export async function generateTemplate(templateId) {
  const url = `${API_BASE_URL}/mmjc-ai/generateTemplate/${templateId}`;
  const response = await fetchWithAuth(url, { method: 'GET' });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error generating template: ${errorText || response.statusText}`);
  }
  return response.json();
}



export async function downloadTemplate(templateId) {
  const url = `${API_BASE_URL}/mmjc-ai/downloadTemplate/${templateId}`;
  const response = await fetchWithAuth(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Error downloading template: ${response.statusText}`);

  let filename = 'downloaded_template.xlsx';
  const disposition = response.headers.get('content-disposition');
  if (disposition && disposition.includes('filename=')) {
    const matches = disposition.match(/filename="?([^"]+)"?/);
    if (matches && matches[1]) {
      filename = matches[1];
    }
  }

  const blob = await response.blob();
  return { blob, filename };
}

export async function getTemplateMasters(formTypeMasterId) {
  const url = new URL(`${API_BASE_URL}/mmjc-ai/templateMasters`);
  if (formTypeMasterId) {
    url.searchParams.append('formTypeMasterId', formTypeMasterId);
  }
  const response = await fetchWithAuth(url.toString(), { method: 'GET' });
  if (!response.ok) throw new Error(`Error fetching template masters: ${response.statusText}`);
  return response.json();
}

export async function getSourceMasters(templateMasterId) {
  const url = new URL(`${API_BASE_URL}/mmjc-ai/sourceMasters`);
  if (templateMasterId) {
    url.searchParams.append('templateMasterId', templateMasterId);
  }
  const response = await fetchWithAuth(url.toString(), { method: 'GET' });
  if (!response.ok) throw new Error(`Error fetching source masters: ${response.statusText}`);
  return response.json();
}

export async function uploadIrlDocument(formId, file, docType = null) {
  let url = `${API_BASE_URL}/mmjc-ai/irl/forms/${formId}/documents/upload`;
  if (docType) {
    url += `?docType=${encodeURIComponent(docType)}`;
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Status ${response.status}: ${errorText || response.statusText}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function createOrUpdateFormWithDocuments(metadata, sourceFiles, templateFile) {
  const url = `${API_BASE_URL}/mmjc-ai/form`;
  const payload = new FormData();

  payload.append('formData', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));

  if (sourceFiles && sourceFiles.length > 0) {
    sourceFiles.forEach(file => payload.append('sources', file));
  } else {
    // Bypass backend error for required 'sources' part if none provided
    payload.append('sources', new Blob([''], { type: 'application/octet-stream' }), 'empty.txt');
  }

  if (templateFile) {
    payload.append('template', templateFile);
  } else {
    // Bypass backend error for required 'template' part if none provided
    payload.append('template', new Blob([''], { type: 'application/octet-stream' }), 'empty_template.txt');
  }

  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: payload
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create or update form: ${errorText || response.statusText}`);
  }
  
  return response.json();
}

export async function getFormsList(formTypeMasterId = 1) {
  const url = `${API_BASE_URL}/mmjc-ai/forms?pageNumber=0&pageSize=10`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formTypeMasterId })
  });
  if (!response.ok) throw new Error(`Error fetching forms list: ${response.statusText}`);
  return response.json();
}
