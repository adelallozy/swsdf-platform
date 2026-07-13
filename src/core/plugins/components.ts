import InputButton from "@/components/inputs/InputButton.vue";
import InputBase from "@/components/inputs/InputBase.vue";
import InputFile from "@/components/inputs/InputFile.vue";
import InputPassword from "@/components/inputs/InputPassword.vue";
import InputImage from "@/components/inputs/InputImage.vue";
import InputPhone from "@/components/inputs/InputPhone.vue";
import SimpleSelect from "@/components/inputs/SimpleSelect.vue";
import GeneralBreadcrumb from "@/components/general/GeneralBreadcrumb.vue";
import BaseCard from "@/website/components/cards/BaseCard.vue"
import BaseCard1 from "@/website/components/cards/BaseCard1.vue"
import Loader from "@/website/components/Loader.vue"

import type { App } from 'vue'
export async function registerComponents(app: App) {
  app.component("InputButton", InputButton);
  app.component("InputBase", InputBase);
  app.component("InputFile", InputFile);
  app.component("BaseCard", BaseCard);
  app.component("BaseCard1", BaseCard1);
  app.component("Loader", Loader);


  app.component("SimpleSelect", SimpleSelect);
  app.component("InputPassword", InputPassword);
  app.component("InputImage", InputImage);
  app.component("InputPhone", InputPhone);
  app.component("GeneralBreadcrumb", GeneralBreadcrumb);

}
