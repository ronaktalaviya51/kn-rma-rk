<template>
  <div class="domain-manager">
    <h3>Domain Management</h3>

    <!-- Currently allowed origins Domains -->
    <div class="card mb-3">
      <div class="card-header">
        <h5>Allowed Domains</h5>
        <button class="btn btn-primary btn-sm" @click="loadAllowedDomains">
          <i class="fas fa-refresh"></i> Reload
        </button>
      </div>
      <div class="card-body">
        <div v-if="allowedDomains.length === 0" class="text-muted">
          No allowed domains
        </div>
        <div v-else>
          <div class="domain-list">
            <div 
              v-for="domain in allowedDomains" 
              :key="domain"
              class="domain-item"
            >
              <span class="domain-url">{{ domain }}</span>
              <span class="domain-badge badge bg-success">Allowed</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Domain -->
    <div class="card mb-3">
      <div class="card-header">
        <h5>Add Domain</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="addDomain">
          <div class="input-group">
            <input
              v-model="newDomain"
              type="url"
              class="form-control"
              placeholder="https://example.com"
              required
            >
            <button class="btn btn-success" type="submit">
              <i class="fas fa-plus"></i> Add
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Test Domain -->
    <div class="card mb-3">
      <div class="card-header">
        <h5>Test Domain</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="testDomain">
          <div class="input-group">
            <input
              v-model="testDomainUrl"
              type="url"
              class="form-control"
              placeholder="https://test.com"
              required
            >
            <button class="btn btn-info" type="submit">
              <i class="fas fa-check"></i> Test
            </button>
          </div>
        </form>
        
        <div v-if="testResult" class="mt-3">
          <div :class="['alert', testResult.allowed ? 'alert-success' : 'alert-danger']">
            Domain {{ testResult.domain }} 
            {{ testResult.allowed ? '✅ Allowed' : '❌ Denied' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Currently allowed origins Domains -->
    <div class="card">
      <div class="card-header">
        <h5>Currently Allowed Origins</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <strong>Current Origin:</strong>
            <div class="text-muted">{{ currentOrigin }}</div>
          </div>
          <div class="col-md-6">
            <strong>Current Host:</strong>
            <div class="text-muted">{{ currentHost }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../services/api'

const allowedDomains = ref<string[]>([])
const newDomain = ref('')
const testDomainUrl = ref('')
const testResult = ref<{domain: string, allowed: boolean} | null>(null)

const currentOrigin = ref(window.location.origin)
const currentHost = ref(window.location.host)

onMounted(() => {
  loadAllowedDomains()
})

const loadAllowedDomains = async () => {
  try {
    const response = await api.get('/api/cors/allowed-domains')
    allowedDomains.value = response.data.domains
  } catch (error) {
    console.error("Failed to load allowed domains");
  }
}

const addDomain = async () => {
  try {
    await api.post('/api/cors/allowed-domains', {
      domain: newDomain.value
    })
    
    newDomain.value = ''
    await loadAllowedDomains()

    // Show success message
    alert('Domain added successfully!');
  } catch (error) {
    console.error('Failed to add domain:', error)
    alert('Failed to add domain')
  }
}

const testDomain = async () => {
  try {
    const response = await api.post('/api/cors/test-domain', {
      domain: testDomainUrl.value
    })
    
    testResult.value = response.data
  } catch (error) {
    console.error('Failed to test domain:', error)
    testResult.value = {
      domain: testDomainUrl.value,
      allowed: false
    }
  }
}
</script>

<style scoped>
.domain-manager {
  max-width: 800px;
  margin: 0 auto;
}

.domain-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.domain-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background-color: #f8f9fa;
}

.domain-url {
  font-family: monospace;
  font-size: 0.9rem;
}

.domain-badge {
  font-size: 0.8rem;
}
</style>
