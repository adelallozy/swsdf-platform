<template>
  <footer class="workspace-footer">
    <div class="workspace-footer__current" aria-hidden="true"></div>

    <div class="tw-container workspace-footer__inner">
      <div class="workspace-footer__main">
        <a
          :href="externalHome"
          class="workspace-footer__brand"
          :aria-label="t('Public website')"
        >
          <img
            class="workspace-footer__symbol"
            src="/swsdf-color-symbol.png"
            alt="Saudi Water Sports & Diving Federation"
          />
          <img
            class="workspace-footer__wordmark"
            src="/swsdf-color-name.png"
            alt=""
          />
        </a>

        <div class="workspace-footer__actions">
          <nav class="workspace-footer__social" :aria-label="t('Social media')">
            <a href="https://www.facebook.com/swsdfksa" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i class="fa-brands fa-facebook-f" aria-hidden="true"></i>
            </a>
            <a href="https://www.instagram.com/swsdfksa" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i class="fa-brands fa-instagram" aria-hidden="true"></i>
            </a>
            <a href="https://twitter.com/swsdfksa" target="_blank" rel="noopener noreferrer" aria-label="X">
              <i class="fa-brands fa-x-twitter" aria-hidden="true"></i>
            </a>
            <a href="https://www.tiktok.com/@swsdfksa" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <i class="fa-brands fa-tiktok" aria-hidden="true"></i>
            </a>
            <a href="https://www.linkedin.com/company/swsdf" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <i class="fa-brands fa-linkedin-in" aria-hidden="true"></i>
            </a>
            <a href="https://www.youtube.com/@swsdfksa" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <i class="fa-brands fa-youtube" aria-hidden="true"></i>
            </a>
            <a href="https://www.snapchat.com/add/swsdfksa" target="_blank" rel="noopener noreferrer" aria-label="Snapchat">
              <i class="fa-brands fa-snapchat" aria-hidden="true"></i>
            </a>
          </nav>
        </div>
      </div>

      <div class="workspace-footer__bottom">
        <p>&copy; {{ t('copyrights', { year }) }}</p>
        <span class="workspace-footer__domain" dir="ltr">swsdf.sa</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { WEB_BASE_URL } from "@/v3/config/apiEndpoints";

const { locale, t } = useI18n();
const year = computed(() => new Date().getFullYear());
const normalizedLocale = computed(() => locale.value === "en" ? "en" : "ar");
const externalHome = computed(() => {
  const base = String(WEB_BASE_URL || "https://swsdf.sa/").replace(/\/+$/, "");
  return `${base}/${normalizedLocale.value}`;
});
</script>

<style scoped lang="scss">
.workspace-footer {
  --footer-navy: #062f55;
  --footer-navy-deep: #03243f;
  --footer-blue: #168bc1;
  --footer-cyan: #55c5dc;
  position: relative;
  isolation: isolate;
  margin-top: auto;
  overflow: hidden;
  color: #fff;
  background:
    radial-gradient(circle at 85% 10%, rgba(85, 197, 220, 0.12), transparent 28rem),
    linear-gradient(135deg, var(--footer-navy-deep), var(--footer-navy));
}

.workspace-footer__current {
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--footer-blue) 0 28%,
    var(--footer-cyan) 28% 48%,
    #6954b5 48% 68%,
    var(--footer-blue) 68% 100%
  );
}

.workspace-footer__inner {
  padding-top: 1.75rem;
  padding-bottom: 1rem;
}

.workspace-footer__main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.workspace-footer__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  border-radius: 0.75rem;
  transition: opacity 160ms ease, transform 160ms ease;
}

.workspace-footer__brand img {
  display: block;
  object-fit: contain;
  filter: brightness(0) invert(1);
  opacity: 0.92;
}

.workspace-footer__symbol {
  width: 3.5rem;
  height: 3.5rem;
}

.workspace-footer__wordmark {
  width: min(15rem, 48vw);
  max-height: 2.8rem;
}

.workspace-footer__brand:hover {
  opacity: 0.82;
  transform: translateY(-1px);
}

.workspace-footer__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.8rem;
}

.workspace-footer__social {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.4rem;
}

.workspace-footer__social a {
  width: 2.25rem;
  height: 2.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 0.625rem;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.76);
  text-decoration: none;
  transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease;
}

.workspace-footer__social a:hover {
  border-color: rgba(85, 197, 220, 0.42);
  background: rgba(85, 197, 220, 0.14);
  color: #fff;
  transform: translateY(-1px);
}

.workspace-footer__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.25rem;
  padding-top: 0.9rem;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.64);
  font-size: 0.8125rem;
}

.workspace-footer__bottom p {
  margin: 0;
}

.workspace-footer__domain {
  color: rgba(255, 255, 255, 0.72);
  font-weight: 700;
  letter-spacing: 0.05em;
}

.workspace-footer a:focus-visible {
  outline: 3px solid rgba(85, 197, 220, 0.72);
  outline-offset: 3px;
}

@media (max-width: 639px) {
  .workspace-footer__inner {
    padding-top: 1.4rem;
  }

  .workspace-footer__main,
  .workspace-footer__bottom {
    align-items: stretch;
    flex-direction: column;
  }

  .workspace-footer__main {
    gap: 1.25rem;
  }

  .workspace-footer__brand {
    align-self: flex-start;
  }

  .workspace-footer__symbol {
    width: 3rem;
    height: 3rem;
  }

  .workspace-footer__wordmark {
    width: min(13rem, 56vw);
  }

  .workspace-footer__actions {
    width: 100%;
    align-items: stretch;
  }

  .workspace-footer__social {
    justify-content: flex-start;
  }

  .workspace-footer__bottom {
    gap: 0.35rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .workspace-footer__brand,
  .workspace-footer__social a {
    transition: none;
  }
}
</style>
