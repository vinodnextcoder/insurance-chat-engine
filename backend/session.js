const sessions = {};

export function getSession(id) {
  if (!sessions[id]) {
    sessions[id] = {
      stage: "questioning",
      property: {}
    };
  }
  return sessions[id];
}