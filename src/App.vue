<script setup lang="ts">
import { RouterView } from 'vue-router'
import { BaseToast } from '@/shared/widgets'
</script>

<template>
  <RouterView />
  <!-- Toasts do sistema (Design System §8.8): canto superior direito. -->
  <BaseToast />
</template>
