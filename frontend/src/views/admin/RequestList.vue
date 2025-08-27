<template>
  <div class="request-list">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>RMA Applications List</h2>
      <button class="btn btn-outline-primary" @click="refreshRequests">
        <i class="fas fa-sync-alt me-2"></i>Refresh
      </button>
    </div>

    <!-- Filter -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Status</label>
            <select class="form-select" v-model="filters.status" @change="applyFilters">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="additional_info_required">Additional Information Required</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Priority</label>
            <select class="form-select" v-model="filters.priority" @change="applyFilters">
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Search</label>
            <input
              type="text"
              class="form-control"
              v-model="filters.search"
              @input="debounceSearch"
              placeholder="Search RMA Number, Customer Name, or Email"
            >
          </div>
          <div class="col-md-2">
            <label class="form-label">Items per Page</label>
            <select class="form-select" v-model="filters.limit" @change="applyFilters">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Request List -->
    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">
          Request List
          <span class="badge bg-secondary ms-2">{{ pagination.total }} items</span>
        </h5>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="requests.length === 0" class="text-center py-4">
          <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
          <p class="text-muted">No Requests Found</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th width="150">RMA Number</th>
                <th>Applicant</th>
                <th>Product Name</th>
                <th width="100">Status</th>
                <th width="80">Priority</th>
                <th width="120">Application Date</th>
                <th width="120">Updated At</th>
                <th width="100">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in requests" :key="request.id">
                <td>
                  <router-link :to="`/admin/requests/${request.id}`" class="text-decoration-none fw-bold">
                    {{ request.rma_number }}
                  </router-link>
                </td>
                <td>
                  <div>
                    <div>{{ request.customer_name }}</div>
                    <small class="text-muted">{{ request.customer_email }}</small>
                  </div>
                </td>
                <td>{{ request.product_name }}</td>
                <td>
                  <span class="badge" :class="getStatusClass(request.status)">
                    {{ getStatusText(request.status) }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="getPriorityClass(request.priority)">
                    {{ getPriorityText(request.priority) }}
                  </span>
                </td>
                <td>{{ formatDate(request.created_at) }}</td>
                <td>{{ formatDate(request.updated_at) }}</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <router-link :to="`/admin/requests/${request.id}`" class="btn btn-outline-primary">
                      <i class="fas fa-eye"></i>
                    </router-link>
                    <button 
                      class="btn btn-outline-success" 
                      @click="quickApprove(request)"
                      :disabled="request.status !== 'pending'"
                      title="Approve"
                    >
                      <i class="fas fa-check"></i>
                    </button>
                    <button 
                      class="btn btn-outline-danger" 
                      @click="quickReject(request)"
                      :disabled="request.status !== 'pending'"
                      title="Reject"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <nav v-if="pagination.pages > 1" class="mt-4">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: pagination.page <= 1 }">
              <button class="page-link" @click="changePage(pagination.page - 1)">
                <i class="fas fa-chevron-left"></i>
              </button>
            </li>
            
            <li 
              v-for="page in getPageNumbers()" 
              :key="page"
              class="page-item" 
              :class="{ active: page === pagination.page }"
            >
              <button class="page-link" @click="changePage(page)">{{ page }}</button>
            </li>
            
            <li class="page-item" :class="{ disabled: pagination.page >= pagination.pages }">
              <button class="page-link" @click="changePage(pagination.page + 1)">
                <i class="fas fa-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Quick Action Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Action</h5>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to {{ confirmAction === 'approve' ? 'approve' : 'reject' }} the request <strong>{{ selectedRequest?.rma_number }}</strong>?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="cancelConfirm">Cancel</button>
            <button type="button" class="btn" :class="confirmAction === 'approve' ? 'btn-success' : 'btn-danger'" @click="confirmQuickAction">
              Confirm {{ confirmAction === 'approve' ? 'Approval' : 'Rejection' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import moment from 'moment'

const store = useStore()
const toast = useToast()

const filters = reactive({
  status: '',
  priority: '',
  search: '',
  limit: 10,
  page: 1
})

const showConfirmModal = ref(false)
const confirmAction = ref('')

interface RMARequest {
  id: string;
  rma_number: string;
  status: string;
}

const selectedRequest = ref<RMARequest | null>(null)
let searchTimeout: any = null

const requests = computed(() => store.getters['rma/requests'])
const pagination = computed(() => store.getters['rma/pagination'])
const loading = computed(() => store.getters['rma/loading'])

onMounted(() => {
  loadRequests()
})

const loadRequests = async () => {
  try {
    await store.dispatch('rma/fetchRequests', filters)
  } catch (error) {
    toast.error('Failed to load application list')
  }
}

const refreshRequests = () => {
  loadRequests()
}

const applyFilters = () => {
  filters.page = 1
  loadRequests()
}

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

const changePage = (page: number) => {
  if (page >= 1 && page <= pagination.value.pages) {
    filters.page = page
    loadRequests()
  }
}

const getPageNumbers = () => {
  const current = pagination.value.page
  const total = pagination.value.pages
  const delta = 2
  const pages = []
  
  for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
    pages.push(i)
  }
  
  return pages
}

const quickApprove = (request: any) => {
  selectedRequest.value = request
  confirmAction.value = 'approve'
  showConfirmModal.value = true
}

const quickReject = (request: any) => {
  selectedRequest.value = request
  confirmAction.value = 'reject'
  showConfirmModal.value = true
}

const confirmQuickAction = async () => {
  if (!selectedRequest.value) return
  
  try {
    const status = confirmAction.value === 'approve' ? 'approved' : 'rejected'
    const adminNotes = confirmAction.value === 'approve' ? 'Quick Approval' : 'Quick Rejection'

    await store.dispatch('rma/updateRequestStatus', {
      id: selectedRequest.value.id,
      status,
      admin_notes: adminNotes
    })

    toast.success(`Application has been ${confirmAction.value === 'approve' ? 'approved' : 'rejected'}`)
    await loadRequests()
  } catch (error: any) {
    toast.error(error.message || 'Failed to perform action')
  } finally {
    cancelConfirm()
  }
}

const cancelConfirm = () => {
  showConfirmModal.value = false
  confirmAction.value = ''
  selectedRequest.value = null
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

const formatDate = (dateString: string) => {
  return moment(dateString).format('MM-DD HH:mm')
}
</script>

<style scoped>
.request-list {
  padding: 1rem;
}

.table th {
  background-color: #f8f9fa;
  border-top: none;
  font-weight: 600;
  font-size: 0.9rem;
}

.table td {
  vertical-align: middle;
  font-size: 0.9rem;
}

.badge {
  font-size: 0.75em;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.pagination .page-link {
  padding: 0.375rem 0.75rem;
}

.modal.show {
  display: block;
}

@media (max-width: 768px) {
  .request-list {
    padding: 0.5rem;
  }
  
  .table-responsive {
    font-size: 0.8rem;
  }
  
  .btn-group {
    flex-direction: column;
  }
  
  .btn-group .btn {
    margin-bottom: 0.25rem;
  }
}
</style>