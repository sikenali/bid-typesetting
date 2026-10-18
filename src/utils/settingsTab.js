import { ref } from 'vue';

const state = ref({ tab: '', kind: '' });

export function useSettingsTab() {
  function set(payload) {
    state.value = { ...state.value, ...payload };
  }
  function clear() {
    state.value = { tab: '', kind: '' };
  }
  return { state, set, clear };
}
