<template>
    <div class="base_breadcrumb tw-relative tw-mb-1" v-if="list">
        <div class="container">
            <h2
                v-if="list.title"
                class="tw-text-foreground tw-mb-2 tw-font-bold tw-text-lg lg:tw-text-2xl tw-z-10 tw-relative"
            >
                {{ $t(list.title) }} 
            </h2>
            <ul class="links">
                <li v-for="link in list.links" :key="link.name">

                <router-link 
                    v-if="link.route"
                    :to="link.route">
                    {{ $t(link.name) }}
                </router-link>

                <router-link 
                    v-else-if="link.path"
                    :to="link.path">
                    {{ $t(link.name) }}
                </router-link>
                <template
                    v-else
                >
                    {{ $t(link.name) }}
                </template>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
const props = defineProps({
    items: {
        required: true,
    },
});

const list = ref(null);

watch(
    () => props.items,
    () => {
        list.value = props.items;
    },
    {
        deep: true,
        immediate: true,
    }
);
</script>

<style lang="scss">
    .base_breadcrumb {
    .links {
        @apply tw-flex tw-items-center tw-flex-wrap  tw-justify-start tw-z-10 tw-relative;
        li {
        a {
            @apply tw-relative tw-text-foreground tw-text-sm tw-font-medium last:tw-me-0;
            &.router-link-active.router-link-exact-active {
            @apply tw-text-primary tw-font-bold;
            }
        }

        &:not(:last-child) {
            &::after {
            content: " > ";
            @apply tw-mx-3;
            display: inline-flex;
            }
        }
        }
    }
    }
    :root[dir="rtl"] {
    .base_breadcrumb {
        .links {
        li {
            &:not(:last-child) {
            &::after {
                content: " > " !important;
            }
            }
        }
        }
    }
    }
</style>
