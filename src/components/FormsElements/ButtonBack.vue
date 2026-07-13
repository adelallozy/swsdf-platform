<template>
    <button
          type="button"
          class="btn btn-sm btn-light px-3"
          @click="emitClick"
        >
          <span class="svg-icon svg-icon-4  " v-if="userStore.locale == 'ar'">
            <inline-svg src="/platform/media/icons/duotune/arrows/arr064.svg" />
          </span>
          <span class="svg-icon svg-icon-4  " v-else>
            <inline-svg src="/platform/media/icons/duotune/arrows/arr063.svg" />
          </span>
          
          {{ t('Cancel') }}
    </button>
</template>
<script>
     
    import { useUserStore }from '@/store/user.js';
    import { useI18n } from 'vue-i18n';

    export default { 

        setup(props, { emit }) {
            const userStore = useUserStore(); 
            const { t  } = useI18n();
            
            const emitClick = () =>{  emit('clicked' )  } ;
            return { emitClick, t,  userStore }

        },
    }
    
</script>