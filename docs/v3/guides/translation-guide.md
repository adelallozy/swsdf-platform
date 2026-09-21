# Translation Guide for V3 Components

## Overview

This guide establishes translation strategy for V3 components in SWSDF website.

## Core Translation Rule

### English Text
- **DO NOT** add English translations to `src/locales/en.json`
- Use **hardcoded English text** directly in Vue components
- English is the default/fallback language and should be written as literal strings in code
- The i18n runtime has locale fallback disabled and uses the missing literal key
  itself as the formatted English output. Generic missing/fallback warnings are
  disabled because absent English mirror entries are intentional. In development,
  a custom warning reports missing Arabic translations only; the translation
  audit remains the comprehensive check.

### Arabic Text
- **MUST** add Arabic translations to `src/locales/ar.json`
- Use **actual English word** as the translation key: `{{ $t('English Word') }}`
- Arabic translations are the only required translations

## Example Implementation

### ❌ INCORRECT - Using nested translation keys

**In component (ApplicantProfileCard.vue):**
```vue
<span>{{ $t('userProfile.title') }}</span>
```

**In ar.json:**
```json
{
  "userProfile": {
    "title": "الملف الشخصي"
  }
}
```

### ✅ CORRECT - Using English word as translation key

**In component (ApplicantProfileCard.vue):**
```vue
<span>{{ $t('User Profile') }}</span>
```

**In ar.json:**
```json
{
  "User Profile": "الملف الشخصي"
}
```

**Note:** The English word itself is used as the translation key. Only Arabic translation is provided in ar.json.

## When to Use Translation Keys

Use `{{ $t('English Word') }}` ONLY when:
1. The text needs to be displayed in Arabic
2. The component will be viewed by Arabic-speaking users

**Important**: The translation key must be the exact English word/phrase that appears in the UI.

## Benefits of This Approach

1. **Simpler Code**: No need to maintain duplicate English translations in JSON files
2. **Single Source of Truth**: English text lives directly in components where it's used
3. **Reduced Maintenance**: Only Arabic translations need to be maintained
4. **Clear Intent**: Code is more readable with English literals visible

## Migration Checklist

When converting existing components:

- [ ] Remove all English translation keys from `src/locales/en.json`
- [ ] Replace `{{ $t('english.key') }}` with hardcoded English text in components
- [ ] Keep all Arabic translation keys in `src/locales/ar.json`
- [ ] Verify Arabic translations are complete and accurate
- [ ] Test component in both English and Arabic locales

## Example: ApplicantProfileCard Component

### Before (with nested translation keys - INCORRECT):
```vue
<!-- Template -->
<span>{{ $t('userProfile.title') }}</span>
<span>{{ $t('userProfile.editProfile') }}</span>
```

```json
// ar.json
{
  "userProfile": {
    "title": "الملف الشخصي",
    "editProfile": "تعديل الملف الشخصي"
  }
}
```

### After (using English words as keys - CORRECT):
```vue
<!-- Template -->
<span>{{ $t('User Profile') }}</span>
<span>{{ $t('Edit Profile') }}</span>
<span>{{ $t('Full Name (Arabic)') }}</span>
```

```json
// ar.json
{
  "User Profile": "الملف الشخصي",
  "Edit Profile": "تعديل الملف الشخصي",
  "Full Name (Arabic)": "الاسم الكامل (عربي)"
}
```

## Validation Messages

For validation errors and user-facing messages that need Arabic:

```vue
<script setup>
const { t } = useI18n()

const validationErrors = computed(() => {
  const errors = []
  
  if (!hasName) {
    // Use exact English phrase as translation key
    errors.push(t('Full name is required (Arabic or English)'))
  }
  
  return errors
})
</script>
```

```json
// ar.json
{
  "Full name is required (Arabic or English)": "الاسم الكامل مطلوب (عربي أو إنجليزي)"
}
```

## Best Practices

1. **Always write English text in code** - Never use translation keys for English
2. **Provide complete Arabic translations** - Every user-facing text should have Arabic
3. **Use exact English word as key** - The translation key must match the English text exactly (e.g., `{{ $t('User Profile') }}`)
4. **Keep translations flat** - Avoid nested objects; use the English phrase directly as the key
5. **Test both locales** - Verify components work correctly in English and Arabic

