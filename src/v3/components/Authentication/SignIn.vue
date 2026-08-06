<template>
    <div class="auth_login">
        <div class="tw-w-full md:tw-max-w-xl xl:tw-mx-0 tw-max-w-[600px]">
        <h1 class="tw-text-4xl md:tw-text-5xl tw-capitalize tw-font-bold tw-mt-3 tw-mb-4 lg:tw-mb-11">
            {{$t("Welcome Back")}}
        </h1>

        <div class="login_type">
            <div class="login_form">
            <div class="xl:tw-max-w-2xl">
                <form @submit.prevent="onSubmit">
                    <!-- Email -->
                    <div class="tw-mb-2">
                        <div class="tw-flex tw-flex-col tw-gap-1">
                            <label for="email" class="tw-font-medium tw-text-p-text">{{$t('Email')}}</label>
                            <InputText
                                id="email"
                                v-model.trim="form.email"
                                type="email"
                                :placeholder="$t('Enter your email')"
                                autocomplete="username"
                                :invalid="!!errors.email"
                            />
                            <small v-if="errors.email" class="p-error">{{ $t(errors.email) }}</small>
                        </div>
                    </div>

                    <!-- Password -->
                    <div class="tw-mb-2">
                        <div class="tw-flex tw-flex-col tw-gap-1">
                            <label for="password" class="tw-font-medium tw-text-p-text">{{$t('Password')}}</label>
                            <Password
                                inputId="password"
                                v-model.trim="form.password"
                                :placeholder="$t('Enter your password')"
                                :feedback="false"
                                toggleMask
                                class="tw-w-full"
                                :inputProps="{ autocomplete: 'current-password', class: 'tw-w-full' }"
                                :invalid="!!errors.password"
                            />
                            <small v-if="errors.password" class="p-error">{{ $t(errors.password) }}</small>
                        </div>
                    </div>

                    <!-- Forgot link -->
                    <RouterLink
                        :to="{ name: 'forgot-password', params: { locale: authLocale } }"
                        class="tw-mt-3 tw-text-end tw-block tw-pe-2 tw-text-primary tw-mb-0 tw-font-medium"
                    >
                        {{$t('Forgot your password?')}}
                    </RouterLink>

                    <!-- API/global error -->
                    <!-- Rate limit error — centered banner -->
                    <div v-if="rateLimitError" class="tw-bg-red-50 tw-border tw-border-red-400 tw-text-red-700 tw-rounded-lg tw-p-4 tw-mt-4 tw-text-center">
                        <p class="tw-font-semibold">{{ $t('Too Many Requests') }}</p>
                        <p class="tw-text-sm tw-mt-1">{{ rateLimitError }}</p>
                    </div>

                    <p v-if="apiError" class="tw-text-danger tw-text-center tw-mt-3">{{ $t(apiError) }}</p>

                    <!-- Submit -->
                    <Button
                        type="submit"
                        class=" tw-mt-11 tw-w-full p-button p-button-primary "
                        :label="$t('Login')"
                        :loading="submitting"
                        :disabled="submitting"
                    />
                </form>

                <!-- Signup hint -->
                <p class="tw-mt-5 tw-text-center tw-text-muted tw-mb-0 tw-text-sm">
                {{$t("Don't have an account?")}}
                <RouterLink :to="{ name: 'sign-up', params: { locale: authLocale } }" class="tw-text-primary tw-ms-1 tw-font-medium">
                    {{$t('Create account')}}
                </RouterLink>
                </p>
            </div>
            </div>
        </div>
        </div>
 
    </div>
</template>

<script setup>
    import { reactive, ref, computed } from 'vue'
    import { useRouter, useRoute } from 'vue-router'
    import { useI18n } from 'vue-i18n'
    import InputText from 'primevue/inputtext'
    import Password from 'primevue/password'
    import Button from 'primevue/button' 
    import { useToast } from 'primevue/usetoast'; 
    import { signIn, signOut, isAuthenticated } from '@/v3/composables/useAuth.js'

    import {useErrorHandler} from '@/v3/composables/useErrorHandler.js';
    import {useNotification}  from '@/v3/composables/useNotification.js';
    const { success: notifySuccess, error, warn } = useNotification();

    const router = useRouter()
    const route = useRoute()
    const { locale } = useI18n()
    const toast = useToast()  

    const { capture } = useErrorHandler()

    const form = reactive({
        email: '',
        password: ''
    }) 

    const errors = reactive({
        email: '',
        password: ''
    })

    const submitting = ref(false)
    const apiError = ref('')
    const rateLimitError = ref('')
    const authLocale = computed(() => {
        const routeLocale = route.params?.locale
        if (routeLocale === 'ar' || routeLocale === 'en') {
            return routeLocale
        }
        return locale.value === 'en' ? 'en' : 'ar'
    })

    // Get redirect path from query params or localStorage
    const redirectPath = computed(() => {
        // Priority 1: Query parameter from router (e.g., ?redirect=/dashboard)
        if (route.query.redirect) {
            return route.query.redirect
        }
        
        // Priority 2: Last page from localStorage (legacy support)
        const lastPage = localStorage.getItem('last_page')
        if (lastPage) {
            return lastPage
        }
        
        // Priority 3: Default to home
        return '/'
    })

    function validate() {
        errors.email = ''
        errors.password = ''
        apiError.value = ''

        if (!form.email) {
            errors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errors.email = 'Invalid email address'
        }

        if (!form.password) {
            errors.password = 'Password is required'
        } else if (form.password.length < 6) {
            errors.password = 'Password must be at least 6 characters'
        }

        return !errors.email && !errors.password
    }

    async function onSubmit() {
        if (!validate()) return;

        submitting.value = true
        apiError.value = ''
        rateLimitError.value = ''

        try {
            const response = await signIn(form);

            if (response.rateLimited) {
                rateLimitError.value = response.errorMessage || 'Too many login attempts. Please wait and try again.';
                return;
            }

            if (response.verificationRequired) {
                toast.add({
                    severity: 'info',
                    summary: 'Email Verification',
                    detail: 'Please verify your email to continue.',
                    life: 3000
                });
                router.push({
                    name: 'verify-email',
                    params: { locale: authLocale.value },
                    query: { email: response.email }
                });
                return;
            }

            if (isAuthenticated.value) {
                toast.add({ 
                    severity: 'success', 
                    summary: 'Login', 
                    detail: 'You have successfully logged in!', 
                    life: 2500 
                })

                // Clean up localStorage
                localStorage.removeItem('last_page')

                // Get the redirect path
                const targetPath = redirectPath.value

                console.log('🔄 Redirecting after login:', targetPath)

                // Redirect to the target path
                router.push(targetPath)
            } else {
                apiError.value = response.errorMessage;
                error(response.errorMessage || 'An unexpected error occurred', {
                    summary: 'Login Failure',
                    life: 3000
                });
            }

        } catch (e) {
            console.log('❌ Login error:', e.message);
            const message = e?.message || 'An unexpected error occurred'
            apiError.value = message;

            error(message, {
                summary: 'Login Failure',
                life: 3000
            });

        } finally {
            submitting.value = false
        }
    }
</script>
