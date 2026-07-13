<!-- src/v3/components/Forms/FormCard.vue --> 
<template>
  <section
    class="tw-mx-auto tw-w-full tw-max-w-[760px] tw-bg-[var(--page-bg)]
           tw-border tw-border-[var(--sidebar-sep)] tw-rounded-2xl tw-shadow-sm tw-overflow-hidden"
  >
    <header class="tw-px-5 tw-pt-5 tw-pb-3">
      <h1 class="tw-text-2xl tw-font-bold tw-text-[var(--heading-fg,#243647)]">
        <slot name="title">{{ title }}</slot>
      </h1>
      <p v-if="subtitle" class="tw-text-sm tw-text-[var(--muted-fg,#6b7280)] tw-mt-1">
        {{ subtitle }}
      </p>
    </header>

    <div class="tw-p-5">
      <slot />
    </div>

    <footer class="tw-border-t tw-border-[var(--sidebar-sep)] tw-bg-[var(--page-bg)]
                   tw-px-5 tw-py-3 tw-flex tw-justify-end tw-gap-2">
      <slot name="actions" />
    </footer>
  </section>
</template>

<script setup>
defineOptions({ name: 'FormCard' })
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' }
})
</script>
