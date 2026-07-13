<template>
	<Header /> 
		<div
		class="tw-flex tw-items-start tw-flex-wrap tw-gap-4 tw-pt-8 tw-mb-8 tw-container"
		>
			<Breadcrumb />
			<PageHeading />
			<div class="tw-w-full lg:tw-flex-1">
				<router-view />
			</div>
		</div>
	<Footer />
</template>

<script setup>
import Header from "@/layout/header/Header.vue";
import Footer from "@/layout/footer/Footer.vue";
import Breadcrumb from "@/v3/components/Layout/Breadcrumb.vue";
import PageHeading from "@/v3/components/Layout/PageHeading.vue";

</script>

<style></style>
