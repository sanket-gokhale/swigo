export type User = { id: string; name: string | null };

let currentUser: User | null = null;

export function getUser() { return currentUser; }
export function setUser(u: User | null) { currentUser = u; }
