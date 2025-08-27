<template>
  <div class="home">
    <div class="hero-section bg-primary text-white py-5 mb-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold mb-4">Welcome to KN-RMA System</h1>
            <p class="lead mb-4">Professional electronic product return management platform, providing fast and convenient RMA services</p>
            <div class="d-grid gap-2 d-md-flex">
              <router-link to="/request" class="btn btn-light btn-lg px-4 me-md-2">
                <i class="fas fa-plus-circle me-2"></i>Submit RMA
              </router-link>
              <router-link to="/status" class="btn btn-outline-light btn-lg px-4">
                <i class="fas fa-search me-2"></i>Check Status
              </router-link>
            </div>
          </div>
          <div class="col-lg-6">
            <img src="/images/rma-hero.png" alt="RMA Service" class="img-fluid">
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-lg-4 mb-4">
          <div class="card h-100 text-center">
            <div class="card-body">
              <div class="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                <i class="fas fa-file-alt fa-2x"></i>
              </div>
              <h4 class="card-title">Online Application</h4>
              <p class="card-text">Quickly fill out the RMA application form, upload related images and documents, and the system will automatically generate an RMA number</p>
              <router-link to="/request" class="btn btn-primary">Start Application</router-link>
            </div>
          </div>
        </div>

        <div class="col-lg-4 mb-4">
          <div class="card h-100 text-center">
            <div class="card-body">
              <div class="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                <i class="fas fa-search fa-2x"></i>
              </div>
              <h4 class="card-title">Real-time Query</h4>
              <p class="card-text">Enter your RMA number to check the application progress and stay updated on the processing status</p>
              <router-link to="/status" class="btn btn-success">Check Status</router-link>
            </div>
          </div>
        </div>

        <div class="col-lg-4 mb-4">
          <div class="card h-100 text-center">
            <div class="card-body">
              <div class="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                <i class="fas fa-envelope fa-2x"></i>
              </div>
              <h4 class="card-title">Email Notifications</h4>
              <p class="card-text">Automatic confirmation emails after submission and timely notifications when status changes</p>
              <a href="#" class="btn btn-info">Learn More</a>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-5">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">RMA Application Process</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-3 text-center mb-3">
                  <div class="step-icon bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style="width: 50px; height: 50px;">
                    <span class="fw-bold">1</span>
                  </div>
                  <h6>Submit Application</h6>
                  <p class="text-muted small">Fill in product information and problem description</p>
                </div>
                <div class="col-md-3 text-center mb-3">
                  <div class="step-icon bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style="width: 50px; height: 50px;">
                    <span class="fw-bold">2</span>
                  </div>
                  <h6>Review & Processing</h6>
                  <p class="text-muted small">Professional team reviews your application</p>
                </div>
                <div class="col-md-3 text-center mb-3">
                  <div class="step-icon bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style="width: 50px; height: 50px;">
                    <span class="fw-bold">3</span>
                  </div>
                  <h6>Status Update</h6>
                  <p class="text-muted small">Real-time processing progress updates</p>
                </div>
                <div class="col-md-3 text-center mb-3">
                  <div class="step-icon bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style="width: 50px; height: 50px;">
                    <span class="fw-bold">4</span>
                  </div>
                  <h6>Complete Processing</h6>
                  <p class="text-muted small">Issue resolved, process completed</p>
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
import { onMounted } from 'vue'

onMounted(() => {
  // Add any initialization logic here
})
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  margin-left: -15px;
  margin-right: -15px;
}

.step-icon {
  font-size: 1.2rem;
}

.card {
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

@media (max-width: 768px) {
  .hero-section {
    text-align: center;
  }
  
  .display-4 {
    font-size: 2rem;
  }
}
</style>