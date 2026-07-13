<!-- src/platform/components/Form/FileUploader.vue -->
<template>
	<VeeField 
		type="file" 
		:name="name" 
		v-slot="{ meta, field }"
		:rules="rules"
	>
		<div
		class="input_wrapper"
		:class="{
			error: !meta.valid && meta.touched,
			'is-disabled': disabled
		}"  
		>
		<!-- Label -->
		<div class="text tw-flex tw-items-center tw-gap-2" v-if="label">
			<label :for="id" class="label">{{ label }} </label>
			<span v-if="required" class="tw-text-red-500">*</span>
		</div>

		<!-- Preview -->
		<div
			v-if="preview"
			class="upload tw-border tw-bg-[#02579605] tw-border-dashed hid_input tw-rounded-xl tw-p-4 tw-mt-2 tw-flex tw-justify-between tw-items-center tw-flex-1"
		>
			<a
			:href="preview"
			target="_blank"
			class="tw-text-primary tw-flex tw-gap-2 tw-items-center tw-font-semibold"
			>
			{{ selectedFile }}
			<i class="fas fa-eye"></i>
			</a>
			<button
			type="button"
			class="tw-ms-2 tw-text-red-600 hover:tw-text-red-700 focus:tw-outline-none"
			@click.stop="cancelReq"
			:aria-label="t('fileUploader.removeFile')"
			>
			<i class="fas fa-trash"></i>
			</button>
		</div>

		<!-- Upload Area -->
		<div
			v-else
			class="upload tw-border tw-bg-[#02579605] tw-border-dashed hid_input tw-rounded-xl tw-p-4"
			:class="{
			'tw-border-dashed  !tw-cursor-move': dragOver,
			'tw-pointer-events-none': disabled
			}"
			@dragover.prevent="handleDragOver"
			@dragleave="dragOver = false"
			@drop.prevent="handleDrop"
			v-bind="getRootProps()"
		>
			<input
			ref="refFile"
			type="file"
			:id="id"
			:accept="accept"
			:disabled="disabled"
			@change="handleChange"
			class="tw-hidden"
			:aria-describedby="descriptionId"
			/>

			<input 
			type="text" 
			class="tw-hidden" 
			:name="name" 
			v-bind="field" 
			/>

			<label
			:for="id"
			@click.stop
			class="tw-text-xl !tw-text-muted tw-rounded-lg !tw-flex tw-items-center tw-justify-between tw-gap-3 tw-cursor-pointer"
			:class="{ 'tw-opacity-50': disabled }"
			>
			<div class="tw-flex tw-items-center tw-gap-2">
				<img 
				src="@/assets/images/icons/document-upload.svg" 
				alt="Upload" 
				class="tw-w-6 tw-h-6"
				/>
				{{ placeholder }}
			</div>
			</label>
		</div>

		<!-- Description -->
		<p 
			v-if="description" 
			:id="descriptionId"
			class="tw-text-sm tw-text-gray-500 tw-mt-1"
		>
			{{ description }}
		</p>

		<!-- Error Message -->
		<VeeErrorMessage
			v-if="!meta.valid && meta.touched"
			:name="name"
			as="div"
			class="tw-text-red-500 tw-text-sm tw-mt-1"
		/>
		</div>
	</VeeField>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch, computed } from "vue";
import { useDropzone } from "vue3-dropzone";
import { useI18n } from "vue-i18n";
import { useField } from 'vee-validate';

const props = defineProps({
	itemValue: {
		type: String,
		default: null
	},
	accept: {
		type: String,
		default: "*/*"
	},
	id: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	label: {
		type: String,
		default: null
	},
	placeholder: {
		type: String,
		default: "Choose a file or drag it here"
	},
	description: {
		type: String,
		default: null
	},
	rules: {
		type: [String, Object],
		default: null
	},
	required: {
		type: Boolean,
		default: false
	},
	disabled: {
		type: Boolean,
		default: false
	}
});

const emit = defineEmits(["update:itemValue", "update:image"]);

const { t } = useI18n();

// State
const preview = ref(null);
const selectedFile = ref(null);
const dragOver = ref(false);
const descriptionId = computed(() => `${props.id}-description`);
const refFile = ref(null);

// Dropzone setup
const { getRootProps, getInputProps, ...rest } = useDropzone({
	onDrop: handleDrop,
	accept: props.accept,
	disabled: props.disabled
});

// Field handling
const { value: fieldValue, setValue: setFieldValue } = useField(props.name);

// Event handlers
function handleDragOver(e) {
	if (props.disabled) return;
	dragOver.value = true;
	e.preventDefault();
}

function handleDrop(acceptedFiles, rejectedFiles) {
	if (props.disabled || !acceptedFiles.length) return;
	uploadFile(acceptedFiles[0]);
}

function handleChange(event) {
	if (props.disabled) return;
	const file = event.target.files[0];
	if (file) {
		uploadFile(file);
	}
}

function uploadFile(file) {
	setFieldValue(file);
	selectedFile.value = file.name;
	preview.value = URL.createObjectURL(file);

	emit("update:itemValue", preview.value);
	emit("update:image", file);
}

function cancelReq() {
	if (preview.value) {
		URL.revokeObjectURL(preview.value);
	}
	setFieldValue(null);
	refFile.value = null;
	preview.value = null;
	selectedFile.value = null;
}

// Watch for external value changes
watch(
	() => props.itemValue,
	(newVal) => {
		if (newVal && newVal !== preview.value) {
			preview.value = newVal;
		} else if (!newVal) {
			refFile.value = null;
			selectedFile.value = null;
		}
	},
	{ deep: true }
);

// Cleanup on unmount
onMounted(() => {
	if (props.itemValue) {
		preview.value = props.itemValue;
	}
});

onUnmounted(() => {
	if (preview.value) {
		URL.revokeObjectURL(preview.value);
	}
});
</script>

<style scoped>
/* Add any additional styling here */
.input_wrapper.error .upload {
	@apply tw-border-red-500;
}

.input_wrapper.is-disabled .upload {
	@apply tw-opacity-50 tw-cursor-not-allowed;
}
</style>