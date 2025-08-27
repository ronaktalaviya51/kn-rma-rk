<template>
  <div class="admin-dashboard">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Admin Dashboard</h2>
      <div class="user-info">
        <span class="text-muted">Welcome, {{ user.username }}</span>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="card-title">{{ stats?.total_requests || 0 }}</h4>
                <p class="card-text">Total Requests</p>
              </div>
              <div class="align-self-center">
                <i class="fas fa-file-alt fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card bg-warning text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="card-title">{{ stats?.pending_requests || 0 }}</h4>
                <p class="card-text">Pending Review</p>
              </div>
              <div class="align-self-center">
                <i class="fas fa-clock fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="card-title">{{ stats?.approved_requests || 0 }}</h4>
                <p class="card-text">Approved</p>
              </div>
              <div class="align-self-center">
                <i class="fas fa-check-circle fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card bg-info text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="card-title">{{ stats?.requests_this_week || 0 }}</h4>
                <p class="card-text">This Week</p>
              </div>
              <div class="align-self-center">
                <i class="fas fa-calendar-week fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row mb-4">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Recent RMA Requests</h5>
          </div>
          <div class="card-body">
            <div v-if="recentRequests.length === 0" class="text-center text-muted py-4">
              <i class="fas fa-inbox fa-3x mb-3"></i>
              <p>No recent requests</p>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>RMA Number</th>
                    <th>Applicant</th>
                    <th>Product</th>
                    <th>Status</th>
                    <th>Application Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="request in recentRequests" :key="request.id">
                    <td>
                      <router-link :to="`/admin/requests/${request.id}`" class="text-decoration-none">
                        {{ request.rma_number }}
                      </router-link>
                    </td>
                    <td>{{ request.customer_name }}</td>
                    <td>{{ request.product_name }}</td>
                    <td>
                      <span class="badge" :class="getStatusClass(request.status)">
                        {{ getStatusText(request.status) }}
                      </span>
                    </td>
                    <td>{{ formatDate(request.created_at) }}</td>
                    <td>
                      <router-link :to="`/admin/requests/${request.id}`" class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-eye"></i>
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="text-center mt-3">
              <router-link to="/admin/requests" class="btn btn-primary">
                View All Requests
              </router-link>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="card mb-3">
          <div class="card-header">
            <h5 class="card-title mb-0">Quick Actions</h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <router-link to="/admin/requests" class="btn btn-primary">
                <i class="fas fa-list me-2"></i>Manage RMA Requests
              </router-link>
              <button class="btn btn-outline-primary" @click="refreshStats">
                <i class="fas fa-sync-alt me-2"></i>Refresh Statistics
              </button>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Status Distribution</h5>
          </div>
          <div class="card-body">
            <div class="status-distribution">
              <div class="status-item">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span>Pending</span>
                  <span class="badge bg-warning">{{ stats?.pending_requests || 0 }}</span>
                </div>
                <div class="progress mb-3" style="height: 6px;">
                  <div 
                    class="progress-bar bg-warning" 
                    :style="{ width: getPercentage(stats?.pending_requests, stats?.total_requests) + '%' }"
                  ></div>
                </div>
              </div>
              
              <div class="status-item">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span>Approved</span>
                  <span class="badge bg-success">{{ stats?.approved_requests || 0 }}</span>
                </div>
                <div class="progress mb-3" style="height: 6px;">
                  <div 
                    class="progress-bar bg-success" 
                    :style="{ width: getPercentage(stats?.approved_requests, stats?.total_requests) + '%' }"
                  ></div>
                </div>
              </div>
              
              <div class="status-item">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span>Completed</span>
                  <span class="badge bg-info">{{ stats?.completed_requests || 0 }}</span>
                </div>
                <div class="progress mb-3" style="height: 6px;">
                  <div 
                    class="progress-bar bg-info" 
                    :style="{ width: getPercentage(stats?.completed_requests, stats?.total_requests) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import moment from 'moment'

const store = useStore()

const stats = computed(() => store.getters['rma/stats'])
const recentRequests = computed(() => store.getters['rma/requests'].slice(0, 5))
const user = computed(() => store.getters.user)

onMounted(async () => {
  await loadDashboardData()
})

const loadDashboardData = async () => {
  try {
    await Promise.all([
      store.dispatch('rma/fetchStats'),
      store.dispatch('rma/fetchRequests', { limit: 5, page: 1 })
    ])
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
}

const refreshStats = async () => {
  await loadDashboardData()
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

const formatDate = (dateString: string) => {
  return moment(dateString).format('MM-DD HH:mm')
}

const getPercentage = (value: number, total: number) => {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}
</script>

<style scoped>
.admin-dashboard {
  padding: 1rem;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.card-body {
  padding: 1.5rem;
}

.status-distribution {
  font-size: 0.9rem;
}

.progress {
  height: 6px;
  background-color: #e9ecef;
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

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 0.5rem;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .table-responsive {
    font-size: 0.8rem;
  }
}
</style>