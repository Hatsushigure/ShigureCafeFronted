<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col md:flex-row gap-6 items-center md:items-start">
      <!-- Cropper Area -->
      <div class="h-80 w-full md:flex-1 rounded-lg overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
        <Cropper
          ref="cropper"
          :src="imgSrc"
          :stencil-component="CircleStencil"
          :stencil-props="{ aspectRatio: 1 }"
          :auto-zoom="true"
          image-restriction="fit-area"
          class="h-full w-full"
          background-class="cropper-background"
          @change="onChange"
        />
      </div>

      <!-- Preview Area -->
      <div class="flex flex-col items-center gap-4 min-w-[140px] w-full md:w-auto">
        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">{{ t('notices.editor.preview') }}</span>
        
        <div class="flex flex-row md:flex-col items-center justify-center gap-6 md:gap-8">
          <div class="group relative">
            <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-white shadow-md bg-white ring-1 ring-gray-100">
              <Preview
                :coordinates="result.coordinates"
                :image="result.image"
                :stencil-component="CircleStencil"
                class="w-full h-full"
              />
            </div>
            <span class="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gray-800 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">128x128</span>
          </div>

          <div class="group relative">
            <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm bg-white ring-1 ring-gray-100">
              <Preview
                :coordinates="result.coordinates"
                :image="result.image"
                :stencil-component="CircleStencil"
                class="w-full h-full"
              />
            </div>
            <span class="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gray-800 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">64x64</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-center gap-4 py-2">
      <BaseButton
        v-for="action in actions"
        :key="action.name"
        variant="outline"
        @click="action.handler"
        class="w-10 h-10 !p-0 flex items-center justify-center hover:bg-gray-50 hover:text-blue-600 transition-all duration-200"
      >
        <component :is="action.icon" class="h-5 w-5" />
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { Cropper, CircleStencil, Preview } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import 'vue-advanced-cropper/dist/theme.bubble.css';
import BaseButton from './BaseButton.vue';
import { Plus, Minus, RotateCcw, RotateCw } from 'lucide-vue-next';

defineProps<{
  imgSrc: string;
}>();

const { t } = useI18n();
const cropper = ref<InstanceType<typeof Cropper> | null>(null);

const result = reactive({
  coordinates: null,
  image: null
});

const onChange = (data: any) => {
  result.coordinates = data.coordinates;
  result.image = data.image;
};

const zoom = (factor: number) => cropper.value?.zoom(factor);
const rotate = (angle: number) => cropper.value?.rotate(angle);

const actions = computed(() => [
  { name: 'zoom-in', icon: Plus, handler: () => zoom(1.1) },
  { name: 'zoom-out', icon: Minus, handler: () => zoom(0.9) },
  { name: 'rotate-left', icon: RotateCcw, handler: () => rotate(-90) },
  { name: 'rotate-right', icon: RotateCw, handler: () => rotate(90) },
]);

const getCropBlob = async (): Promise<Blob> => {
  if (!cropper.value) throw new Error('Cropper not initialized');

  const { canvas } = cropper.value.getResult();
  if (!canvas) throw new Error('Failed to get crop canvas');

  const targetSize = 512;
  const size = Math.min(canvas.width, canvas.height, targetSize);

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = outputCanvas.height = size;
  
  const ctx = outputCanvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.drawImage(canvas, 0, 0, size, size);

  return new Promise((resolve, reject) => {
    outputCanvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create blob from canvas'));
    }, 'image/png');
  });
};

defineExpose({
  getCropBlob
});
</script>

<style scoped>
:deep(.cropper-background) {
  background-image: conic-gradient(#e5e5e5 0 25%, #fff 0 50%, #e5e5e5 0 75%, #fff 0);
  background-size: 20px 20px;
}
</style>