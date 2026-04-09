const STORAGE_KEY = "afrawood_projects";

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function generateId() {
  return "proj_" + Math.random().toString(36).slice(2, 10);
}

export function saveProject(project = {}) {
  const all = loadAll();

  const newProject = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    ...project,
  };

  all.unshift(newProject);
  saveAll(all);

  return newProject;
}

export function getProjects() {
  return loadAll();
}

export function getProjectById(id) {
  return loadAll().find((p) => p.id === id);
}

export function deleteProject(id) {
  const updated = loadAll().filter((p) => p.id !== id);
  saveAll(updated);
}

export function clearProjects() {
  localStorage.removeItem(STORAGE_KEY);
}

export default {
  saveProject,
  getProjects,
  getProjectById,
  deleteProject,
  clearProjects,
};