<template>
  <div class="group">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1 ml-1">
      {{ label }}
    </label>
    <div :class="[showButton ? 'flex space-x-2' : '']">
      <div class="relative flex-1">
        <input
          :id="id"
          :type="type"
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          :placeholder="placeholder"
          :required="required"
          :autocomplete="autocomplete"
          :disabled="disabled"
          :class="[
            'appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:border-blue-500 sm:text-sm transition-all duration-200 ease-in-out bg-white/50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-red-300 focus:border-red-500' : ''
          ]"
        />
        <slot name="suffix"></slot>
      </div>
      <slot name="button"></slot>
    </div>
    <p v-if="error" class="mt-1 ml-1 text-xs text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  id?: string;
  label?: string;
  modelValue: string | number;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autocomplete?: string;
  disabled?: boolean;
  showButton?: boolean;
  error?: string;
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
  showButton: false,
  error: ''
});

defineEmits(['update:modelValue']);
</script>
