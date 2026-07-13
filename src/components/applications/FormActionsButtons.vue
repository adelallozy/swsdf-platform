<template>
  <div class="d-flex flex-stack pt-10 justify-content-end">
    <button
      type="button"
      class="btn btn-lg btn-primary  "
      @click="emitClick()" 
      :disabled ="!enabled"
    >
      <span  v-if="!loadIndicator "  class="indicator-label">
        {{ t('Submit') }}
        <span class="svg-icon svg-icon-3 ms-2 me-0">
          <inline-svg
            src="/platform/media/icons/duotune/arrows/arr063.svg"
            v-if="userStore.locale == 'ar'"
          />
          <inline-svg
            src="/platform/media/icons/duotune/arrows/arr064.svg"
            v-else
          />
        </span>
      </span>

 
      <span v-if="loadIndicator " class="indicator-progress d-inline-block">
        {{ t('Please wait') }} ...
        <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
      </span>
    </button>

  </div>
</template>

<script>
import { reactive, ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n';

import { useUserStore }from '@/store/user.js';
import { useApplicationStore }from '@/store/application.js';

export default {
  props: ['enabled', 'loadIndicator'],

  setup(props, { emit }) {

    const userStore = useUserStore();
    const applicationStore = useApplicationStore();
    const { t, te } = useI18n();
     
    const emitClick = () =>{ emit('submitForm' ) , emit('clicked' )  } ;
    return { emitClick, t,  userStore, applicationStore }

  },
}
</script>
