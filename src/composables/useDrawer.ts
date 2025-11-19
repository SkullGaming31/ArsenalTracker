import { ref } from 'vue'

// Initialize drawer open on wide screens so desktop users see the nav by default.
const defaultOpen = typeof window !== 'undefined' && window.innerWidth >= 900
export const drawerOpen = ref<boolean>(defaultOpen)

export function useDrawer() {
  function open() { drawerOpen.value = true }
  function close() { drawerOpen.value = false }
  function toggle() { drawerOpen.value = !drawerOpen.value }

  return {
    drawerOpen,
    open,
    close,
    toggle
  }
}
