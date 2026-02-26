<template>
  <button
    :type="type"
    class="ui-icon-button"
    :class="[
      `ui-icon-button-${variant}`,
      size === 'sm' ? 'ui-icon-button-sm' : 'ui-icon-button-md',
      { 'ui-icon-button-active': active },
    ]"
    :disabled="disabled"
    :aria-label="ariaLabel || undefined"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'surface' },
  size: { type: String, default: 'md' },
  active: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  ariaLabel: { type: String, default: '' },
});
</script>
