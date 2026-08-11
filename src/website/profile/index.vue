<template>
  <div class="ws-home tw-pb-8">
    <div class="tw-container">
      <div class="ws-grid">
        <div class="ws-card">
          <router-link
            :to="{ name: 'diving-center-membership', params: { locale } }"
            class="ws-card__link"
          >
            <span class="ws-card__icon" aria-hidden="true">
              <img
                src="@/assets/images/diving-center.svg"
                alt=""
                class="ws-card__image"
                width="64"
                height="64"
              />
            </span>
            <span class="ws-card__title">{{ t("Dive Centers") }}</span>
          </router-link>
        </div>

        <div class="ws-card">
          <router-link
            :to="{ name: 'vendor-profile', params: { locale } }"
            class="ws-card__link"
          >
            <span class="ws-card__icon ws-card__icon--prime" aria-hidden="true">
              <i class="pi pi-briefcase"></i>
            </span>
            <span class="ws-card__title">{{ t("Vendors") }}</span>
          </router-link>
        </div>

        <div class="ws-card">
          <router-link
            :to="{ name: 'user-applications' }"
            class="ws-card__link"
          >
            <span class="ws-card__icon" aria-hidden="true">
              <img
                src="@/assets/images/applications.svg"
                alt=""
                class="ws-card__image"
                width="64"
                height="64"
              />
            </span>
            <span class="ws-card__title">{{ t("Applications") }}</span>
          </router-link>
        </div>

        <div class="ws-card">
          <router-link
            :to="{ name: 'professional-diver-license', params: { locale } }"
            class="ws-card__link"
          >
            <span class="ws-card__icon" aria-hidden="true">
              <img
                src="@/assets/images/profissional-diving.svg"
                alt=""
                class="ws-card__image"
                width="64"
                height="64"
              />
            </span>
            <span class="ws-card__title">
              {{ t("Professional Diver License") }}
            </span>
          </router-link>
        </div>

        <div class="ws-card">
          <router-link
            :to="{ name: 'athlete-profile', params: { locale } }"
            class="ws-card__link"
          >
            <span class="ws-card__icon" aria-hidden="true">
              <img
                src="@/assets/images/profissional-diving.svg"
                alt=""
                class="ws-card__image"
                width="64"
                height="64"
              />
            </span>
            <span class="ws-card__title">{{ t("Athlete Registration") }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
</script>

<style scoped>
.ws-home {
  min-height: 50vh;
  background: #f8fbfd;
}

.ws-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .ws-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .ws-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.ws-card {
  position: relative;
  overflow: hidden;
  border: 1px solid #dce8f0;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 1px 3px rgba(15, 45, 76, 0.08),
    0 12px 28px rgba(2, 87, 150, 0.07);
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.ws-card::before {
  position: absolute;
  content: "";
  inset-inline-start: 0;
  inset-inline-end: 0;
  top: 0;
  height: 4px;
  background: linear-gradient(90deg, #035796, #16b8c8);
  opacity: 0;
  transition: opacity 180ms ease;
}

.ws-card:hover,
.ws-card:focus-within {
  transform: translateY(-2px);
  border-color: rgba(22, 184, 200, 0.55);
  box-shadow:
    0 14px 36px rgba(15, 45, 76, 0.12),
    0 4px 14px rgba(22, 184, 200, 0.08);
}

.ws-card:hover::before,
.ws-card:focus-within::before {
  opacity: 1;
}

.ws-card__link {
  display: flex;
  min-height: 13rem;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.1rem;
  padding: 1.75rem 1.25rem;
  text-align: center;
  text-decoration: none !important;
  outline: none;
}

.ws-card__link:focus-visible {
  box-shadow: inset 0 0 0 3px rgba(22, 184, 200, 0.45);
}

.ws-card__icon {
  display: flex;
  width: 5rem;
  height: 5rem;
  align-items: center;
  justify-content: center;
  border-radius: 1.35rem;
  color: #035796;
  background:
    linear-gradient(135deg, rgba(3, 87, 150, 0.1), rgba(22, 184, 200, 0.16));
  box-shadow: inset 0 0 0 1px rgba(22, 184, 200, 0.2);
}

.ws-card__icon--prime i {
  font-size: 2rem;
}

.ws-card__image {
  width: 3.5rem;
  height: 3.5rem;
  object-fit: contain;
}

.ws-card__title {
  color: #062f50;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.45;
}

@media (prefers-reduced-motion: reduce) {
  .ws-card {
    transition: none;
  }

  .ws-card::before {
    transition: none;
  }
}
</style>
