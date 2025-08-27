<template>
  <div class="status-detail">
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ error }}
    </div>

    <div v-else-if="rmaData" class="row">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-file-alt me-2"></i>RMA Details
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <h6 class="text-primary">Basic Information</h6>
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
                <h6 class="text-primary">Current Status</h6>
                <div class="status-display">
                  <div class="status-badge mb-3">
                    <span class="badge badge-status" :class="getStatusClass(rmaData.status)">
                      {{ getStatusText(rmaData.status) }}
                    </span>
                  </div>
                  
                  <div class="progress-timeline">
                    <div class="timeline-item" :class="{ active: getProgressStep(rmaData.status) >= 1 }">
                      <div class="timeline-marker"></div>
                      <div class="timeline-content">
                        <div class="timeline-title">Application Submitted</div>
                        <div class="timeline-time">{{ formatDate(rmaData.created_at) }}</div>
                      </div>
                    </div>
                    
                    <div class="timeline-item" :class="{ active: getProgressStep(rmaData.status) >= 2 }">
                      <div class="timeline-marker"></div>
                      <div class="timeline-content">
                        <div class="timeline-title">Under Review</div>
                        <div class="timeline-time" v-if="rmaData.processed_at">{{ formatDate(rmaData.processed_at) }}</div>
                      </div>
                    </div>
                    
                    <div class="timeline-item" :class="{ active: getProgressStep(rmaData.status) >= 3 }">
                      <div class="timeline-marker"></div>
                      <div class="timeline-content">
                        <div class="timeline-title">Processing</div>
                        <div class="timeline-time" v-if="rmaData.status === 'processing'">In Progress</div>
                      </div>
                    </div>
                    
                    <div class="timeline-item" :class="{ active: getProgressStep(rmaData.status) >= 4 }">
                      <div class="timeline-marker"></div>
                      <div class="timeline-content">
                        <div class="timeline-title">Processing Complete</div>
                        <div class="timeline-time" v-if="rmaData.status === 'completed'">Completed</div>
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
                Your RMA application is pending review, and we will process it as soon as possible. The review usually takes 1-2 business days.
              </div>
              <div v-else-if="rmaData.status === 'approved'" class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i>
                Your RMA application has been approved and is being processed. We will handle it as soon as possible.
              </div>
              <div v-else-if="rmaData.status === 'rejected'" class="alert alert-danger">
                <i class="fas fa-times-circle me-2"></i>
                Sorry, your RMA application has been rejected. If you have any questions, please contact customer service.
              </div>
              <div v-else-if="rmaData.status === 'additional_info_required'" class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                Additional information is required. Please contact customer support or check the administrator’s notes below.
              </div>
              <div v-else-if="rmaData.status === 'processing'" class="alert alert-info">
                <i class="fas fa-cog me-2"></i>
                Your RMA application is being processed. Please be patient, and we will update you on the progress.
              </div>
              <div v-else-if="rmaData.status === 'completed'" class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i>
                Your RMA application has been completed! If you have any questions, please contact customer service.
              </div>
            </div>
            
            <div v-if="rmaData.admin_notes" class="mt-3">
              <h6 class="text-primary">Administrator Notes</h6>
              <div class="alert alert-light">
                <i class="fas fa-sticky-note me-2"></i>
                {{ rmaData.admin_notes }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card">
          <div class="card-header">
            <h6 class="card-title mb-0">Contact Information</h6>
          </div>
          <div class="card-body">
            <div class="contact-info">
              <div class="contact-item">
                <i class="fas fa-envelope text-primary me-2"></i>
                <div>
                  <strong>Customer Support Email</strong>
                  <div class="text-muted">support@knelectronics.com</div>
                </div>
              </div>
              <div class="contact-item">
                <i class="fas fa-phone text-primary me-2"></i>
                <div>
                  <strong>Customer Support Phone</strong>
                  <div class="text-muted">+886-2-1234-5678</div>
                </div>
              </div>
              <div class="contact-item">
                <i class="fas fa-clock text-primary me-2"></i>
                <div>
                  <strong>Service Hours</strong>
                  <div class="text-muted">Monday to Friday 09:00-18:00</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card mt-3">
          <div class="card-header">
            <h6 class="card-title mb-0">Frequently Asked Questions</h6>
          </div>
          <div class="card-body">
            <div class="faq-list">
              <div class="faq-item">
                <strong>Q: How long does the review take?</strong>
                <div class="text-muted">A: The review usually takes 1-2 business days.</div>
              </div>
              <div class="faq-item">
                <strong>Q: How to provide additional information?</strong>
                <div class="text-muted">A: Please contact customer support to provide the required information.</div>
              </div>
              <div class="faq-item">
                <strong>Q: What happens after the processing is complete?</strong>
                <div class="text-muted">A: We will notify you of the next steps via email.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
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
  processed_at?: string
  admin_notes?: string
  priority?: string
}

const store = useStore()
const route = useRoute()

const rmaData = ref<RmaData | null>(null)
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  const rmaNumber = route.params.rmaNumber as string
  if (rmaNumber) {
    await loadRmaData(rmaNumber)
  }
})

const loadRmaData = async (rmaNumber: string) => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await store.dispatch('rma/getRequestStatus', rmaNumber)
    rmaData.value = response.data
  } catch (err: any) {
    error.value = err.message || 'Query failed. Please check if the RMA number is correct.'
  } finally {
    loading.value = false
  }
}

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'additional_info_required': 'Additional Information Required',
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
  text-align: center;
  margin-bottom: 1rem;
}

.badge-status {
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
}

.progress-timeline {
  position: relative;
  margin-top: 1rem;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  position: relative;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 20px;
  bottom: -20px;
  width: 2px;
  background-color: #e9ecef;
}

.timeline-item.active:not(:last-child)::before {
  background-color: #007bff;
}

.timeline-marker {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #e9ecef;
  margin-right: 1rem;
  margin-top: 2px;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.timeline-item.active .timeline-marker {
  background-color: #007bff;
}

.timeline-content {
  flex: 1;
}

.timeline-title {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.2rem;
}

.timeline-item.active .timeline-title {
  color: #007bff;
}

.timeline-time {
  font-size: 0.8rem;
  color: #6c757d;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.contact-item i {
  margin-top: 0.2rem;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.faq-item:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .timeline-item {
    flex-direction: column;
    text-align: center;
  }
  
  .timeline-marker {
    margin: 0 auto 0.5rem;
  }
  
  .timeline-item:not(:last-child)::before {
    display: none;
  }
}
</style>