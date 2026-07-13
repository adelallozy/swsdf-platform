import { App } from "vue";
import axios from "axios";
import VueAxios from "vue-axios";
import { AxiosResponse, AxiosRequestConfig } from "axios";
import LocalStorage from "@/assets/js/LocalStorage.js";


const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

/**
 * @description service to call HTTP request via Axios
 */


class ApiService {
    /**
     * @description property to share vue instance
     */
    public static vueInstance: App;

    /**
     * @description initialize vue axios
     */
    public static init(app: App<Element>) {

        const acceptedLanguages = {

            // 'ar' : "ar-SA,ar;" ,
            // 'en' : "en-US,en;" ,
            'ar': "ar-SA",
            'en': "en-US"
        };

        const locale = LocalStorage.getLocale();

        ApiService.vueInstance = app;
        ApiService.vueInstance.use(VueAxios, axios);
        ApiService.vueInstance.axios.defaults.baseURL = import.meta.env.VITE_APP_API_URL;
        ApiService.vueInstance.axios.defaults.headers.common['Content-Type'] = 'multipart/form-data';
        ApiService.vueInstance.axios.defaults.headers.common["Accept-Language"] = acceptedLanguages[locale];
        // ApiService.vueInstance.axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
        ApiService.vueInstance.axios.defaults.withCredentials = true;

    }

    /**
     * @description set the default HTTP request headers
     */

    public static setHeader(): void {
        ApiService.vueInstance.axios.defaults.headers.common[
            "Authorization"
        ] = `Bearer ${LocalStorage.getJWToken()}`;
        ApiService.vueInstance.axios.defaults.headers.common["Accept"] = "application/json";
    }

    /**
     * @description send the GET HTTP request
     * @param resource: string
     * @param params: AxiosRequestConfig
     * @returns Promise<AxiosResponse>
     */
    public static query(
        resource: string,
        params: AxiosRequestConfig
    ): Promise<AxiosResponse> {
        return ApiService.vueInstance.axios.get(resource, params);
    }

    /**
     * @description send the GET HTTP request
     * @param resource: string
     * @param slug: string
     * @returns Promise<AxiosResponse>
     */
    public static get(
        resource: string,
        slug = "" as string
    ): Promise<AxiosResponse> {
        return ApiService.vueInstance.axios.get(`${resource}/${slug}`);
    }

    /**
     * @description set the POST HTTP request
     * @param resource: string
     * @param params: AxiosRequestConfig
     * @returns Promise<AxiosResponse>
     */
    public static post(
        resource: string,
        params: AxiosRequestConfig
    ): Promise<AxiosResponse> {
        return ApiService.vueInstance.axios.post(`${resource}`, params);
    }

    /**
     * @description send the UPDATE HTTP request
     * @param resource: string
     * @param slug: string
     * @param params: AxiosRequestConfig
     * @returns Promise<AxiosResponse>
     */
    public static update(
        resource: string,
        slug: string,
        params: AxiosRequestConfig
    ): Promise<AxiosResponse> {
        return ApiService.vueInstance.axios.put(`${resource}/${slug}`, params);
    }

    /**
     * @description Send the PUT HTTP request
     * @param resource: string
     * @param params: AxiosRequestConfig
     * @returns Promise<AxiosResponse>
     */
    public static put(
        resource: string,
        params: AxiosRequestConfig
    ): Promise<AxiosResponse> {
        return ApiService.vueInstance.axios.put(`${resource}`, params);
    }

    /**
     * @description Send the DELETE HTTP request
     * @param resource: string
     * @returns Promise<AxiosResponse>
     */
    public static delete(resource: string): Promise<AxiosResponse> {
        return ApiService.vueInstance.axios.delete(resource);
    }

    public static responseIntercept(onSuccess: any, onFailure: any) {
        ApiService.vueInstance.axios.interceptors.response.use(onSuccess, onFailure);
    }

}

export default ApiService;
