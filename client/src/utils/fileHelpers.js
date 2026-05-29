export function isValidResumeFile(file) {
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];
  const allowedExt = ['.pdf', '.docx', '.doc'];
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  return allowed.includes(file.type) && allowedExt.includes(ext);
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function buildFormData(file) {
  const fd = new FormData();
  fd.append('resume', file);
  return fd;
}
