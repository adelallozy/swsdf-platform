<template>
	<div class="tw-rounded-xl tw-w-full tw-p-4 base-card-1 tw-bg-white">
		<h3
			v-if="title"
			:class="titleClass"
			class="tw-text-2xl tw-text-foreground tw-font-medium tw-mb-3"
			>
			{{ title }}
		</h3>
		<slot />
	</div>
</template>

<script setup>
defineProps({
  title: {
    required: false,
  },
  titleClass: {
    required: false,
  },
});
</script>

<style lang="scss">
.base-card-1 {
  box-shadow: 0px 7px 38px 0px #b1b1b11a;
}
</style>
