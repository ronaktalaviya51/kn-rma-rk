<template>
  <div class="request-rma">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header">
            <h4 class="card-title mb-0">
              <i class="fas fa-file-alt me-2"></i>RMA Application Form
            </h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="submitRequest">
              <!-- Customer Information -->
              <div class="mb-4">
                <h5 class="text-primary">Customer Information</h5>
                <hr>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="customer_name" class="form-label">Name *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="customer_name"
                      v-model="form.customer_name"
                      required
                      :class="{ 'is-invalid': errors.customer_name }"
                    >
                    <div class="invalid-feedback">{{ errors.customer_name }}</div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="customer_email" class="form-label">Email *</label>
                    <input
                      type="email"
                      class="form-control"
                      id="customer_email"
                      v-model="form.customer_email"
                      required
                      :class="{ 'is-invalid': errors.customer_email }"
                    >
                    <div class="invalid-feedback">{{ errors.customer_email }}</div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="customer_phone" class="form-label">Phone</label>
                    <input
                      type="tel"
                      class="form-control"
                      id="customer_phone"
                      v-model="form.customer_phone"
                      :class="{ 'is-invalid': errors.customer_phone }"
                    >
                    <div class="invalid-feedback">{{ errors.customer_phone }}</div>
                  </div>
                </div>
              </div>

              <!-- Order Information -->
              <div class="mb-4">
                <h5 class="text-primary">Order Information</h5>
                <hr>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="order_number" class="form-label">Order Number</label>
                    <input
                      type="text"
                      class="form-control"
                      id="order_number"
                      v-model="form.order_number"
                      placeholder="Enter order number"
                    >
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="po_number" class="form-label">PO Number</label>
                    <input
                      type="text"
                      class="form-control"
                      id="po_number"
                      v-model="form.po_number"
                      placeholder="Enter PO number"
                    >
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="tracking_number" class="form-label">Tracking Number</label>
                    <input
                      type="text"
                      class="form-control"
                      id="tracking_number"
                      v-model="form.tracking_number"
                      placeholder="Enter tracking number"
                    >
                  </div>
                </div>
              </div>

              <!-- Product Information -->
              <div class="mb-4">
                <h5 class="text-primary">Product Information</h5>
                <hr>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="product_name" class="form-label">Product Name *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="product_name"
                      v-model="form.product_name"
                      required
                      :class="{ 'is-invalid': errors.product_name }"
                    >
                    <div class="invalid-feedback">{{ errors.product_name }}</div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="product_model" class="form-label">Model</label>
                    <input
                      type="text"
                      class="form-control"
                      id="product_model"
                      v-model="form.product_model"
                    >
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="serial_number" class="form-label">Serial Number</label>
                    <input
                      type="text"
                      class="form-control"
                      id="serial_number"
                      v-model="form.serial_number"
                    >
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="quantity" class="form-label">Quantity *</label>
                    <input
                      type="number"
                      class="form-control"
                      id="quantity"
                      v-model="form.quantity"
                      min="1"
                      required
                      :class="{ 'is-invalid': errors.quantity }"
                    >
                    <div class="invalid-feedback">{{ errors.quantity }}</div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="purchase_date" class="form-label">Purchase Date</label>
                    <input
                      type="date"
                      class="form-control"
                      id="purchase_date"
                      v-model="form.purchase_date"
                    >
                  </div>
                </div>
                <div class="mb-3">
                  <label for="purchase_location" class="form-label">Purchase Location</label>
                  <input
                    type="text"
                    class="form-control"
                    id="purchase_location"
                    v-model="form.purchase_location"
                  >
                </div>
              </div>

              <!-- Problem Description -->
              <div class="mb-4">
                <h5 class="text-primary">Problem Description</h5>
                <hr>
                <div class="mb-3">
                  <label for="return_reason" class="form-label">Return Reason *</label>
                  <select
                    class="form-select"
                    id="return_reason"
                    v-model="form.return_reason"
                    required
                    :class="{ 'is-invalid': errors.return_reason }"
                  >
                    <option value="">Select return reason</option>
                    <option value="defective">Product Defect</option>
                    <option value="wrong_item">Wrong Item</option>
                    <option value="damaged">Shipping Damage</option>
                    <option value="not_as_described">Not as Described</option>
                    <option value="other">Other Reason</option>
                  </select>
                  <div class="invalid-feedback">{{ errors.return_reason }}</div>
                </div>
                <div class="mb-3">
                  <label for="issue_description" class="form-label">Detailed Problem Description *</label>
                  <textarea
                    class="form-control"
                    id="issue_description"
                    rows="4"
                    v-model="form.issue_description"
                    required
                    :class="{ 'is-invalid': errors.issue_description }"
                    placeholder="Please describe the problem in detail..."
                  ></textarea>
                  <div class="invalid-feedback">{{ errors.issue_description }}</div>
                </div>
              </div>

              <!-- File Upload -->
              <div class="mb-4">
                <h5 class="text-primary">Related Documents</h5>
                <hr>
                <div class="mb-3">
                  <label class="form-label">Upload Related Images or Videos</label>
                  <div class="file-upload-area" @drop="handleDrop" @dragover="handleDragOver" @dragleave="handleDragLeave">
                    <i class="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
                    <p class="text-muted mb-3">Drag files here or click to upload</p>
                    <input
                      type="file"
                      class="form-control d-none"
                      id="file_upload"
                      ref="fileInput"
                      @change="handleFileSelect"
                      multiple
                      accept="image/*,video/*,.pdf"
                    >
                    <button type="button" class="btn btn-outline-primary" @click="fileInput?.click()">
                      Select Files
                    </button>
                  </div>
                  <div class="text-muted small mt-2">
                    Supported formats: JPG, PNG, GIF, PDF, MP4, AVI, MOV (max 10MB per file, max 5 files)
                  </div>
                </div>
                
                <!-- File List -->
                <div v-if="selectedFiles.length > 0" class="file-list">
                  <h6>Selected Files:</h6>
                  <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
                    <i class="fas fa-file-alt text-primary me-2"></i>
                    <div class="file-info">
                      <div class="file-name">{{ file.name }}</div>
                      <div class="file-size">{{ formatFileSize(file.size) }}</div>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-danger" @click="removeFile(index)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary btn-lg" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fas fa-paper-plane me-2"></i>
                  {{ loading ? 'Submitting...' : 'Submit Application' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Application Successful</h5>
          </div>
          <div class="modal-body">
            <div class="text-center">
              <i class="fas fa-check-circle text-success fa-3x mb-3"></i>
              <h4>RMA application submitted successfully!</h4>
              <p class="mb-3">Your RMA number is: <strong class="text-primary">{{ rmaNumber }}</strong></p>
              <p class="text-muted">We have sent a confirmation email to your inbox. Please save this RMA number for future reference.</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="goToStatus">Check Status</button>
            <button type="button" class="btn btn-secondary" @click="resetForm">Submit Another</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const store = useStore()
const router = useRouter()
const toast = useToast()

const loading = ref(false)
const successMessage = ref(false)
const rmaNumber = ref('')
const selectedFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

const form = reactive<{
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_number: string;
  po_number: string;
  tracking_number: string;
  product_name: string;
  product_model: string;
  serial_number: string;
  quantity: number;
  purchase_date: string;
  purchase_location: string;
  return_reason: string;
  issue_description: string;
}>({
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  order_number: '',
  po_number: '',
  tracking_number: '',
  product_name: '',
  product_model: '',
  serial_number: '',
  quantity: 1,
  purchase_date: '',
  purchase_location: '',
  return_reason: '',
  issue_description: ''
})

const errors = reactive<{
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_name: string;
  quantity: string;
  return_reason: string;
  issue_description: string;
}>({
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  product_name: '',
  quantity: '',
  return_reason: '',
  issue_description: ''
})

const submitRequest = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    const response = await store.dispatch('rma/createRequest', form)
    rmaNumber.value = response.rmaNumber
    successMessage.value = true
    toast.success('RMA application submitted successfully!')
  } catch (error: any) {
    toast.error(error.message || 'RMA application submission failed')
  } finally {
    loading.value = false
  }
}

