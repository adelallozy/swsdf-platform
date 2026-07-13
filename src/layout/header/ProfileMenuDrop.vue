<template>
  <Menu
    as="div"
    class="account-menu"
    v-slot="{ open }"
    v-if="userData"
  >
    <MenuButton
      class="account-menu__trigger"
      :class="{ 'account-menu__trigger--open': open }"
      :aria-label="$t('Account menu')"
    >
      <i class="pi pi-user" aria-hidden="true"></i>
      <i class="pi pi-chevron-down account-menu__chevron" :class="{ 'account-menu__chevron--open': open }" aria-hidden="true"></i>
    </MenuButton>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems
        class="account-menu__panel"
        :class="
          $i18n.locale == 'ar'
            ? 'tw-left-0'
            : 'tw-right-0'
        "
      >
        <MenuItem as="div" v-for="(item, index) in profileItems" :key="index">
          <button
            type="button"
            @click="$router.push(item.path)"
            class="account-menu__item"
          >
            <i :class="item.icon"></i>

            <span>{{
              $t(item.label)
            }}</span>
          </button>
        </MenuItem>

        <MenuItem>
          <button
            @click="logout"
            type="button"
            class="account-menu__item account-menu__item--danger"
          >
            <i class="fa-solid fa-right-from-bracket"></i>

            <span>{{
              $t("Logout")
            }}</span>
          </button>
        </MenuItem>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script setup>
import axios from "axios";
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { toast } from "vue3-toastify";

const { locale } = useI18n();

const userData = computed(() => JSON.parse(localStorage.getItem("user-data")));
 

const emit = defineEmits(["loggedout"]);

const profileItems = ref([
  {
    label: "Workspace",
    icon: "fa-regular fa-user",
    path: { name: "AppRoot" },
  },

  {
    label: "Applications",
    icon: "fa-regular fa-file",
    path: { name: "platform-applications", params: { locale: locale.value } },
  },
]);

function logout() {
  axios.get(`users/logout`).then((res) => {
    localStorage.removeItem("user-data");
    localStorage.removeItem("jwt");
    localStorage.removeItem("jwt_expiry");
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("jwt_token_expiry");
    location.reload();
    toast.success(res.data.Message);
  });
}
</script>

<style scoped lang="scss">
.account-menu {
  position: relative;
  display: inline-block;
  text-align: end;
}

.account-menu__trigger {
  min-width: 2.75rem;
  min-height: 2.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.55rem 0.65rem;
  border: 1px solid transparent;
  border-radius: 0.8rem;
  background: transparent;
  color: #035796;
  transition: background-color 160ms ease, border-color 160ms ease;
}

.account-menu__trigger:hover,
.account-menu__trigger--open {
  border-color: rgba(3, 87, 150, 0.24);
  background: rgba(3, 87, 150, 0.1);
}

.account-menu__chevron {
  font-size: 0.65rem;
  transition: transform 160ms ease;
}

.account-menu__chevron--open {
  transform: rotate(180deg);
}

.account-menu__panel {
  position: absolute;
  z-index: 70;
  width: 14rem;
  margin-top: 0.65rem;
  overflow: hidden;
  border: 1px solid rgba(15, 45, 76, 0.1);
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 18px 50px rgba(15, 45, 76, 0.16);
  transform-origin: top;
  outline: none;
}

.account-menu__item {
  width: 100%;
  min-height: 3rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(15, 45, 76, 0.07);
  color: #243647;
  font-weight: 700;
  text-align: start;
  transition: color 140ms ease, background-color 140ms ease;
}

.account-menu__item:hover,
.account-menu__item:focus-visible {
  background: #f0f7ff;
  color: #035796;
  outline: none;
}

.account-menu__item--danger {
  border-bottom: 0;
  color: #b4232d;
}

.account-menu__item--danger:hover,
.account-menu__item--danger:focus-visible {
  background: #fff1f2;
  color: #991b1b;
}

@media (prefers-reduced-motion: reduce) {
  .account-menu__trigger,
  .account-menu__chevron,
  .account-menu__item {
    transition: none;
  }
}
</style>
