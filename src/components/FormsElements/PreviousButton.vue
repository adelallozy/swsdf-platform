<template>
    <button
        type="button"
        class="btn btn-lg btn-light-primary me-3"
         
    >
        <span class="svg-icon svg-icon-3 ms-2 me-0">
            <inline-svg
                src="/platform/media/icons/duotune/arrows/arr064.svg"
                v-if="userStore.locale == 'ar'"
            />
            <inline-svg
                src="/platform/media/icons/duotune/arrows/arr063.svg"
                v-else
            />
        </span>
        {{ t('Previous') }}
    </button>
</template>

<script>
    import { reactive, ref, computed, onMounted } from 'vue'
    import { useI18n } from 'vue-i18n';

    import { useUserStore }from '@/store/user.js'; 

    export default { 

        setup(props, { emit }) {
            const userStore = useUserStore();  
            const { t  } = useI18n();
            
            const emitClick = (e) =>{ 
                emit('click' ); 
                e.target.blur();
            } ;
            return { emitClick, t,  userStore }
        },

    }
</script>