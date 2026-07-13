import { ref, readonly } from "vue";

const _title = ref("");
const _subtitle = ref("");
const _visible = ref(true);

export default function usePageHeading() {
  function setHeading({ title = "", subtitle = "", visible = true } = {}) {
    _title.value = title;
    _subtitle.value = subtitle;
    _visible.value = visible;
  }

  return {
    title: readonly(_title),
    subtitle: readonly(_subtitle),
    visible: readonly(_visible),
    setHeading,
  };
}
