<template>
  <div class="status-query">
    <div class="row justify-content-center">
      <div class="col-lg-6">
        <div class="card">
          <div class="card-header">
            <h4 class="card-title mb-0">
              <i class="fas fa-search me-2"></i>Check RMA Status
            </h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="queryStatus">
              <div class="mb-3">
                <label for="rma_number" class="form-label">RMA Number</label>
                <input
                  type="text"
                  class="form-control"
                  id="rma_number"
                  v-model="rmaNumber"
                  placeholder="Enter RMA number, e.g.: KN-RMA-20240101-001"
                  required
                  :class="{ 'is-invalid': error }"
                >
                <div class="invalid-feedback">{{ error }}</div>
              </div>
              
              <div class="d-grid">
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fas fa-search me-2"></i>
                  {{ loading ? 'Searching...' : 'Check Status' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- 查詢結果 -->
    <div v-if="rmaData" class="row justify-content-center mt-4">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">RMA Details</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <table class="table table-borderless">
                  <tbody>
                    <tr>
                      <th width="120">RMA Number:</th>
                      <td><strong class="text-primary">{{ rmaData.rma_number }}</strong></td>
                    </tr>
                    <tr>
                      <th>Applicant:</th>
                      <td>{{ rmaData.customer_name }}</td>
                    </tr>
                    <tr>
                      <th>Product Name:</th>
                      <td>{{ rmaData.product_name }}</td>
                    </tr>
                    <tr>
                      <th>Application Date:</th>
                      <td>{{ formatDate(rmaData.created_at) }}</td>
                    </tr>
                    <tr>
                      <th>Last Updated:</th>
                      <td>{{ formatDate(rmaData.updated_at) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="col-md-6">
                <div class="text-center">
                  <h6 class="mb-3">Current Status</h6>
                  <div class="status-badge">
                    <span class="badge badge-status" :class="getStatusClass(rmaData.status)">
                      {{ getStatusText(rmaData.status) }}
                    </span>
                  </div>
                  <div class="mt-3">
                    <div class="progress-container">
                      <div class="progress-step" :class="{ active: getProgressStep(rmaData.status) >= 1 }">
                        <div class="step-number">1</div>
                        <div class="step-label">Submitted</div>
                      </div>
                      <div class="progress-step" :class="{ active: getProgressStep(rmaData.status) >= 2 }">
                        <div class="step-number">2</div>
                        <div class="step-label">Under Review</div>
                      </div>
                      <div class="progress-step" :class="{ active: getProgressStep(rmaData.status) >= 3 }">
                        <div class="step-number">3</div>
                        <div class="step-label">Processing</div>
                      </div>
                      <div class="progress-step" :class="{ active: getProgressStep(rmaData.status) >= 4 }">
                        <div class="step-number">4</div>
                        <div class="step-label">Completed</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Description -->
        <div class="card mt-3">
          <div class="card-body">
            <h6 class="card-title">Status Description</h6>
            <div class="status-description">
              <div v-if="rmaData.status === 'pending'" class="alert alert-warning">
                <i class="fas fa-clock me-2"></i>
                Your RMA request is waiting for review. We will process it as soon as possible.
              </div>
              <div v-else-if="rmaData.status === 'approved'" class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i>
                Your RMA request has been approved and is being arranged for further processing.
              </div>
              <div v-else-if="rmaData.status === 'rejected'" class="alert alert-danger">
                <i class="fas fa-times-circle me-2"></i>
                Sorry, your RMA request was not approved.
              </div>
              <div v-else-if="rmaData.status === 'additional_info_required'" class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                Additional information is required. Please contact customer service.
              </div>
              <div v-else-if="rmaData.status === 'processing'" class="alert alert-info">
                <i class="fas fa-cog me-2"></i>
                Your RMA request is being processed. Please be patient.
              </div>
              <div v-else-if="rmaData.status === 'completed'" class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i>
                Your RMA request has been completed!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import moment from 'moment'

// Define RMA data interface
interface RmaData {
  id: number
  rma_number: string
  customer_name: string
  product_name: string
  status: string
  created_at: string
  updated_at: string
  admin_notes?: string
  priority?: string
}

const store = useStore()
const router = useRouter()
const toast = useToast()

const rmaNumber = ref('')
const rmaData = ref<RmaData | null>(null)
const loading = ref(false)
const error = ref('')

const queryStatus = async () => {
  if (!rmaNumber.value.trim()) {
    error.value = 'Please enter RMA number'
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    const response = await store.dispatch('rma/getRequestStatus', rmaNumber.value)
    rmaData.value = response.data

    // Show success message
    toast.success('RMA status retrieved successfully')
    
  } catch (err: any) {
    error.value = err.message || 'Query failed. Please check if the RMA number is correct'
    rmaData.value = null
  } finally {
    loading.value = false
  }
}

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'pending': 'Pending Review',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'additional_info_required': 'Additional Info Required',
    'processing': 'Processing',
    'completed': 'Completed'
  }
  return statusMap[status] || status
}

const getStatusClass = (status: string) => {
  const classMap: { [key: string]: string } = {
    'pending': 'bg-warning',
    'approved': 'bg-success',
    'rejected': 'bg-danger',
    'additional_info_required': 'bg-info',
    'processing': 'bg-info',
    'completed': 'bg-success'
  }
  return classMap[status] || 'bg-secondary'
}

const getProgressStep = (status: string) => {
  const stepMap: { [key: string]: number } = {
    'pending': 1,
    'approved': 2,
    'rejected': 2,
    'additional_info_required': 2,
    'processing': 3,
    'completed': 4
  }
  return stepMap[status] || 1
}

const formatDate = (dateString: string) => {
  return moment(dateString).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped>
.status-badge {
  margin: 1rem 0;
}

.badge-status {
  font-size: 1rem;
  padding: 0.5rem 1rem;
}

.progress-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  position: relative;
}

.progress-container::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  height: 2px;
  background-color: #e9ecef;
  z-index: 1;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.step-label {
  font-size: 0.8rem;
  color: #6c757d;
  text-align: center;
}

.progress-step.active .step-number {
  background-color: #007bff;
  color: white;
}

.progress-step.active .step-label {
  color: #007bff;
  font-weight: 500;
}

.status-description {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .progress-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .progress-container::before {
    display: none;
  }
  
  .step-number {
    width: 30px;
    height: 30px;
  }
}
</style>