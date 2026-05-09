/** Broadcast user-scoped localStorage updates within the same tab (storage events are cross-tab only). */
export const USER_DATA_CHANGED_EVENT = "myseason:user-data"

export function notifyUserDataChanged(): void {
  window.dispatchEvent(new Event(USER_DATA_CHANGED_EVENT))
}
