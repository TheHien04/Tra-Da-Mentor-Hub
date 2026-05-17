/** Platform-wide accessors for matching and other services */

import { listMentors as listMentorsFromStore } from './mentorStore.js';
import { listMentees as listMenteesFromStore } from './menteeStore.js';

export async function listMentors() {
  return listMentorsFromStore();
}

export async function listMentees() {
  return listMenteesFromStore();
}