const validateForm = () => {
  let isValid = true
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  // Validate required fields
  if (!form.customer_name.trim()) {
    errors.customer_name = 'Please enter name'
    isValid = false
  }
  
  if (!form.customer_email.trim()) {
    errors.customer_email = 'Please enter email'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.customer_email)) {
    errors.customer_email = 'Please enter a valid email address'
    isValid = false
  }
  
  if (!form.product_name.trim()) {
    errors.product_name = 'Please enter product name'
    isValid = false
  }
  
  if (!form.quantity || form.quantity < 1) {
    errors.quantity = 'Quantity must be greater than 0'
    isValid = false
  }
  
  if (!form.return_reason) {
    errors.return_reason = 'Please select return reason'
    isValid = false
  }
  
  if (!form.issue_description.trim()) {
    errors.issue_description = 'Please enter problem description'
    isValid = false
  } else if (form.issue_description.length < 10) {
    errors.issue_description = 'Problem description must be at least 10 characters'
    isValid = false
  }

  return isValid
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
}

const addFiles = (files: File[]) => {
  const validFiles = files.filter(file => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'video/mp4', 'video/avi', 'video/quicktime']
    const maxSize = 10 * 1024 * 1024 // 10MB
    
    if (!validTypes.includes(file.type)) {
      toast.error(`${file.name} file format not supported`)
      return false
    }
    
    if (file.size > maxSize) {
      toast.error(`${file.name} file size exceeds 10MB`)
      return false
    }
    
    return true
  })

  if (selectedFiles.value.length + validFiles.length > 5) {
    toast.error('Maximum 5 files can be uploaded')
    return
  }

  selectedFiles.value.push(...validFiles)
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const goToStatus = () => {
  successMessage.value = false
  router.push(`/status/${rmaNumber.value}`)
}

const resetForm = () => {
  successMessage.value = false
  // Reset form values
  form.customer_name = ''
  form.customer_email = ''
  form.customer_phone = ''
  form.order_number = ''
  form.po_number = ''
  form.tracking_number = ''
  form.product_name = ''
  form.product_model = ''
  form.serial_number = ''
  form.quantity = 1
  form.purchase_date = ''
  form.purchase_location = ''
  form.return_reason = ''
  form.issue_description = ''
  
  selectedFiles.value = []
  rmaNumber.value = ''
}
</script>

<style scoped>
.file-upload-area {
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-upload-area:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

.file-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 0.375rem;
}

.file-info {
  flex: 1;
  margin-left: 0.5rem;
}

.file-name {
  font-weight: 500;
  margin-bottom: 0.2rem;
}

.file-size {
  font-size: 0.8rem;
  color: #6c757d;
}

.modal.show {
  display: block;
}
</style>