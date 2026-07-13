<template>
    <div>
        <base-card1 class="tw-mb-3">
        <div class="tw-flex tw-justify-between tw-gap-3 tw-flex-wrap tw-mb-4">
            <h3
            class="tw-flex tw-gap-2 tw-justify-between tw-items-center tw-text-foreground tw-font-medium tw-flex-wrap"
            >
            <span class="lg:!tw-text-xl tw-font-bold">
                {{ $t('Fee Summary')}}
            </span>
            </h3> 
        </div>

        <div class="">

            <p> 
                <RouterLink
                    v-if = "['Confirmed' , 'Invoice Created'  ,'Cancelled'].includes( quotation?.status) "
                    :to="{ name: 'invoice-review', params: { id: quotation.id, locale: $i18n.locale } }"
                    class="tw-btn tw-px-3  tw-bg-green-600 tw-text-white tw-rounded-lg tw-mt-2" >
                    {{ $t('Pay Invoice') }}  
                </RouterLink>
                <RouterLink
                    v-if = "[ 'Paid'].includes( quotation?.status) "
                    :to="{ name: 'invoice-review', params: { id: quotation.id, locale: $i18n.locale } }"
                    class="tw-btn tw-px-3  tw-bg-green-600 tw-text-white tw-rounded-lg tw-mt-2" >
                    {{ $t('View Invoice') }}  
                </RouterLink>
            </p> 
            <br>

            <table
                    class=" tw-rounded-lg">
                    <thead>
                        <tr 
                            class="tw-bg-sky-200 tw-px-4 tw-border-y tw-border-sky-800 tw-py-3 tw-text-start tw-font-medium tw-text-foreground">
                            <td
                            class="tw-w-16 tw-border-x tw-border-sky-800 tw-px-4 tw-py-2 tw-font-semibold"> # </td>
                            <td
                                class="  tw-border-x tw-border-sky-800 tw-px-4 tw-py-2 tw-font-semibold"> {{ $t('Description') }}</td>
                            <td
                                class="tw-w-16  tw-border-x tw-border-sky-800 tw-px-4 tw-py-2 tw-font-font-semibold"> {{ $t('Price') }}</td>
                            <td
                                class="tw-border-x tw-border-sky-800 tw-px-4 tw-py-2 tw-font-semibold"> {{ $t('Number') }} </td>
                            <td
                            class="tw-border-x tw-border-sky-800 tw-px-4 tw-py-2 tw-font-semibold"> {{ $t('Total') }} </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="service , i in quotation?.items"
                            :key="service.id"
                            class="even:tw-bg-sky-50 tw-border-sky-800  tw-px-4 tw-border-b tw-py-3 tw-text-start tw-font-medium tw-text-foreground"
                        >
                            <td
                                class="tw-border-x tw-border-sky-800 tw-px-4 tw-py-2 " > {{ i + 1 }}</td>
                            <td
                                class="tw-border-x tw-border-sky-800 tw-px-4 tw-py-2 " >{{ $t(service.description) }}</td>
                            <td 
                                class="tw-border-e tw-border-sky-800 tw-px-4 tw-py-2 " >{{ service.price }} </td>
                            <td
                                class="tw-border-e tw-border-sky-800  tw-px-4 tw-py-2 " >{{ service.qty }} </td>
                            <td
                                class="tw-border-e tw-border-sky-800  tw-px-4 tw-py-2 " >{{ service.amount }} </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr	>
                            <td
                                class=" tw-border-sky-800 tw-px-4 tw-py-2 " ></td>
                            <td
                                colspan="3"
                                class=" tw-border-sky-800 tw-px-4 tw-py-2 text-end " >{{ $t('Total amount') }}</td>
    
                            <td
                                class="  tw-border-sky-800  tw-px-4 tw-py-2 " >{{ quotation.net_amount	 }} </td>
                        </tr>
                    </tfoot>
                </table>

        </div>
        </base-card1>
    </div>

</template>

<script setup>
    import { RouterLink } from 'vue-router';

    
    const props = defineProps({
    quotation: {
        required: true,
    },
    
    });
 
</script>
 