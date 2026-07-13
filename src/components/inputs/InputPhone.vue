<template>
  <div>
    <VeeField :name="name" v-model="value" v-slot="{ field, meta }">
      <div
        class="phone_wrapper"
        @click.stop
        :class="{
          error: !meta.valid && meta.touched,
        }"
      >
        <label for="phone_nubmer" class="label">{{
          $t("labels.phoneNumber")
        }}</label>
        <div class="phone_wrapper_content tw-relative tw-flex tw-items-center">
          <div
            class="tw-me-2 tw-static tw-cursor-pointer"
            @click="show = !show"
            v-if="country"
          >
            <p class="tw-flex tw-items-center tw-font-medium">
              <img
                class="tw-me-1"
                :key="country.id"
                :src="country.image"
                alt="flag"
                width="25"
                height="22"
              />
              +{{ country.phone_code }}
            </p>

            <div
              id="dropdown_menu"
              class="dropdown_menu tw-z-30"
              :class="{ active: show }"
            >
              <div v-for="item in countries" :key="item.id">
                <ul class="">
                  <li
                    @click="selcetedCode(item)"
                    class="tw-flex tw-items-center tw-ps-3 tw-pe-1 tw-py-3 tw-cursor-pointer tw-mx-1 tw-border-b tw-border-gray-200 hover:tw-bg-gray-200"
                  >
                    <img
                      class="tw-me-1"
                      :src="country.image"
                      alt="flag"
                      width="25"
                      height="20"
                    />
                    <span class="tw-text-sm"> +{{ item.phone_code }} </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div
            class="phone_input tw-flex-1 tw-border-s tw-border-tw-text-muted-strong tw-ps-2"
          >
            <input
              class="appearance-none"
              v-bind="field"
              @click.stop="show = false"
              id="phone_nubmer"
              type="number"
              autocomplete="off"
              :placeholder="$t('labels.enterYourPhoneNumber')"
            />
          </div>
        </div>
      </div>
      <VeeErrorMessage
        v-if="!meta.valid && meta.touched"
        :name="name"
        as="div"
        style="color: red;"
        class="help is-danger"
      />
    </VeeField>
  </div>
</template>

<script setup>
const props = defineProps(["modelValue", "name", "label"]);
const emit = defineEmits(["code_change", "update:modelValue"]);

const value = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    emit("update:modelValue", newValue);
  },
});

// import { useGeneralStore } from "@/stores/general";
// import { storeToRefs } from "pinia";
// const store = useGeneralStore();
// const { getCountries } = storeToRefs(store);
// store.setCountries();

const countries = ref(null);
const country = ref(null);

const show = ref(false);

function getCountries() {
  fetchData("general/countries").then((res) => {
    countries.value = res.data;

    country.value = res.data[0];
    emit("code_change", country.value);
  });
}

onMounted(() => {
  document.addEventListener("click", function (event) {
    if (event.target.id !== `dropdown_menu`) {
      show.value = false;
    }
  });
  getCountries();
});

function selcetedCode(item) {
  country.value = item;
  emit("code_change", item);
}
</script>

<style lang="scss">
.phone_wrapper {
  label {
    @apply tw-text-muted-strong tw-text-sm tw-block tw-mb-2;
  }
  .phone_wrapper_content {
    @apply tw-font-medium tw-rounded-xl tw-py-4 tw-px-5 tw-border tw-border-solid focus:tw-border-primary;
    transition: border 0.3s ease-in;
    input {
      @apply focus:tw-outline-none focus:tw-shadow-none tw-w-full tw-caret-primary;
    }
    &:focus,
    &:focus-within {
      @apply tw-border-primary;
      .phone_input {
        @apply tw-border-primary;
      }
    }
    .dropdown_menu {
      @apply tw-absolute tw-bg-white tw-top-full tw-border tw-border-solid tw-rounded-lg tw-start-0 tw-max-h-32 tw-overflow-y-auto tw-invisible tw-opacity-0 -tw-translate-y-10 tw-transition-all tw-duration-300;
      &.active {
        @apply tw-visible tw-opacity-100 tw-translate-y-0;
      }
    }
  }

  &.error {
    .phone_wrapper_content {
      @apply tw-border-red-500;
    }
    label {
      @apply tw-text-red-500;
    }
    .phone_input {
      @apply tw-border-red-500;
    }
  }
}
</style>