## ⚠️ FORBIDDEN CHARACTERS in Translation Keys

### Critical Rule: NO Special Characters in Placeholders or Labels

**Vue I18n v9+ reserves special characters** for message formatting syntax. Using these characters in translation keys, placeholders, or labels will cause errors.

### Forbidden Characters

| Character | Purpose in Vue I18n | Example of BAD Usage |
|-----------|-------------------|---------------------|
| `@` | Linked messages (`@:key`) | `placeholder: 'Enter email (name@example.com)'` ❌ |
| `{` `}` | Interpolation (`{name}`) | `label: 'User {name}'` ❌ |
| `$` | Custom modifiers (`$.lower:key`) | `placeholder: '$100'` ❌ |
| `\|` | Pluralization syntax | `label: 'Age \| Gender'` ❌ |

### Examples of INCORRECT Usage

```javascript
// ❌ WRONG - Email address in placeholder
email: {
    label: 'Email',
    placeholder: 'Enter email (name@example.com)' // ERROR: @ symbol
}

// ❌ WRONG - Curly braces in text
age: {
    label: 'Age {years}', // ERROR: {} for interpolation
    placeholder: 'Enter age in {years}' // ERROR: {} for interpolation
}

// ❌ WRONG - Dollar sign
price: {
    label: 'Price ($)', // ERROR: $ for modifiers
    placeholder: 'Enter amount ($)' // ERROR: $ for modifiers
}
```

### Examples of CORRECT Usage

```javascript
// ✅ CORRECT - Simple text without special characters
email: {
    label: 'Email',
    placeholder: 'Enter email address'
}

// ✅ CORRECT - Simple text
age: {
    label: 'Age',
    placeholder: 'Enter age'
}

// ✅ CORRECT - Simple text
price: {
    label: 'Price',
    placeholder: 'Enter amount'
}
```

### Why This Restriction Exists

Vue I18n v9+ uses a **message format compiler** that interprets special characters as syntax:

- `@:key` → Links to another translation message
- `{name}` → Interpolates a variable
- `$.lower:key` → Applies a modifier to a linked message

When these characters appear in translation keys, Vue I18n tries to parse them as syntax, causing:
- `SyntaxError: Invalid linked format`
- `SyntaxError: Invalid interpolation format`
- Application crashes or broken UI

### Schema Development Guidelines

When defining schemas for MasterForm or other components:

1. **Keep placeholders simple** - Use plain text like "Enter email" not "Enter email (user@domain.com)"
2. **Avoid examples in placeholders** - If you need to show format, use a separate help text element
3. **Use translation keys for examples** - Store example formats in locale files, not in schema placeholders

```javascript
// ✅ CORRECT - Use separate help text for format examples
email: {
    label: 'Email',
    placeholder: 'Enter email address',
    help: 'Example: user@domain.com' // This can be translated separately
}
```

### Enforcement

- **Code Review**: Check all schema files for forbidden characters in `label`, `placeholder`, and `help` properties
- **Testing**: Test forms in Arabic locale to ensure no translation errors occur
- **Documentation**: This guide serves as the authoritative reference for translation rules

## Common Patterns

### Static Labels
```vue
<!-- Use exact English label as translation key -->
<div class="tw-text-xs tw-text-slate-500">{{ $t('Full Name (Arabic)') }}</div>
<div class="tw-text-xs tw-text-slate-500">{{ $t('Identity Number') }}</div>
```

### Dynamic Content with Translation
```vue
<!-- Use exact English phrase as translation key -->
<p>{{ $t('Full name is required (Arabic or English)') }}</p>
```

### Status Messages
```vue
<!-- Use exact English word as translation key -->
<span v-if="status === 'verified'">{{ $t('Verified') }}</span>
<span v-else>{{ $t('Unverified') }}</span>
```

## Summary

| Language | Location | Method |
|----------|-----------|--------|
| English | Vue Component | Hardcoded text literal |
| Arabic | `src/locales/ar.json` | Translation key `{{ $t('Exact English Word') }}` |

**Remember**:
- English translations in `en.json` are NOT required and should be removed
- Only Arabic translations are mandatory
- The translation key MUST be the exact English word/phrase used in the UI
- Do NOT use nested keys like `userProfile.title` - use the English word directly
