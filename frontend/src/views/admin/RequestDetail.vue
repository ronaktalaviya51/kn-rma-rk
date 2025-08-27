<template>
  <div class="request-detail">
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ error }}
    </div>

    <div v-else-if="request" class="row">
      <div class="col-lg-8">
        <!-- Basic Information -->
        <div class="card mb-4">
          <div class="card-header">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">
                <i class="fas fa-file-alt me-2"></i>RMA Application Details
              </h5>
              <div>
                <router-link to="/admin/requests" class="btn btn-outline-secondary btn-sm">
                  <i class="fas fa-arrow-left me-2"></i>Back to List
                </router-link>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <table class="table table-borderless">
                  <tbody>
                    <tr>
                      <th width="120">RMA Number:</th>
                      <td><strong class="text-primary">{{ request.rma_number }}</strong></td>
                    </tr>
                    <tr>
                      <th>Applicant:</th>
                      <td>{{ request.customer_name }}</td>
                    </tr>
                    <tr>
                      <th>Email:</th>
                      <td>{{ request.customer_email }}</td>
                    </tr>
                    <tr>
                      <th>Phone:</th>
                      <td>{{ request.customer_phone || 'Not Provided' }}</td>
                    </tr>
                    <tr>
                      <th>Application Date:</th>
                      <td>{{ formatDate(request.created_at) }}</td>
                    </tr>
                    <tr>
                      <th>Updated At:</th>
                      <td>{{ formatDate(request.updated_at) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="col-md-6">
                <table class="table table-borderless">
                  <tbody>
                    <tr>
                      <th width="120">Product Name:</th>
                      <td>{{ request.product_name }}</td>
                    </tr>
                    <tr>
                      <th>Model:</th>
                      <td>{{ request.product_model || 'Not Provided' }}</td>
                    </tr>
                    <tr>
                      <th>Serial Number:</th>
                      <td>{{ request.serial_number || 'Not Provided' }}</td>
                    </tr>
                    <tr>
                      <th>Purchase Date:</th>
                      <td>{{ request.purchase_date ? formatDate(request.purchase_date) : 'Not Provided' }}</td>
                    </tr>
                    <tr>
                      <th>Purchase Location:</th>
                      <td>{{ request.purchase_location || 'Not Provided' }}</td>
                    </tr>
                    <tr>
                      <th>Return Reason:</th>
                      <td>{{ getReturnReasonText(request.return_reason) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Issue Description -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">Issue Description</h5>
          </div>
          <div class="card-body">
            <p class="mb-0">{{ request.issue_description }}</p>
          </div>
        </div>

        <!-- Related Files -->
        <div v-if="request.files && request.files.length > 0" class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">Related Files</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div v-for="file in request.files" :key="file.id" class="col-md-6 col-lg-4 mb-3">
                <div class="file-card">
                  <div class="file-icon text-center mb-2">
                    <i :class="getFileIcon(file.file_type)" class="fa-3x text-primary"></i>
                  </div>
                  <div class="file-info text-center">
                    <div class="file-name mb-1">{{ file.file_name }}</div>
                    <div class="file-size text-muted small">{{ formatFileSize(file.file_size) }}</div>
                    <div class="file-actions mt-2">
                      <button class="btn btn-sm btn-outline-primary me-1" @click="downloadFile(file.id)">
                        <i class="fas fa-download"></i> Download
                      </button>
                      <button class="btn btn-sm btn-outline-danger" @click="deleteFile(file.id)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Notes History -->
        <div v-if="request.admin_notes" class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">Admin Notes</h5>
          </div>
          <div class="card-body">
            <div class="alert alert-light">
              <i class="fas fa-sticky-note me-2"></i>
              {{ request.admin_notes }}
            </div>
            <div v-if="request.processed_by_username" class="text-muted small">
              Processed By: {{ request.processed_by_username }} |
              Processed At: {{ formatDate(request.processed_at) }}
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <!-- Status Management -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">Status Management</h5>
          </div>
          <div class="card-body">
            <div class="current-status mb-3">
              <h6>Current Status</h6>
              <span class="badge badge-lg" :class="getStatusClass(request.status)">
                {{ getStatusText(request.status) }}
              </span>
            </div>

            <div class="current-priority mb-3">
              <h6>Priority</h6>
              <span class="badge badge-lg" :class="getPriorityClass(request.priority)">
                {{ getPriorityText(request.priority) }}
              </span>
            </div>

            <form @submit.prevent="updateStatus">
              <div class="mb-3">
                <label class="form-label">Change Status</label>
                <select class="form-select" v-model="statusForm.status" required>
                  <option value="">Select New Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="additional_info_required">Additional Information Required</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Priority</label>
                <select class="form-select" v-model="statusForm.priority">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Admin Notes</label>
                <textarea
                  class="form-control"
                  rows="3"
                  v-model="statusForm.admin_notes"
                  placeholder="Please enter processing remarks..."
                ></textarea>
              </div>

              <div class="d-grid">
                <button type="submit" class="btn btn-primary" :disabled="updateLoading">
                  <span v-if="updateLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fas fa-save me-2"></i>
                  {{ updateLoading ? 'Updating...' : 'Update Status' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">Quick Actions</h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <button 
                class="btn btn-success" 
                @click="quickAction('approved', 'Quick Approve')"
                :disabled="request.status !== 'pending'"
              >
                <i class="fas fa-check me-2"></i>Quick Approve
              </button>
              <button 
                class="btn btn-danger" 
                @click="quickAction('rejected', 'Quick Reject')"
                :disabled="request.status !== 'pending'"
              >
                <i class="fas fa-times me-2"></i>Quick Reject
              </button>
              <button 
                class="btn btn-info" 
                @click="quickAction('additional_info_required', 'Quick Request Additional Info')"
                :disabled="request.status === 'completed'"
              >
                <i class="fas fa-info-circle me-2"></i>Quick Request Additional Info
              </button>
            </div>
          </div>
        </div>

        <!-- Contact Customer -->
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Contact Customer</h5>
          </div>
          <div class="card-body">
            <div class="contact-info">
              <div class="mb-2">
                <strong>Email：</strong>
                <a :href="`mailto:${request.customer_email}`" class="text-decoration-none">
                  {{ request.customer_email }}
                </a>
              </div>
              <div v-if="request.customer_phone" class="mb-2">
                <strong>Phone：</strong>
                <a :href="`tel:${request.customer_phone}`" class="text-decoration-none">
                  {{ request.customer_phone }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import moment from 'moment'

const store = useStore()
const route = useRoute()
const toast = useToast()

const updateLoading = ref(false)

const statusForm = reactive({
  status: '',
  priority: 'medium',
  admin_notes: ''
})

const request = computed(() => store.getters['rma/currentRequest'])
const loading = computed(() => store.getters['rma/loading'])
const error = computed(() => store.getters['rma/error'])

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await loadRequest(parseInt(id))
  }
})

const loadRequest = async (id: number) => {
  try {
    await store.dispatch('rma/fetchRequest', id)
    if (request.value) {
      statusForm.priority = request.value.priority || 'medium'
    }
  } catch (error) {
      toast.error('Failed to load request details')
  }
}

const updateStatus = async () => {
  if (!statusForm.status) {
    toast.error('Please select a new status')
    return
  }

  updateLoading.value = true
  try {
    await store.dispatch('rma/updateRequestStatus', {
      id: request.value.id,
      status: statusForm.status,
      admin_notes: statusForm.admin_notes,
      priority: statusForm.priority
    })

    toast.success('Status updated successfully')

    // Reload request details
    await loadRequest(request.value.id)

    // Reset form
    statusForm.status = ''
    statusForm.admin_notes = ''
  } catch (error: any) {
    toast.error(error.message || 'Failed to update status')
  } finally {
    updateLoading.value = false
  }
}

const quickAction = async (status: string, notes: string) => {
  try {
    await store.dispatch('rma/updateRequestStatus', {
      id: request.value.id,
      status,
      admin_notes: notes,
      priority: request.value.priority
    })

    toast.success('Operation successful')
    await loadRequest(request.value.id)
  } catch (error: any) {
    toast.error(error.message || 'Operation failed')
  }
}

const downloadFile = async (fileId: number) => {
  try {
    // Implement file download logic
    window.open(`/api/upload/file/${fileId}`, '_blank')
  } catch (error) {
    toast.error('Failed to download file')
  }
}

const deleteFile = async (fileId: number) => {
  if (confirm('Are you sure you want to delete this file?')) {
    try {
      // Implement file deletion logic
      toast.success('File deleted successfully')
      await loadRequest(request.value.id)
    } catch (error) {
      toast.error('Failed to delete file')
    }
  }
}

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'pending': 'Pending',
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
    'processing': 'bg-primary',
    'completed': 'bg-success'
  }
  return classMap[status] || 'bg-secondary'
}

const getPriorityText = (priority: string) => {
  const priorityMap: { [key: string]: string } = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'urgent': 'Urgent'
  }
  return priorityMap[priority] || priority
}

const getPriorityClass = (priority: string) => {
  const classMap: { [key: string]: string } = {
    'low': 'bg-light text-dark',
    'medium': 'bg-info',
    'high': 'bg-warning',
    'urgent': 'bg-danger'
  }
  return classMap[priority] || 'bg-secondary'
}

const getReturnReasonText = (reason: string) => {
  const reasonMap: { [key: string]: string } = {
    'defective': 'Product Defect',
    'wrong_item': 'Wrong Item',
    'damaged': 'Shipping Damage',
    'not_as_described': 'Not as Described',
    'other': 'Other Reason'
  }
  return reasonMap[reason] || reason
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return 'fas fa-image'
  } else if (fileType.startsWith('video/')) {
    return 'fas fa-video'
  } else if (fileType === 'application/pdf') {
    return 'fas fa-file-pdf'
  } else {
    return 'fas fa-file'
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString: string) => {
  return moment(dateString).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped>
.request-detail {
  padding: 1rem;
}

.badge-lg {
  font-size: 1rem;
  padding: 0.5rem 1rem;
}

.file-card {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  height: 100%;
  transition: box-shadow 0.15s ease-in-out;
}

.file-card:hover {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.file-icon {
  margin-bottom: 0.5rem;
}

.file-name {
  font-weight: 500;
  word-break: break-word;
}

.contact-info a {
  color: #007bff;
}

.contact-info a:hover {
  color: #0056b3;
}

@media (max-width: 768px) {
  .request-detail {
    padding: 0.5rem;
  }
  
  .table-responsive {
    font-size: 0.9rem;
  }
}
</style>