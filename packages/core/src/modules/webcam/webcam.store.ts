import { writable } from 'svelte/store';

export const active = writable(false);
export const cameras = writable<string[]>([]);
export const width = writable(400);
export const height = writable(300);
