<template>
  <header class="workspace-header">
    <div class="tw-container workspace-header__inner">
      <a
        :href="externalHome"
        class="workspace-header__brand"
        :aria-label="t('Public website')"
      >
        <img
          class="workspace-header__symbol"
          src="/swsdf-color-symbol.png"
          alt="Saudi Water Sports & Diving Federation"
        />
        <img
          class="workspace-header__wordmark"
          src="/swsdf-color-name.png"
          alt=""
        />
      </a>

      <div class="workspace-header__actions">
        <button
          type="button"
          class="workspace-header__language"
          :aria-label="t('Toggle language')"
          @click="changeLang"
        >
          <i class="pi pi-globe" aria-hidden="true"></i>
          <span>{{ langLabel }}</span>
        </button>

        <span class="workspace-header__divider" aria-hidden="true"></span>

        <ProfileMenu v-if="isLoggedIn" />
        <RouterLink
          v-else
          :to="{ name: 'sign-in', params: { locale: normalizedLocale } }"
          class="workspace-header__signin"
        >
          <i class="pi pi-user" aria-hidden="true"></i>
          <span>{{ t('Sign in') }}</span>
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import ProfileMenu from "./ProfileMenuDrop.vue";
import { WEB_BASE_URL } from "@/v3/config/apiEndpoints";

const { locale, t } = useI18n();
const route = useRoute();
const router = useRouter();

const isLoggedIn = computed(() => !!localStorage.getItem("jwt_token"));
const normalizedLocale = computed(() => locale.value === "en" ? "en" : "ar");
const langLabel = computed(() => locale.value === "ar" ? "English" : "العربية");
const externalHome = computed(() => {
  const base = String(WEB_BASE_URL || "https://swsdf.sa/").replace(/\/+$/, "");
  return `${base}/${normalizedLocale.value}`;
});

async function changeLang() {
  const nextLocale = locale.value === "ar" ? "en" : "ar";
  localStorage.setItem("locale", nextLocale);
  locale.value = nextLocale;

  const localizedPath = String(route.path || "").replace(
    /^\/(ar|en)(?=\/|$)/,
    `/${nextLocale}`
  );

  if (localizedPath && localizedPath !== route.path) {
    await router.replace({
      path: localizedPath,
      query: route.query,
      hash: route.hash,
    });
    return;
  }

  if (
    route.name &&
    (route.params?.locale || route.matched?.some((record) => record.path.includes(":locale")))
  ) {
    await router.replace({
      name: route.name,
      params: { ...route.params, locale: nextLocale },
      query: route.query,
      hash: route.hash,
    });
  }
}
</script>

<style scoped lang="scss">
.workspace-header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid rgba(3, 87, 150, 0.1);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 8px 28px rgba(15, 45, 76, 0.05);
  backdrop-filter: blur(16px);
}

.workspace-header::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  bottom: -1px;
  height: 2px;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(22, 139, 193, 0.5), rgba(85, 197, 220, 0.55), transparent);
  opacity: 0.65;
}

.workspace-header__inner {
  min-height: 5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.workspace-header__brand {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  border-radius: 0.75rem;
  text-decoration: none;
  transition: opacity 160ms ease, transform 160ms ease;
}

.workspace-header__brand:hover {
  opacity: 0.86;
  transform: translateY(-1px);
}

.workspace-header__symbol {
  width: 3.2rem;
  height: 3.2rem;
  flex: none;
  object-fit: contain;
}

.workspace-header__wordmark {
  width: min(14rem, 34vw);
  max-height: 2.7rem;
  object-fit: contain;
}

.workspace-header__actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.workspace-header__language,
.workspace-header__signin {
  min-height: 2.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 0.8rem;
  border: 1px solid transparent;
  border-radius: 0.75rem;
  color: #035796;
  font-weight: 700;
  text-decoration: none;
  transition: color 160ms ease, background-color 160ms ease, border-color 160ms ease;
}

.workspace-header__language:hover,
.workspace-header__signin:hover {
  border-color: rgba(3, 87, 150, 0.14);
  background: rgba(3, 87, 150, 0.06);
  color: #004b85;
}

.workspace-header__divider {
  width: 1px;
  height: 1.75rem;
  background: rgba(3, 87, 150, 0.14);
}

.workspace-header a:focus-visible,
.workspace-header button:focus-visible {
  outline: 3px solid rgba(22, 139, 193, 0.3);
  outline-offset: 3px;
}

@media (max-width: 639px) {
  .workspace-header__inner {
    min-height: 4.5rem;
    gap: 0.75rem;
  }

  .workspace-header__symbol {
    width: 2.85rem;
    height: 2.85rem;
  }

  .workspace-header__wordmark {
    display: none;
  }

  .workspace-header__actions {
    gap: 0.35rem;
  }

  .workspace-header__language {
    padding-inline: 0.55rem;
  }

  .workspace-header__divider {
    height: 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .workspace-header__brand,
  .workspace-header__language,
  .workspace-header__signin {
    transition: none;
  }
}
</style>
