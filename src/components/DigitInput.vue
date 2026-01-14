<template>
  <div class="flex justify-between gap-2" @paste="handlePaste">
    <input
      v-for="(_, index) in digits"
      :key="index"
      ref="inputs"
      v-model="digits[index]"
      type="text"
      maxlength="1"
      inputmode="numeric"
      pattern="[0-9]*"
      class="w-full h-14 text-center text-2xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white/50 transition-all duration-200"
      @input="handleInput(index, $event)"
      @keydown="handleKeyDown(index, $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  modelValue: string;
  length?: number;
}

const props = withDefaults(defineProps<Props>(), {
  length: 6
});

const emit = defineEmits(['update:modelValue', 'complete']);

const digits = ref(new Array(props.length).fill(''));
const inputs = ref<HTMLInputElement[]>([]);

// Initialize digits from modelValue if provided
watch(() => props.modelValue, (newVal) => {
  if (newVal.length === props.length && newVal !== digits.value.join('')) {
    for (let i = 0; i < props.length; i++) {
      digits.value[i] = newVal[i] || '';
    }
  }
}, { immediate: true });

watch(digits, (newDigits) => {
  const code = newDigits.join('');
  emit('update:modelValue', code);
  if (code.length === props.length) {
    emit('complete', code);
  }
}, { deep: true });

const handleInput = (index: number, e: Event) => {
  const input = e.target as HTMLInputElement;
  const value = input.value;
  
  if (value && index < props.length - 1) {
    inputs.value[index + 1]?.focus();
  }
};

const handleKeyDown = (index: number, e: KeyboardEvent) => {
  if (e.key === 'Backspace' && !digits.value[index] && index > 0) {
    inputs.value[index - 1]?.focus();
  }
};

const handlePaste = (e: ClipboardEvent) => {
  const pastedData = e.clipboardData?.getData('text').slice(0, props.length).replace(/[^0-9]/g, '');
  if (pastedData) {
    pastedData.split('').forEach((char, i) => {
      if (i < props.length) digits.value[i] = char;
    });
    const nextIndex = Math.min(pastedData.length, props.length - 1);
    inputs.value[nextIndex]?.focus();
  }
};
</script>
