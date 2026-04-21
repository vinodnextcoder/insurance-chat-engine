import { v4 as uuidv4 } from "uuid";

const sessions = new Map();

export const createSession = () => {
  const id = uuidv4();

  sessions.set(id, {
    data: {
      sessionId: id
    },
    history: []
  });

  return id;
};

export const getSession = (id) => sessions.get(id);

export const updateSession = (id, session) => {
  sessions.set(id, session);
};