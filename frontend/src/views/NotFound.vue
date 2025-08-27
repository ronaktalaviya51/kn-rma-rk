<template>
  <div class="not-found text-center">
    <div class="error-content">
      <div class="error-icon mb-4">
        <i class="fas fa-exclamation-triangle text-warning" style="font-size: 5rem;"></i>
      </div>
      <h1 class="display-1 fw-bold text-muted">404</h1>
      <h2 class="mb-3">Page Not Found</h2>
      <p class="lead text-muted mb-4">Sorry, the page you are looking for does not exist or has been removed.</p>
      
      <div class="d-flex justify-content-center gap-3">
        <router-link to="/" class="btn btn-primary">
          <i class="fas fa-home me-2"></i>Back to Home
        </router-link>
        <button @click="goBack" class="btn btn-outline-secondary">
          <i class="fas fa-arrow-left me-2"></i>Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.not-found {
  margin-top: 3rem;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-content {
  max-width: 600px;
}

.display-1 {
  font-size: 6rem;
  line-height: 1;
}

@media (max-width: 768px) {
  .display-1 {
    font-size: 4rem;
  }
  
  .error-icon i {
    font-size: 3rem !important;
  }
}
</style>