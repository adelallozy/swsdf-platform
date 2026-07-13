<template>
    <div class="d-flex flex-column mb-7 fv-row">
        <!-- Input group control -->
        <label
          class="d-flex align-items-center fs-6 fw-bold form-label mb-2"
          for="work_contract_dive_center_id"
        >
        <slot name="input-lable"></slot> 
        </label>
        <slot name="input-control" ></slot>
 
        <slot name="input-error"></slot>
      </div>
</template>

<script lang="ts"> 

import { defineComponent } from "vue";

export default defineComponent({
    name: "input-group",
    components: {},
    setup() { },
});

</script>