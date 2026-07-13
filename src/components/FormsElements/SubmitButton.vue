<template>
            <button
              type="button"
              class="btn btn-lg btn-primary me-3"
              :disabled="!enabled"
            >
              <span v-if ="!loadIndicator"  class="indicator-label"> 
                <span  class="svg-icon svg-icon-3 ms-2 me-0">
                {{ t('Submit') }}
                  <inline-svg
                    src="/platform/media/icons/duotune/arrows/arr094.svg"
                    :style="[ userStore.locale == 'ar' ? 'transform: scaleX(-1)' : '' ] "
                  />
 
                </span>
              </span>
              <span v-else class="indicator-progress" :class="{ 'd-inline-block':loadIndicator}">
                {{ t('Please wait') }}...
                <span class="spinner-border spinner-border-sm align-middle ms-2"
                  ></span>
              </span>
            </button>   
</template>
<script>
    import { reactive, ref, computed, onMounted } from 'vue'
    import { useI18n } from 'vue-i18n';

    import { useUserStore }from '@/store/user.js';
    import { useApplicationStore }from '@/store/application.js';

    export default { 
        props:['loadIndicator' , 'enabled'] ,
        setup(props, { emit }) {
            const userStore = useUserStore(); 
            const { t  } = useI18n();
             
            return {   t,  userStore }

        },

    }

</script>