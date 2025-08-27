<template>
  <div class="login">
    <div class="row justify-content-center">
      <div class="col-md-4">
        <div class="card">
          <div class="card-header text-center">
            <h4 class="card-title mb-0">
              <i class="fas fa-user-shield me-2"></i>Administrator Login
            </h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="form.username"
                  required
                  :class="{ 'is-invalid': errors.username }"
                  placeholder="Enter your username"
                >
                <div class="invalid-feedback">{{ errors.username }}</div>
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="form.password"
                  required
                  :class="{ 'is-invalid': errors.password }"
                  placeholder="Enter your password"
                >
                <div class="invalid-feedback">{{ errors.password }}</div>
              </div>
              
              <div v-if="error" class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                {{ error }}
              </div>
              
              <div class="d-grid">
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fas fa-sign-in-alt me-2"></i>
                  {{ loading ? 'Logging in...' : 'Login' }}
                </button>
              </div>
            </form>
          </div>
          <div class="card-footer text-center text-muted">
            <small>Default account: admin / Password: admin123</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const store = useStore()
const router = useRouter()
const toast = useToast()

const form = reactive({
  username: '',
  password: ''
})

const errors = reactive({
  username: '',
  password: ''
})

const loading = computed(() => store.getters.loading)
const error = computed(() => store.getters.error)

const handleLogin = async () => {
  // Reset errors
  errors.username = ''
  errors.password = ''

  // Validate form
  if (!form.username.trim()) {
    errors.username = 'Please enter your username'
    return
  }
  
  if (!form.password.trim()) {
    errors.password = 'Please enter your password'
    return
  }

  try {
    await store.dispatch('login', {
      username: form.username,
      password: form.password
    })
    
    toast.success('Login successful!')
    router.push('/admin')
  } catch (err: any) {
    // Error is handled by store and displayed via computed error
  }
}
</script>

<style scoped>
.login {
  margin-top: 3rem;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

@media (max-width: 768px) {
  .col-md-4 {
    max-width: 90%;
  }
}
</style>