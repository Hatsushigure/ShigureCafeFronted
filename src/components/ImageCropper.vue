<template>
  <div class="flex flex-col gap-4">
    <div class="h-96 w-full bg-gray-900 rounded-lg overflow-hidden">
      <VueCropper
        ref="cropper"
        :img="imgSrc"
        :outputSize="option.size"
        :outputType="option.outputType"
        :info="true"
        :full="option.full"
        :canMove="option.canMove"
        :canMoveBox="option.canMoveBox"
        :fixed="option.fixed"
        :fixedNumber="option.fixedNumber"
        :original="option.original"
        :autoCrop="option.autoCrop"
        :autoCropWidth="option.autoCropWidth"
        :autoCropHeight="option.autoCropHeight"
        :centerBox="option.centerBox"
        :high="option.high"
        :maxImgSize="option.maxImgSize"
      />
    </div>
    
    <div class="flex justify-center gap-4">
      <BaseButton 
        variant="outline" 
        @click="changeScale(1)" 
        class="w-10 h-10 !p-0 flex items-center justify-center"
      >
        <Plus class="h-6 w-6" />
      </BaseButton>
      <BaseButton 
        variant="outline" 
        @click="changeScale(-1)" 
        class="w-10 h-10 !p-0 flex items-center justify-center"
      >
        <Minus class="h-6 w-6" />
      </BaseButton>
      <BaseButton 
        variant="outline" 
        @click="rotateLeft" 
        class="w-10 h-10 !p-0 flex items-center justify-center"
      >
        <RotateCcw class="h-6 w-6" />
      </BaseButton>
      <BaseButton 
        variant="outline" 
        @click="rotateRight" 
        class="w-10 h-10 !p-0 flex items-center justify-center"
      >
        <RotateCw class="h-6 w-6" />
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import 'vue-cropper/dist/index.css';
import { VueCropper } from 'vue-cropper';
import BaseButton from './BaseButton.vue';
import { Plus, Minus, RotateCcw, RotateCw } from 'lucide-vue-next';

const props = defineProps<{
  imgSrc: string;
}>();

const cropper = ref();

const option = reactive({
  size: 1,
  full: false,
  outputType: 'png',
  canMove: true,
  fixedBox: false,
  original: false,
  canMoveBox: true,
  autoCrop: true,
  // Square crop for avatar
  autoCropWidth: 300,
  autoCropHeight: 300,
  centerBox: true,
  high: true,
  maxImgSize: 2000,
  fixed: true,
  fixedNumber: [1, 1]
});

const changeScale = (num: number) => {
  cropper.value?.changeScale(num);
};

const rotateLeft = () => {
  cropper.value?.rotateLeft();
};

const rotateRight = () => {
  cropper.value?.rotateRight();
};

const getCropBlob = (): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    cropper.value?.getCropBlob(async (data: Blob) => {
      if (!data) {
        reject(new Error('Failed to get crop blob'));
        return;
      }

      try {
        // Resize to max 512x512 and convert to PNG
        const image = new Image();
        const url = URL.createObjectURL(data);
        
        image.onload = () => {
          URL.revokeObjectURL(url);
          const canvas = document.createElement('canvas');
          let width = image.width;
          let height = image.height;

          // Calculate dimensions to fit 512x512 while maintaining aspect ratio
          // Since it's a square crop, it should already be 1:1
          if (width > 512 || height > 512) {
            if (width > height) {
              height = Math.round((height * 512) / width);
              width = 512;
            } else {
              width = Math.round((width * 512) / height);
              height = 512;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(image, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          }, 'image/png');
        };

        image.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load image for resizing'));
        };

        image.src = url;
      } catch (e) {
        reject(e);
      }
    });
  });
};

defineExpose({
  getCropBlob
});
</script>
