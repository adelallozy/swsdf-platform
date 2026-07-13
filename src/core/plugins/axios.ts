import type { App } from 'vue'
import axios from "axios";
import i18n from "./i18n";
import VueAxios from "vue-axios";
import router from "@/router/index.js";



const TOKEN = localStorage.getItem('jwt_token');
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true

if (TOKEN) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${TOKEN}`;
}

axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.common["Accept-language"] = i18n.global.locale.value;


export async function registerAxios(app: App) {
    app.use(VueAxios, axios);
}

axios.interceptors.request.use(
    function (config) {
        return config;
    },
    function (error) {
        if (error.response.status == "401") {
            const currentRoute = router.currentRoute.value.fullPath
            localStorage.removeItem("jwt-token");
            localStorage.removeItem("jwt_token_expiry");
            localStorage.removeItem("user-data");
            localStorage.removeItem("jwt_token");
            if (currentRoute != '/auth/sign-in' && currentRoute != '/auth/sign-up' && currentRoute != '/auth/forget-password') {

                localStorage.setItem("last_page", currentRoute)
                router.push('/auth/sign-in')

                // location.reload();

            }
        }
            // if (error.response.status == 404) {

            //   router.push({ name: "404" });
            // }

        return Promise.reject(error);
    }
);

axios.interceptors.response.use( 
    (res) => res ,
    (error)=> {
        if (error.response.status == "401") {
        const currentRoute = router.currentRoute.value.fullPath
        localStorage.removeItem("jwt_token_expiry");
        localStorage.removeItem("user-data");
        localStorage.removeItem("jwt-token");
        localStorage.removeItem("jwt_token");
        if (currentRoute != '/auth/sign-in' && currentRoute != '/auth/sign-up' && currentRoute != '/auth/forget-password') {

            localStorage.setItem("last_page", currentRoute)
            router.push('/auth/sign-in')
            // location.reload();
        }

        }
        // if (error.response.status == 404) {

        //   router.push({ name: "404" });
        // }
        return Promise.reject(error);
    }
);
